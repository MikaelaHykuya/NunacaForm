-- ============================================================
-- Nunaca Form Engine — PRODUCTION SCHEMA (Auth melalui PIN)
-- Jalankan di: Supabase Dashboard > SQL Editor > New query (Run)
-- Target: cuyiktzvgsyduhtmeoor.supabase.co
--
-- Model keamanan:
--   • Publik (anon): HANYA isi form (INSERT responses), subscribe
--     newsletter, dan membaca bentuk form / status publish.
--     Tidak bisa membaca atau mengubah data lead.
--   • Admin: login PIN → server memunculkan session Supabase Auth
--     (authenticated) → RLS memberi baca/hapus respons, daftar
--     newsletter, publish, dan simpan schema form.
--   • Counter & newsletter via SECURITY DEFINER functions.
--   • Fitur notifikasi email/WhatsApp dihapus → tabel notifications
--     dan settings DROPPED (sekalian hapus data lama).
-- Idempotent — aman dijalankan ulang.
-- ============================================================

-- ============================================================
-- TABEL
-- ============================================================

create table if not exists public.responses (
  id text primary key,
  workspace text not null,
  answers jsonb not null default '{}'::jsonb,
  hidden_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.form_schemas (
  workspace text primary key,
  schema jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.counters (
  workspace text primary key,
  views bigint not null default 0,
  starts bigint not null default 0
);

create table if not exists public.newsletter (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.published (
  workspace text primary key,
  published boolean not null default true
);

-- Fitur notifikasi email/WA sudah dihapus — bersihkan tabel lama
drop table if exists public.notifications;
drop table if exists public.settings;

-- ============================================================
-- INDEX
-- ============================================================

create index if not exists idx_responses_workspace_created
  on public.responses (workspace, created_at desc);

-- ============================================================
-- PRIVILEGE (default Supabase memberi anon/authenticated akses penuh;
-- dicabut dulu agar RLS jadi satu-satunya gerbang)
-- ============================================================

revoke all on public.responses from anon;
revoke all on public.form_schemas from anon;
revoke all on public.counters from anon, authenticated;
revoke all on public.newsletter from anon, authenticated;
revoke all on public.published from anon;

grant usage on schema public to anon, authenticated, service_role;

-- Grant presisi (RLS baru memfilter setelah privilege diberikan)
grant insert on public.responses to anon, authenticated;
grant select, update, delete on public.responses to authenticated;

grant select on public.form_schemas to anon, authenticated;
grant insert, update, delete on public.form_schemas to authenticated;

grant select on public.counters to authenticated;

grant select on public.newsletter to authenticated;

grant select on public.published to anon, authenticated;
grant insert, update, delete on public.published to authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.responses enable row level security;
alter table public.form_schemas enable row level security;
alter table public.counters enable row level security;
alter table public.newsletter enable row level security;
alter table public.published enable row level security;

-- ==== responses: publik HANYA mengisi, admin mengelola ======
drop policy if exists "anon full responses" on public.responses;
drop policy if exists "responden isi form" on public.responses;
drop policy if exists "admin kelola respons" on public.responses;
create policy "responden isi form" on public.responses
  for insert to anon, authenticated
  with check (true);
create policy "admin kelola respons" on public.responses
  for all to authenticated
  using (true) with check (true);

-- ==== form_schemas: publik baca bentuk form, admin yang ubah ===
drop policy if exists "publik baca skema" on public.form_schemas;
drop policy if exists "admin kelola skema" on public.form_schemas;
create policy "publik baca skema" on public.form_schemas
  for select to anon, authenticated
  using (true);
create policy "admin kelola skema" on public.form_schemas
  for all to authenticated
  using (true) with check (true);

-- ==== counters: admin baca, tulis lewat fungsi saja =========
drop policy if exists "anon full counters" on public.counters;
drop policy if exists "admin baca counter" on public.counters;
create policy "admin baca counter" on public.counters
  for select to authenticated
  using (true);

-- ==== newsletter: tidak ada akses langsung publik ============
drop policy if exists "anon full newsletter" on public.newsletter;
drop policy if exists "admin kelola newsletter" on public.newsletter;
create policy "admin kelola newsletter" on public.newsletter
  for all to authenticated
  using (true) with check (true);

-- ==== published: publik boleh TAHU status, admin yang ubah ===
drop policy if exists "anon full published" on public.published;
drop policy if exists "publik lihat status" on public.published;
drop policy if exists "admin ubah status" on public.published;
create policy "publik lihat status" on public.published
  for select to anon, authenticated
  using (true);
create policy "admin ubah status" on public.published
  for all to authenticated
  using (true) with check (true);

-- ============================================================
-- FUNGSI (SECURITY DEFINER)
-- ============================================================

-- Counter atomik: tidak ada race lintas perangkat
create or replace function public.increment_views(ws text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.counters (workspace, views) values (ws, 1)
  on conflict (workspace) do update set views = public.counters.views + 1;
$$;

create or replace function public.increment_starts(ws text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.counters (workspace, starts) values (ws, 1)
  on conflict (workspace) do update set starts = public.counters.starts + 1;
$$;

-- Newsletter: publik subscribe/unsubscribe tanpa akses tabel langsung
create or replace function public.subscribe_newsletter(em text)
returns boolean
language sql
security definer
set search_path = public
as $$
  with ins as (
    insert into public.newsletter (email) values (em)
    on conflict (email) do nothing
    returning 1
  )
  select exists (select 1 from ins);
$$;

create or replace function public.unsubscribe_newsletter(em text)
returns boolean
language sql
security definer
set search_path = public
as $$
  with del as (
    delete from public.newsletter where email = em
    returning 1
  )
  select exists (select 1 from del);
$$;

grant execute on function public.increment_views(text) to anon, authenticated;
grant execute on function public.increment_starts(text) to anon, authenticated;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;
grant execute on function public.unsubscribe_newsletter(text) to anon, authenticated;

-- ============================================================
-- CMS: BLOG & STUDI KASUS
-- ============================================================

create table if not exists public.blog_posts (
  slug text primary key,
  title text not null,
  category text not null default 'Blog',
  author text not null default 'Nunaca IT Team',
  author_role text not null default '',
  date text not null default '',
  read_time text not null default '',
  excerpt text not null default '',
  content jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.usecases (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  icon text not null default 'Sparkles',
  url text not null default '',
  sort_order int not null default 0
);

alter table public.usecases add column if not exists url text not null default '';

revoke all on public.blog_posts from anon, authenticated;
revoke all on public.usecases from anon, authenticated;

grant select on public.blog_posts to anon, authenticated;
grant select, insert, update, delete on public.blog_posts to authenticated;

grant select on public.usecases to anon, authenticated;
grant select, insert, update, delete on public.usecases to authenticated;

alter table public.blog_posts enable row level security;
alter table public.usecases enable row level security;

drop policy if exists "publik baca blog" on public.blog_posts;
drop policy if exists "admin kelola blog" on public.blog_posts;
create policy "publik baca blog" on public.blog_posts
  for select to anon, authenticated
  using (true);
create policy "admin kelola blog" on public.blog_posts
  for all to authenticated
  using (true) with check (true);

drop policy if exists "publik baca usecase" on public.usecases;
drop policy if exists "admin kelola usecase" on public.usecases;
create policy "publik baca usecase" on public.usecases
  for select to anon, authenticated
  using (true);
create policy "admin kelola usecase" on public.usecases
  for all to authenticated
  using (true) with check (true);

-- Seed awal: konten bawaan agar situs tetap utuh sebelum admin menambah sendiri
insert into public.blog_posts (slug, title, category, author, author_role, date, read_time, excerpt, content) values
('survei-kepuasan-beauty-bar', 'Bagaimana Beauty Bar Menaikkan Response Rate Survei 2x Lipat', 'Studi Kasus', 'Karin Prameswari', 'Head of Beauty Bar', '2026-08-20', '4 menit', 'Survei kepuasan pelanggan sering diabaikan karena terasa membosankan. Begini cara Nunaca Beauty Bar mengubah angka partisipasi lewat formulir bergaya percakapan.', '["Sebelum menggunakan Nunaca Form, tim Beauty Bar mengandalkan formulir kertas dan Google Forms untuk survei kepuasan. Hasilnya? Partisipasi nyaris nol — pelanggan enggan mengisi layar panjang dengan puluhan pertanyaan sekaligus.","Kunci perubahan dimulai dari prinsip \"one question per screen\". Setiap pertanyaan tampil sendirian di layar penuh, dengan transisi animasi yang mulus seperti sedang mengobrol dalam aplikasi chat. Responden tidak lagi merasa sedang \"mengerjakan tugas\".","Fitur keyboard shortcuts menjadi game-changer-nya. Pelanggan cukup menekan huruf A, B, atau C untuk menjawab pilihan ganda tanpa menyentuh mouse. Hal ini jauh lebih cepat di perangkat mobile yang digunakan mayoritas pengunjung.","Hasilnya, dalam tiga bulan pertama penerapan, response rate survei kepuasan naik hingga dua kali lipat. Bahkan banyak pelanggan yang memberi komentar positif soal tampilan form-nya di media sosial.","Yang terpenting, seluruh respons kini masuk otomatis ke dashboard admin dalam format yang tersusun rapi, lengkap dengan parameter UTM untuk mengetahui dari kanal mana pelanggan datang."]'::jsonb),
('logic-jump-rekomendasi-skincare', 'Membangun Kuis Rekomendasi Produk Tanpa Menulis Kode', 'Fitur', 'Rina Maharani', 'Nunaca Skincare Consultant', '2026-07-15', '5 menit', 'Kuis analisa kulit dengan percabangan logika (logic jump) yang dulu butuh developer, kini bisa dibuat lewat drag-and-drop dalam hitungan menit.', '["Kuis rekomendasi produk adalah salah satu konten dengan konversi tertinggi di industri skincare. Namun, membangunnya biasanya membutuhkan tim developer untuk menulis logika percabangan yang rumit.","Dengan Admin Builder Nunaca Form, prosesnya berubah total. Tim skincare cukup mendrag-and-drop pertanyaan, lalu memilih opsi \"lompat ke\" pada setiap jawaban. Sistem logic jump-nya menangani sisanya secara otomatis.","Contohnya: jika pelanggan memilih \"kulit berminyak\", kuis langsung melompat ke pertanyaan tentang perawatan pagi-hari. Jika memilih \"kering\", jalurnya berbeda sama sekali. Setiap responden hanya melihat pertanyaan yang relevan.","Hasil akhirnya adalah rekomendasi produk yang spesifik berdasarkan jawaban, tanpa responden harus mengisi 30 pertanyaan yang tidak relevan. Ini meningkatkan pengalaman sekaligus kualitas data yang masuk.","Fitur hidden fields juga aktif di sini. Parameter UTM di URL otomatis tersimpan sebagai metadata, sehingga tim marketing tahu kampanye mana yang menghasilkan prospek paling banyak."]'::jsonb),
('onboarding-agency-tanpa-pdf', 'Mengganti PDF Briefing dengan Formulir Interaktif untuk Onboarding Klien', 'Best Practice', 'Dimas Saputra', 'Operational Manager', '2026-06-02', '3 menit', 'File PDF briefing yang kaku membuat klien malas mengisi. Nunaca Agency beralih ke formulir percakapan dan proses onboarding jadi terasa jauh lebih profesional.', '["Setiap agensi kreatif pasti familiar dengan dokumen briefing — file PDF panjang yang dikirim ke klien dan dikembalikan dalam keadaan kosong separuh. Nunaca Agency mengalami hal yang sama.","Kami mengganti seluruh proses dengan formulir interaktif Nunaca Form. Pertanyaan disusun bertahap: mulai dari visi brand, target pasar, hingga preferensi visual. Setiap tahap tampil elegan satu per satu.","Klien tidak lagi \"mengisi formulir\", mereka merasa sedang berdiskusi terstruktur dengan tim strategist. Hasilnya, detail briefing yang diterima jauh lebih dalam dan lengkap dibanding era PDF.","Data langsung masuk ke dashboard admin dalam format JSONB yang siap diolah. Tim account manager hanya perlu membuka dashboard, tanpa mengetik ulang jawaban klien ke sistem lain.","Ini membuktikan bahwa alat yang sama — Nunaca Form — fleksibel digunakan untuk kebutuhan serius seperti onboarding klien, bukan hanya survei sederhana."]'::jsonb),
('tracking-utm-dan-lead', 'Memahami Sumber Lead dengan Hidden Fields & UTM Tracking', 'Analitik', 'Nunaca IT Team', 'Internal Engineering', '2026-05-10', '3 menit', 'Tidak semua pertanyaan harus ditanyakan kepada responden. Parameter URL bisa otomatis tersimpan sebagai hidden fields untuk menganalisis sumber trafik.', '["Salah satu pertanyaan yang paling sering muncul di tim marketing: \"lead ini datang dari mana?\" Dengan formulir statis, jawabannya biasanya hilang begitu saja.","Nunaca Form memiliki fitur hidden fields tracking. Ketika responden membuka link form dengan parameter UTM (misalnya ?utm_source=instagram&utm_campaign=lunch-promo), seluruh parameter tersebut otomatis tersimpan sebagai metadata respons.","Responden tidak melihat input tambahan apa pun. Mereka tidak harus menghabiskan waktu mengetik \"bagaimana Anda mengetahui kami?\" — sistem melakukannya di balik layar.","Di dashboard admin, setiap respons menampilkan parameter hidden fields tersebut. Tim bisa melihat distribusi source trafik, kampanye mana yang paling efektif, dan menghitung ROI promosi dengan akurat.","Fitur ini kami rekomendasikan untuk semua lini usaha yang aktif menjalankan promosi di media sosial atau marketplace — data atribusinya langsung tersedia sejak hari pertama."]'::jsonb)
on conflict (slug) do nothing;

insert into public.usecases (id, title, subtitle, description, icon, url, sort_order) values
('barbershop', 'Nunaca Barbershop', 'Reservasi Jadwal & Stylist', 'Gunakan fitur logic jump untuk memfilter layanan yang tersedia berdasarkan tukang cukur yang dipilih, lalu arahkan ke konfirmasi tanggal yang elegan.', 'Scissors', 'https://nunacagroupindonesia.com/nunaca-barbershop', 1),
('beauty_bar', 'Nunaca Beauty Bar', 'Survei Kepuasan Pelanggan', 'Tingkatkan response rate ulasan layanan kecantikan Anda dengan desain satu-layar-satu-pertanyaan yang interaktif dan tidak membosankan.', 'Sparkles', 'https://nunacagroupindonesia.com/nunaca-beauty-bar', 2),
('kids_spa', 'Nunaca Baby & Kids Spa', 'Booking Treatment Anak', 'Kumpulkan data usia anak, keluhan, dan jenis terapi secara bertahap agar orang tua merasa nyaman saat mendaftar tanpa melihat form panjang.', 'Baby', 'https://nunacagroupindonesia.com/nunaca-baby-kids-spa', 3),
('coffee', 'Nunaca Coffee & Pastry', 'Pre-Order Catering & Meja', 'Fasilitasi pemesanan rombongan, request khusus alergi makanan, hingga reservasi meja VIP melalui kuis dinamis yang terhubung ke CRM kafe.', 'Coffee', 'https://nunacagroupindonesia.com/nunaca-coffee-pastry', 4),
('agency', 'Nunaca Agency', 'Project Onboarding Klien', 'Ganti file PDF briefing yang kaku menjadi formulir interaktif. Dapatkan informasi detail seputar visi brand klien secara lebih terstruktur dan elegan.', 'Briefcase', 'https://nunacagroupindonesia.com/nunaca-agency', 5),
('skincare', 'Nunaca Skincare', 'Kuis Rekomendasi Produk', 'Buat kuis analisa jenis kulit (berminyak, kering, berjerawat). Gunakan logic jump untuk merekomendasikan paket skincare yang tepat di akhir form.', 'Droplets', 'https://nunacagroupindonesia.com/nunaca-skincare', 6),
('travel', 'Nunaca Travel', 'Pemesanan Paket Tour', 'Tangkap preferensi destinasi liburan, jumlah anggota keluarga, dan request khusus itinerary langsung masuk ke database travel agent.', 'Plane', 'https://nunacagroupindonesia.com/nunaca-travel', 7),
('butik', 'Nunaca Butik', 'Pre-Order & Custom Size', 'Kumpulkan detail ukuran baju, warna, dan catatan khusus secara interaktif seolah-olah pelanggan sedang berdiskusi langsung dengan desainer.', 'Shirt', 'https://nunacagroupindonesia.com/nunaca-butik', 8)
on conflict (id) do update set url = excluded.url, title = excluded.title, subtitle = excluded.subtitle, description = excluded.description, icon = excluded.icon;