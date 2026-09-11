import { FormSchema } from '../types/form';

export const mockForm: FormSchema = {
  id: 'form_nunaca_barbershop',
  title: 'Reservasi Nunaca Barbershop',
  welcomeScreen: {
    title: 'Halo dari Nunaca Barbershop',
    description: 'Bantu kami menyiapkan layanan terbaik untuk Anda. Silakan isi form singkat ini.',
    buttonText: 'Mulai Reservasi',
  },
  questions: [
    {
      id: 'q1_name',
      type: 'short_text',
      title: 'Siapa nama Anda?',
      description: 'Nama yang akan dipanggil oleh Capster kami.',
      required: true,
      nextQuestionId: 'q2_service',
    },
    {
      id: 'q2_service',
      type: 'multiple_choice',
      title: 'Halo {{q1_name}}! Layanan apa yang Anda inginkan hari ini?',
      description: 'Pilih layanan utama Anda.',
      required: true,
      options: [
        { id: 'opt_haircut', label: 'Cukur Rambut (Haircut)', shortcutKey: 'A', nextQuestionId: 'q3_haircut' },
        { id: 'opt_color', label: 'Pewarnaan Rambut', shortcutKey: 'B', nextQuestionId: 'q3_color' },
        { id: 'opt_shave', label: 'Cukur Jenggot (Shaving)', shortcutKey: 'C', nextQuestionId: 'q5_date' },
      ],
    },
    {
      id: 'q3_haircut',
      type: 'multiple_choice',
      title: 'Punya referensi Capster favorit?',
      description: 'Anda bisa memilih siapa yang akan menangani rambut Anda.',
      required: true,
      options: [
        { id: 'opt_cap1', label: 'Bro Dani (Spesialis Fade)', shortcutKey: 'A', nextQuestionId: 'q5_date' },
        { id: 'opt_cap2', label: 'Bro Rio (Spesialis Classic)', shortcutKey: 'B', nextQuestionId: 'q5_date' },
        { id: 'opt_cap3', label: 'Siapa saja boleh', shortcutKey: 'C', nextQuestionId: 'q5_date' },
      ],
    },
    {
      id: 'q3_color',
      type: 'multiple_choice',
      title: 'Warna apa yang sedang Anda incar?',
      description: 'Tim kami butuh info ini untuk menyiapkan bahannya.',
      required: true,
      options: [
        { id: 'opt_c1', label: 'Ash Grey', shortcutKey: 'A', nextQuestionId: 'q5_date' },
        { id: 'opt_c2', label: 'Platinum Blonde', shortcutKey: 'B', nextQuestionId: 'q5_date' },
        { id: 'opt_c3', label: 'Warna Natural', shortcutKey: 'C', nextQuestionId: 'q5_date' },
      ],
    },
    {
      id: 'q5_date',
      type: 'short_text',
      title: 'Kapan Anda berencana datang?',
      description: 'Ketikkan tanggal dan jam (Contoh: Besok jam 2 siang, atau 25 Agustus 14:00).',
      required: true,
      nextQuestionId: 'q6_whatsapp',
    },
    {
      id: 'q6_whatsapp',
      type: 'short_text',
      title: 'Nomor WhatsApp untuk konfirmasi?',
      description: 'Kami akan mengirimkan detail reservasi ke nomor ini.',
      required: true,
    },
  ],
  thankYouScreen: {
    title: 'Sampai Jumpa Nanti!',
    description: 'Reservasi Anda telah kami catat. Kursi sudah kami siapkan.',
  },
};