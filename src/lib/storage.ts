export interface FormResponse {
  id: string;
  workspace: string;
  answers: Record<string, string>;
  hiddenFields: Record<string, string>;
  createdAt: string;
}

import {
  supabase, genId,
  pushResponse, incrementCounter,
  pullResponses, pullNewsletter,
  pushNewsletter, removeNewsletterRemote,
  pullPublished, pushPublished, pullCounters, pullSchema,
  pushSchema, deleteResponseRemote, clearResponsesRemote,
} from './supabase';
import { FormSchema } from '@/types/form';

export interface NewsletterSubscriber {
  email: string;
  createdAt: string;
}

const VIEW_KEY = (w: string) => `nbs_views_${w}`;
const START_KEY = (w: string) => `nbs_starts_${w}`;
const RESPONSES_KEY = (w: string) => `nbs_responses_${w}`;
const NEWSLETTER_KEY = 'nbs_newsletter';
const PUBLISHED_KEY = (w: string) => `nbs_published_${w}`;
const SCHEMA_KEY = (w: string) => `nbs_form_schema_${w}`;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readCounter(key: string): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(key);
  const parsed = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function trackView(workspace: string) {
  const key = VIEW_KEY(workspace);
  writeJSON(key, readCounter(key) + 1);
  void incrementCounter(workspace, 'views');
}

export function trackStart(workspace: string) {
  const key = START_KEY(workspace);
  writeJSON(key, readCounter(key) + 1);
  void incrementCounter(workspace, 'starts');
}

export function getViews(workspace: string): number {
  return readCounter(VIEW_KEY(workspace));
}

export function getStarts(workspace: string): number {
  return readCounter(START_KEY(workspace));
}

export function getResponses(workspace: string): FormResponse[] {
  return readJSON<FormResponse[]>(RESPONSES_KEY(workspace), []);
}

export function submitResponse(payload: Omit<FormResponse, 'id' | 'createdAt'>) {
  const response: FormResponse = {
    ...payload,
    id: genId('resp'),
    createdAt: new Date().toISOString(),
  };

  const list = readJSON<FormResponse[]>(RESPONSES_KEY(payload.workspace), []);
  list.unshift(response);
  writeJSON(RESPONSES_KEY(payload.workspace), list);
  void pushResponse(response);

  return response;
}

export function deleteResponse(workspace: string, id: string) {
  const list = readJSON<FormResponse[]>(RESPONSES_KEY(workspace), []);
  writeJSON(
    RESPONSES_KEY(workspace),
    list.filter((r) => r.id !== id)
  );
  void deleteResponseRemote(id);
}

export function clearResponses(workspace: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(RESPONSES_KEY(workspace));
  void clearResponsesRemote(workspace);
}

export function isPublished(workspace: string): boolean {
  if (typeof window === 'undefined') return true;
  const raw = window.localStorage.getItem(PUBLISHED_KEY(workspace));
  return raw === null ? true : raw === 'true';
}

export function setPublished(workspace: string, published: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PUBLISHED_KEY(workspace), String(published));
  void pushPublished(workspace, published);
}

// ============================================================
// FORM SCHEMA — lokal sebagai cache, cloud sebagai sumber kebenaran
// ============================================================

export function getCachedSchema(workspace: string): FormSchema | null {
  const saved = readJSON<FormSchema | null>(SCHEMA_KEY(workspace), null);
  return saved;
}

export function saveSchema(workspace: string, schema: FormSchema) {
  writeJSON(SCHEMA_KEY(workspace), schema);
  void pushSchema(workspace, schema);
}

// ============================================================
// NEWSLETTER
// ============================================================

export function getNewsletterSubscribers(): NewsletterSubscriber[] {
  return readJSON<NewsletterSubscriber[]>(NEWSLETTER_KEY, []);
}

export function subscribeNewsletter(email: string): boolean {
  const list = readJSON<NewsletterSubscriber[]>(NEWSLETTER_KEY, []);
  if (list.some((s) => s.email.toLowerCase() === email.toLowerCase())) return false;
  list.unshift({ email, createdAt: new Date().toISOString() });
  writeJSON(NEWSLETTER_KEY, list);
  void pushNewsletter(email);
  return true;
}

export function removeSubscriber(email: string): boolean {
  const list = readJSON<NewsletterSubscriber[]>(NEWSLETTER_KEY, []);
  const next = list.filter((s) => s.email.toLowerCase() !== email.toLowerCase());
  if (next.length === list.length) return false;
  writeJSON(NEWSLETTER_KEY, next);
  void removeNewsletterRemote(email);
  return true;
}

export async function syncFromSupabase(workspace: string): Promise<void> {
  if (!supabase) return;

  // Fetch semua data paralel (schema di-skip — dihandle di form/page dengan getCachedSchema)
  const [remoteResponses, remoteNews, remotePublished, remoteCounters, remoteSchema] =
    await Promise.all([
      pullResponses(workspace),
      pullNewsletter(),
      pullPublished(workspace),
      pullCounters(workspace),
      pullSchema(workspace),  // tetap fetch untuk admin dashboard sync
    ]);

  // Respons — remote sebagai sumber kebenaran, tambahkan lokal yang belum ter-push
  const localResponses = getResponses(workspace);
  const remoteResponseIds = new Set(remoteResponses.map((r) => r.id));
  const mergedResponses: FormResponse[] = [
    ...remoteResponses.map((r) => ({
      id: r.id,
      workspace: r.workspace,
      answers: (r.answers as Record<string, string>) || {},
      hiddenFields: (r.hidden_fields as Record<string, string>) || {},
      createdAt: r.created_at,
    } as FormResponse)).filter((r) => r.id && r.createdAt),
    ...localResponses.filter((r) => !remoteResponseIds.has(r.id)),
  ];
  writeJSON(RESPONSES_KEY(workspace), mergedResponses);

  // Newsletter — union tanpa duplikat (case-insensitive)
  const localNews = getNewsletterSubscribers();
  const mergedNews = [...localNews];
  remoteNews.forEach((r) => {
    if (!localNews.some((s) => s.email.toLowerCase() === r.email.toLowerCase())) {
      mergedNews.push({ email: r.email, createdAt: r.created_at });
    }
  });
  writeJSON(NEWSLETTER_KEY, mergedNews);

  // Publish status
  if (remotePublished !== null) writeJSON(PUBLISHED_KEY(workspace), remotePublished);

  // Counters
  if (remoteCounters) {
    writeJSON(VIEW_KEY(workspace), remoteCounters.views);
    writeJSON(START_KEY(workspace), remoteCounters.starts);
  }

  // Schema — tulis ke localStorage agar getCachedSchema bisa serve halaman form tanpa refetch
  if (remoteSchema) writeJSON(SCHEMA_KEY(workspace), remoteSchema);
}

export const WORKSPACE_LABELS: Record<string, string> = {
  barbershop: 'Nunaca Barbershop',
  beauty_bar: 'Nunaca Beauty Bar',
  kids_spa: 'Nunaca Baby & Kids Spa',
  coffee: 'Nunaca Coffee & Pastry',
  agency: 'Nunaca Agency',
  skincare: 'Nunaca Skincare',
  travel: 'Nunaca Travel',
  butik: 'Nunaca Butik',
};