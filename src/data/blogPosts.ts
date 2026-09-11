export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'survei-kepuasan-beauty-bar',
    title: 'Bagaimana Beauty Bar Menaikkan Response Rate Survei 2x Lipat',
    category: 'Studi Kasus',
    author: 'Karin Prameswari',
    authorRole: 'Head of Beauty Bar',
    date: '2026-08-20',
    readTime: '4 menit',
    excerpt:
      'Survei kepuasan pelanggan sering diabaikan karena terasa membosankan. Begini cara Nunaca Beauty Bar mengubah angka partisipasi lewat formulir bergaya percakapan.',
    content: [
      'Sebelum menggunakan Nunaca Form, tim Beauty Bar mengandalkan formulir kertas dan Google Forms untuk survei kepuasan. Hasilnya? Partisipasi nyaris nol — pelanggan enggan mengisi layar panjang dengan puluhan pertanyaan sekaligus.',
      'Kunci perubahan dimulai dari prinsip "one question per screen". Setiap pertanyaan tampil sendirian di layar penuh, dengan transisi animasi yang mulus seperti sedang mengobrol dalam aplikasi chat. Responden tidak lagi merasa sedang "mengerjakan tugas".',
      'Fitur keyboard shortcuts menjadi game-changer-nya. Pelanggan cukup menekan huruf A, B, atau C untuk menjawab pilihan ganda tanpa menyentuh mouse. Hal ini jauh lebih cepat di perangkat mobile yang digunakan mayoritas pengunjung.',
      'Hasilnya, dalam tiga bulan pertama penerapan, response rate survei kepuasan naik hingga dua kali lipat. Bahkan banyak pelanggan yang memberi komentar positif soal tampilan form-nya di media sosial.',
      'Yang terpenting, seluruh respons kini masuk otomatis ke dashboard admin dalam format yang tersusun rapi, lengkap dengan parameter UTM untuk mengetahui dari kanal mana pelanggan datang.',
    ],
  },
  {
    slug: 'logic-jump-rekomendasi-skincare',
    title: 'Membangun Kuis Rekomendasi Produk Tanpa Menulis Kode',
    category: 'Fitur',
    author: 'Rina Maharani',
    authorRole: 'Nunaca Skincare Consultant',
    date: '2026-07-15',
    readTime: '5 menit',
    excerpt:
      'Kuis analisa kulit dengan percabangan logika (logic jump) yang dulu butuh developer, kini bisa dibuat lewat drag-and-drop dalam hitungan menit.',
    content: [
      'Kuis rekomendasi produk adalah salah satu konten dengan konversi tertinggi di industri skincare. Namun, membangunnya biasanya membutuhkan tim developer untuk menulis logika percabangan yang rumit.',
      'Dengan Admin Builder Nunaca Form, prosesnya berubah total. Tim skincare cukup mendrag-and-drop pertanyaan, lalu memilih opsi "lompat ke" pada setiap jawaban. Sistem logic jump-nya menangani sisanya secara otomatis.',
      'Contohnya: jika pelanggan memilih "kulit berminyak", kuis langsung melompat ke pertanyaan tentang perawatan pagi-hari. Jika memilih "kering", jalurnya berbeda sama sekali. Setiap responden hanya melihat pertanyaan yang relevan.',
      'Hasil akhirnya adalah rekomendasi produk yang spesifik berdasarkan jawaban, tanpa responden harus mengisi 30 pertanyaan yang tidak relevan. Ini meningkatkan pengalaman sekaligus kualitas data yang masuk.',
      'Fitur hidden fields juga aktif di sini. Parameter UTM di URL otomatis tersimpan sebagai metadata, sehingga tim marketing tahu kampanye mana yang menghasilkan prospek paling banyak.',
    ],
  },
  {
    slug: 'onboarding-agency-tanpa-pdf',
    title: 'Mengganti PDF Briefing dengan Formulir Interaktif untuk Onboarding Klien',
    category: 'Best Practice',
    author: 'Dimas Saputra',
    authorRole: 'Operational Manager',
    date: '2026-06-02',
    readTime: '3 menit',
    excerpt:
      'File PDF briefing yang kaku membuat klien malas mengisi. Nunaca Agency beralih ke formulir percakapan dan proses onboarding jadi terasa jauh lebih profesional.',
    content: [
      'Setiap agensi kreatif pasti familiar dengan dokumen briefing — file PDF panjang yang dikirim ke klien dan dikembalikan dalam keadaan kosong separuh. Nunaca Agency mengalami hal yang sama.',
      'Kami mengganti seluruh proses dengan formulir interaktif Nunaca Form. Pertanyaan disusun bertahap: mulai dari visi brand, target pasar, hingga preferensi visual. Setiap tahap tampil elegan satu per satu.',
      'Klien tidak lagi "mengisi formulir", mereka merasa sedang berdiskusi terstruktur dengan tim strategist. Hasilnya, detail briefing yang diterima jauh lebih dalam dan lengkap dibanding era PDF.',
      'Data langsung masuk ke dashboard admin dalam format JSONB yang siap diolah. Tim account manager hanya perlu membuka dashboard, tanpa mengetik ulang jawaban klien ke sistem lain.',
      'Ini membuktikan bahwa alat yang sama — Nunaca Form — fleksibel digunakan untuk kebutuhan serius seperti onboarding klien, bukan hanya survei sederhana.',
    ],
  },
  {
    slug: 'tracking-utm-dan-lead',
    title: 'Memahami Sumber Lead dengan Hidden Fields & UTM Tracking',
    category: 'Analitik',
    author: 'Nunaca IT Team',
    authorRole: 'Internal Engineering',
    date: '2026-05-10',
    readTime: '3 menit',
    excerpt:
      'Tidak semua pertanyaan harus ditanyakan kepada responden. Parameter URL bisa otomatis tersimpan sebagai hidden fields untuk menganalisis sumber trafik.',
    content: [
      'Salah satu pertanyaan yang paling sering muncul di tim marketing: "lead ini datang dari mana?" Dengan formulir statis, jawabannya biasanya hilang begitu saja.',
      'Nunaca Form memiliki fitur hidden fields tracking. Ketika responden membuka link form dengan parameter UTM (misalnya ?utm_source=instagram&utm_campaign=lunch-promo), seluruh parameter tersebut otomatis tersimpan sebagai metadata respons.',
      'Responden tidak melihat input tambahan apa pun. Mereka tidak harus menghabiskan waktu mengetik "bagaimana Anda mengetahui kami?" — sistem melakukannya di balik layar.',
      'Di dashboard admin, setiap respons menampilkan parameter hidden fields tersebut. Tim bisa melihat distribusi source trafik, kampanye mana yang paling efektif, dan menghitung ROI promosi dengan akurat.',
      'Fitur ini kami rekomendasikan untuk semua lini usaha yang aktif menjalankan promosi di media sosial atau marketplace — data atribusinya langsung tersedia sejak hari pertama.',
    ],
  },
];