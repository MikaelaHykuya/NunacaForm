import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url, anonKey)
  : null;

export interface RemoteResponseRow {
  id: string;
  workspace: string;
  answers: Record<string, string>;
  hidden_fields: Record<string, string>;
  created_at: string;
}

export function genId(prefix: string): string {
  try {
    const uuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}_${uuid}`;
  } catch {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// ============================================================
// RESPONSES
// ============================================================

export async function pushResponse(row: {
  id: string;
  workspace: string;
  answers: Record<string, string>;
  hiddenFields: Record<string, string>;
}): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('responses').insert({
    id: row.id,
    workspace: row.workspace,
    answers: row.answers,
    hidden_fields: row.hiddenFields,
  });
  return !error;
}

export async function pullResponses(workspace: string): Promise<RemoteResponseRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('responses')
    .select('id, workspace, answers, hidden_fields, created_at')
    .eq('workspace', workspace)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error || !data) return [];
  return data as RemoteResponseRow[];
}

export async function deleteResponseRemote(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('responses').delete().eq('id', id);
  return !error;
}

export async function clearResponsesRemote(workspace: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('responses').delete().eq('workspace', workspace);
  return !error;
}

// ============================================================
// COUNTERS (via SECURITY DEFINER functions)
// ============================================================

export async function incrementCounter(workspace: string, kind: 'views' | 'starts'): Promise<void> {
  if (!supabase) return;
  await supabase.rpc(`increment_${kind}`, { ws: workspace });
}

export async function pullCounters(workspace: string): Promise<{ views: number; starts: number } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('counters')
    .select('views, starts')
    .eq('workspace', workspace)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { views?: number; starts?: number };
  return { views: Number(row.views) || 0, starts: Number(row.starts) || 0 };
}

// ============================================================
// FORM SCHEMA (editor menyimpan → responden mengambil)
// ============================================================

export async function pullSchema(workspace: string): Promise<unknown | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('form_schemas')
    .select('schema')
    .eq('workspace', workspace)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { schema?: unknown }).schema ?? null;
}

export async function pushSchema(workspace: string, schema: unknown): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('form_schemas')
    .upsert({ workspace, schema, updated_at: new Date().toISOString() }, { onConflict: 'workspace' });
  return !error;
}

// ============================================================
// NEWSLETTER (via SECURITY DEFINER functions)
// ============================================================

export async function pullNewsletter(): Promise<{ email: string; created_at: string }[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('newsletter').select('email, created_at');
  if (error || !data) return [];
  return data as { email: string; created_at: string }[];
}

export async function pushNewsletter(email: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('subscribe_newsletter', { em: email });
  return !error && data === true;
}

export async function removeNewsletterRemote(email: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('unsubscribe_newsletter', { em: email });
  return !error && data === true;
}

// ============================================================
// PUBLISH STATUS
// ============================================================

export async function pullPublished(workspace: string): Promise<boolean | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('published')
    .select('published')
    .eq('workspace', workspace)
    .maybeSingle();
  if (error || !data) return null;
  return Boolean((data as { published?: boolean }).published);
}

export async function pushPublished(workspace: string, published: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('published')
    .upsert({ workspace, published }, { onConflict: 'workspace' });
  return !error;
}

// ============================================================
// CMS — BLOG POSTS
// ============================================================

export interface BlogPostRow {
  slug: string;
  title: string;
  category: string;
  author: string;
  author_role: string;
  date: string;
  read_time: string;
  excerpt: string;
  content: string[];
}

export async function pullBlogPosts(): Promise<BlogPostRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, title, category, author, author_role, date, read_time, excerpt, content')
    .order('date', { ascending: false });
  if (error || !data) return [];
  return data as BlogPostRow[];
}

export async function pullBlogPost(slug: string): Promise<BlogPostRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, title, category, author, author_role, date, read_time, excerpt, content')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as BlogPostRow;
}

export async function pushBlogPost(post: BlogPostRow): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('blog_posts')
    .upsert({ ...post, updated_at: new Date().toISOString() }, { onConflict: 'slug' });
  return !error;
}

export async function deleteBlogPostRemote(slug: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('blog_posts').delete().eq('slug', slug);
  return !error;
}

// ============================================================
// CMS — USE CASES (STUDI KASUS)
// ============================================================

export interface UseCaseRow {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  sort_order: number;
}

export async function pullUseCases(): Promise<UseCaseRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('usecases')
    .select('id, title, subtitle, description, icon, sort_order')
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data as UseCaseRow[];
}

export async function pushUseCase(item: UseCaseRow): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('usecases').upsert(item, { onConflict: 'id' });
  return !error;
}

export async function deleteUseCaseRemote(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('usecases').delete().eq('id', id);
  return !error;
}