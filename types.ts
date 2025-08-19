
export interface User {
  id: number;
  nama: string;
  email: string;
  role: 'guru' | 'murid';
}

export interface MataPelajaran {
  id: number;
  nama_mapel: string;
  deskripsi: string;
  tingkat_kesulitan: string;
  guru_id: number;
  guru_nama: string;
  created_at: string;
}

export interface Materi {
  id: number;
  judul: string;
  konten: string;
  mata_pelajaran_id: number;
  nama_mapel: string;
  created_at: string;
}

export interface Soal {
  id?: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  jawaban_benar: 'A' | 'B' | 'C' | 'D';
}

export interface Quiz {
  id: number;
  judul: string;
  mata_pelajaran_id: number;
  nama_mapel: string;
  created_at: string;
  soal?: Soal[];
  score: number | null;
  jawaban_benar: number | null;
  total_soal: number | null;
}

export interface PendingMurid {
  id: number;
  nama: string;
  email: string;
  kelas: string;
  created_at: string;
}

export interface Recommendation {
  recommended_level: string;
  current_average_score: number;
  recommended_subjects: MataPelajaran[];
  message: string;
}

export interface Preferensi {
  id?: number;
  murid_id?: number;
  mata_pelajaran_favorit: string;
  gaya_belajar: 'Visual' | 'Audio' | 'Kinestetik' | '';
  minat_bidang: string;
}

export interface HasilQuiz {
  id: number;
  murid_nama: string;
  kelas: string;
  nama_mapel: string;
  score: number;
  jawaban_benar: number;
  total_soal: number;
  created_at: string;
}

export interface StatistikNilai {
  nama_mapel: string;
  jumlah_quiz: number;
  rata_rata: number;
  nilai_min: number;
  nilai_max: number;
}

export interface MuridDetail {
  id: number;
  nama: string;
  email: string;
  kelas: string;
  mata_pelajaran_favorit: string | null;
  gaya_belajar: string | null;
  minat_bidang: string | null;
}

export interface QuizResultDetail {
    message: string;
    score?: number;
    jawaban_benar?: number;
    total_soal?: number;
    submitted_at?: string;
}
