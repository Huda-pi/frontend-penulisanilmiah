import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { MataPelajaran, Materi, Quiz, Soal, PendingMurid, HasilQuiz, StatistikNilai, MuridDetail } from '../types';
import { Button, Card, CardContent, CardHeader, Input, Modal, Select, Spinner } from './ui';
import { ICONS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

type Tab = 'pending' | 'murid' | 'subjects' | 'materials' | 'quizzes' | 'scores';

// Main Component
export const GuruDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('pending');

    const renderContent = () => {
        switch (activeTab) {
            case 'pending': return <PendingMuridList />;
            case 'murid': return <MuridList />;
            case 'subjects': return <SubjectsManager />;
            case 'materials': return <MaterialsManager />;
            case 'quizzes': return <QuizzesManager />;
            case 'scores': return <StudentScores />;
            default: return null;
        }
    };

    const TabButton: React.FC<{tabName: Tab, label: string, icon: React.ReactNode}> = ({tabName, label, icon}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tabName ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dasbor Guru</h1>
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton tabName="pending" label="Murid Tertunda" icon={ICONS.userCheck} />
                    <TabButton tabName="murid" label="Daftar Murid" icon={ICONS.users} />
                    <TabButton tabName="subjects" label="Mata Pelajaran" icon={ICONS.bookOpen} />
                    <TabButton tabName="materials" label="Materi" icon={ICONS.fileText} />
                    <TabButton tabName="quizzes" label="Kuis" icon={ICONS.puzzle} />
                    <TabButton tabName="scores" label="Nilai & Statistik" icon={ICONS.award} />
                </nav>
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};


// Pending Murid Component
const PendingMuridList: React.FC = () => {
    const [murid, setMurid] = useState<PendingMurid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPendingMurid = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiService.get<{ data: PendingMurid[] }>('/api/guru/murid-pending');
            setMurid(res.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingMurid();
    }, [fetchPendingMurid]);

    const handleVerify = async (id: number) => {
        try {
            await apiService.put(`/api/guru/verify-murid/${id}`);
            setMurid(murid.filter(m => m.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <Card>
            <CardHeader><h2 className="text-xl font-semibold">Verifikasi Murid Tertunda</h2></CardHeader>
            <CardContent>
                {murid.length === 0 ? <p className="text-slate-500 dark:text-slate-400">Tidak ada murid yang tertunda.</p> : (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {murid.map(m => (
                            <li key={m.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{m.nama}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{m.email} - Kelas: {m.kelas}</p>
                                </div>
                                <Button onClick={() => handleVerify(m.id)}>Verifikasi</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

// Murid List Component
const MuridList: React.FC = () => {
    const [muridList, setMuridList] = useState<MuridDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMurid = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiService.get<{ data: MuridDetail[] }>('/api/guru/murid');
            setMuridList(res.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMurid();
    }, [fetchMurid]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <Card>
            <CardHeader><h2 className="text-xl font-semibold">Daftar Murid Anda</h2></CardHeader>
            <CardContent>
                {muridList.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-center py-8">Anda belum memverifikasi murid manapun.</p> : (
                    <div className="overflow-x-auto relative">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nama</th>
                                    <th scope="col" className="px-6 py-3">Kelas</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Preferensi Belajar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {muridList.map(m => (
                                    <tr key={m.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{m.nama}</td>
                                        <td className="px-6 py-4">{m.kelas}</td>
                                        <td className="px-6 py-4">{m.email}</td>
                                        <td className="px-6 py-4">
                                            {(m.mata_pelajaran_favorit || m.gaya_belajar || m.minat_bidang) ? (
                                                <ul className="list-disc list-inside text-xs space-y-1">
                                                    {m.mata_pelajaran_favorit && <li><strong>Favorit:</strong> {m.mata_pelajaran_favorit}</li>}
                                                    {m.gaya_belajar && <li><strong>Gaya:</strong> {m.gaya_belajar}</li>}
                                                    {m.minat_bidang && <li><strong>Minat:</strong> {m.minat_bidang}</li>}
                                                </ul>
                                            ) : <span className="text-slate-400 italic">Belum diisi</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Subjects Manager Component
const SubjectsManager: React.FC = () => {
    const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<MataPelajaran | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        const res = await apiService.get<{data: MataPelajaran[]}>('/api/guru/mata-pelajaran');
        setSubjects(res.data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        await apiService.post('/api/guru/mata-pelajaran', data);
        fetchSubjects();
        setIsModalOpen(false);
    };

    const openDeleteModal = (subject: MataPelajaran) => {
        setSubjectToDelete(subject);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setSubjectToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteSubject = async () => {
        if (!subjectToDelete) return;
        setIsDeleting(true);
        try {
            await apiService.delete(`/api/guru/mata-pelajaran/${subjectToDelete.id}`);
            setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
        } catch (error) {
            console.error("Failed to delete subject:", error);
            // Optionally, show an error toast to the user
        } finally {
            setIsDeleting(false);
            closeDeleteModal();
        }
    };


    if (loading) return <Spinner />;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsModalOpen(true)}><span className="mr-2">{ICONS.plusCircle}</span>Tambah Mata Pelajaran</Button>
            </div>
            {subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(s => (
                        <Card key={s.id}>
                            <CardHeader className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 pr-2">{s.nama_mapel}</h3>
                                <Button variant="ghost" className="!p-1 h-auto text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 flex-shrink-0" onClick={() => openDeleteModal(s)}>
                                    <span className="sr-only">Hapus {s.nama_mapel}</span>
                                    <span className="w-5 h-5">{ICONS.trash}</span>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 dark:text-slate-300 text-sm h-10 line-clamp-2">{s.deskripsi}</p>
                                <span className="mt-4 inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{s.tingkat_kesulitan}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : <p className="text-center text-slate-500 dark:text-slate-400 py-8">Belum ada mata pelajaran yang dibuat. Klik "Tambah Mata Pelajaran" untuk memulai.</p>}
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Mata Pelajaran Baru">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <Input name="nama_mapel" placeholder="Nama Mata Pelajaran" required/>
                    <Input name="deskripsi" placeholder="Deskripsi" required/>
                    <Select name="tingkat_kesulitan" defaultValue="Pemula">
                        <option>Pemula</option>
                        <option>Menengah</option>
                        <option>Lanjut</option>
                    </Select>
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Buat Mata Pelajaran</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Konfirmasi Hapus">
                <div>
                    <p className="text-slate-700 dark:text-slate-300">
                        Anda yakin ingin menghapus mata pelajaran <strong>{subjectToDelete?.nama_mapel}</strong>?
                    </p>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                        Tindakan ini akan menghapus semua materi, kuis, dan nilai siswa yang terkait secara permanen. Tindakan ini <strong>tidak dapat diurungkan</strong>.
                    </p>
                    <div className="flex justify-end space-x-3 pt-5">
                        <Button variant="secondary" onClick={closeDeleteModal}>Batal</Button>
                        <Button variant="danger" onClick={handleDeleteSubject} isLoading={isDeleting}>
                            Ya, Hapus
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// AI Material Generator Modal
const AIMaterialGeneratorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    subjects: MataPelajaran[];
    onMaterialGenerated: (data: { judul: string; konten: string; mata_pelajaran_id: string }) => void;
}> = ({ isOpen, onClose, subjects, onMaterialGenerated }) => {
    const [topic, setTopic] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!subjectId || !topic) {
            setError('Silakan pilih mata pelajaran dan masukkan topik.');
            return;
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setError('API Key untuk Gemini tidak ditemukan.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey });
            const subjectName = subjects.find(s => s.id === parseInt(subjectId, 10))?.nama_mapel || '';

            const prompt = `Anda adalah seorang guru ahli yang bertugas membuat materi pembelajaran yang jelas dan ringkas. Buatkan draf materi untuk mata pelajaran "${subjectName}" dengan topik "${topic}". Buatlah judul yang menarik dan konten yang informatif dan mudah dipahami.`;

            const materialSchema = {
                type: Type.OBJECT,
                properties: {
                    judul: { type: Type.STRING, description: "Judul materi yang menarik dan relevan." },
                    konten: { type: Type.STRING, description: "Isi konten materi pembelajaran yang lengkap dan terstruktur." }
                },
                required: ["judul", "konten"]
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: materialSchema,
                },
            });

            const generatedData = JSON.parse(response.text);
            onMaterialGenerated({ ...generatedData, mata_pelajaran_id: subjectId });
            onClose();

        } catch (err: any) {
            console.error("Gemini API Error:", err);
            setError('Gagal membuat materi. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setTopic('');
            setSubjectId('');
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Materi dengan AI">
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Pilih mata pelajaran dan masukkan topik, AI akan membantu Anda membuat draf materi.
                </p>
                <Select
                    label="Pilih Mata Pelajaran"
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                >
                    <option value="">-- Pilih --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                </Select>
                <Input
                    label="Topik Materi"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Contoh: Pengenalan Fotosintesis"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end pt-2">
                    <Button onClick={handleGenerate} isLoading={isLoading} disabled={!subjectId || !topic || isLoading}>
                        <span className="mr-2">{ICONS.sparkles}</span> Buat Materi
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


// Materials Manager Component
const MaterialsManager: React.FC = () => {
    const [materials, setMaterials] = useState<Materi[]>([]);
    const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Controlled form state
    const [newMaterial, setNewMaterial] = useState({
        judul: '',
        konten: '',
        mata_pelajaran_id: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [materiRes, subjectRes] = await Promise.all([
            apiService.get<{data: Materi[]}>('/api/guru/materi'),
            apiService.get<{data: MataPelajaran[]}>('/api/guru/mata-pelajaran')
        ]);
        setMaterials(materiRes.data);
        setSubjects(subjectRes.data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewMaterial(prev => ({ ...prev, [name]: value }));
    };
    
    const resetForm = () => {
        setNewMaterial({ judul: '', konten: '', mata_pelajaran_id: '' });
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await apiService.post('/api/guru/materi', newMaterial);
        fetchData();
        setIsModalOpen(false);
        resetForm();
    };

    const handleMaterialGenerated = (data: { judul: string; konten: string; mata_pelajaran_id: string }) => {
        setNewMaterial(data);
        setIsAIModalOpen(false);
        setIsModalOpen(true);
    };

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="flex justify-end items-center gap-2 mb-4">
                 <Button variant="secondary" onClick={() => setIsAIModalOpen(true)} disabled={subjects.length === 0}>
                    <span className="mr-2">{ICONS.sparkles}</span>Buat dengan AI
                </Button>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }} disabled={subjects.length === 0}>
                    <span className="mr-2">{ICONS.plusCircle}</span>Tambah Materi
                </Button>
            </div>
             {subjects.length === 0 && <p className="text-center text-sm text-amber-600 dark:text-amber-400 mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">Harap buat mata pelajaran terlebih dahulu sebelum menambahkan materi.</p>}
            <Card>
                <CardContent>
                    {materials.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {materials.map(m => (
                                <li key={m.id} className="py-3">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{m.judul}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Mata Pelajaran: {m.nama_mapel}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-slate-500 dark:text-slate-400 py-8">Belum ada materi yang ditambahkan.</p>}
                </CardContent>
            </Card>
            <AIMaterialGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                subjects={subjects}
                onMaterialGenerated={handleMaterialGenerated}
            />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Materi Baru">
                 <form onSubmit={handleFormSubmit} className="space-y-4">
                    <Input name="judul" placeholder="Judul Materi" value={newMaterial.judul} onChange={handleInputChange} required />
                    <Input name="konten" placeholder="Konten Materi (bisa berupa teks, tautan, dll.)" value={newMaterial.konten} onChange={handleInputChange} required />
                    <Select name="mata_pelajaran_id" value={newMaterial.mata_pelajaran_id} onChange={handleInputChange} required>
                        <option value="">Pilih Mata Pelajaran</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                    </Select>
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Buat Materi</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// AI Quiz Generator Modal Component
const AIQuizGeneratorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    subjects: MataPelajaran[];
    materials: Materi[];
    onQuizGenerated: (generatedSoal: Soal[], subjectId: string, subjectName: string) => void;
}> = ({ isOpen, onClose, subjects, materials, onQuizGenerated }) => {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const subjectsWithMaterials = subjects.filter(s => materials.some(m => m.mata_pelajaran_id === s.id));

    const handleGenerate = async () => {
        if (!selectedSubject) {
            setError('Silakan pilih mata pelajaran.');
            return;
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setError('API Key untuk Gemini tidak ditemukan.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey });
            const subjectId = parseInt(selectedSubject, 10);
            const subjectName = subjects.find(s => s.id === subjectId)?.nama_mapel || '';
            const relevantMaterials = materials.filter(m => m.mata_pelajaran_id === subjectId);
            const materialContent = relevantMaterials.map(m => `Judul: ${m.judul}\nKonten: ${m.konten}`).join('\n\n---\n\n');

            const prompt = `Anda adalah asisten ahli dalam membuat soal kuis untuk platform e-learning. Berdasarkan materi berikut dari mata pelajaran "${subjectName}", buatlah ${numQuestions} soal kuis pilihan ganda (A, B, C, D) yang relevan dan mendidik. Pastikan setiap soal menguji pemahaman konsep-konsep kunci dari materi. Pastikan jawaban_benar hanya berisi salah satu dari 'A', 'B', 'C', atau 'D'.

Materi:
${materialContent}

Berikan jawaban dalam format JSON yang valid.`;
            
            const quizSchema = {
                type: Type.OBJECT,
                properties: {
                    soal: {
                        type: Type.ARRAY,
                        description: `Array dari ${numQuestions} soal kuis.`,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                pertanyaan: { type: Type.STRING, description: "Teks pertanyaan kuis." },
                                pilihan_a: { type: Type.STRING, description: "Pilihan jawaban A." },
                                pilihan_b: { type: Type.STRING, description: "Pilihan jawaban B." },
                                pilihan_c: { type: Type.STRING, description: "Pilihan jawaban C." },
                                pilihan_d: { type: Type.STRING, description: "Pilihan jawaban D." },
                                jawaban_benar: { type: Type.STRING, description: "Kunci jawaban yang benar (satu huruf: A, B, C, atau D)." }
                            },
                            required: ["pertanyaan", "pilihan_a", "pilihan_b", "pilihan_c", "pilihan_d", "jawaban_benar"]
                        }
                    }
                },
                required: ["soal"]
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: quizSchema,
                },
            });
            
            const jsonResponse = JSON.parse(response.text);
            const generatedSoal: Soal[] = jsonResponse.soal.map((q: any) => ({ ...q }));

            onQuizGenerated(generatedSoal, selectedSubject, subjectName);
            onClose();

        } catch (err: any) {
            console.error("Gemini API Error:", err);
            setError('Gagal membuat kuis. Silakan coba lagi. ' + (err.message || ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Kuis dengan AI">
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Pilih mata pelajaran untuk membuat kuis secara otomatis berdasarkan materi yang ada.
                </p>
                <Select
                    label="Pilih Mata Pelajaran"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    disabled={subjectsWithMaterials.length === 0}
                >
                    <option value="">-- Pilih --</option>
                    {subjectsWithMaterials.map(s => (
                        <option key={s.id} value={s.id}>{s.nama_mapel}</option>
                    ))}
                </Select>
                {subjectsWithMaterials.length === 0 && <p className="text-xs text-amber-600">Tidak ada mata pelajaran dengan materi yang bisa digunakan untuk membuat kuis.</p>}

                <Input
                    label="Jumlah Pertanyaan"
                    type="number"
                    value={numQuestions}
                    onChange={e => setNumQuestions(Math.max(1, parseInt(e.target.value, 10)))}
                    min="1"
                    max="10"
                />
                
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <div className="flex justify-end pt-2">
                    <Button onClick={handleGenerate} isLoading={isLoading} disabled={!selectedSubject || isLoading}>
                       <span className="mr-2">{ICONS.sparkles}</span> Buat Kuis
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// Quizzes Manager Component
const QuizzesManager: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
    const [allMaterials, setAllMaterials] = useState<Materi[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizSubjectId, setQuizSubjectId] = useState('');
    const [soalList, setSoalList] = useState<Soal[]>([{ pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'A' }]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [quizRes, subjectRes, materialRes] = await Promise.all([
            apiService.get<{data: Quiz[]}>('/api/guru/quiz'),
            apiService.get<{data: MataPelajaran[]}>('/api/guru/mata-pelajaran'),
            apiService.get<{data: Materi[]}>('/api/guru/materi'),
        ]);
        setQuizzes(quizRes.data);
        setSubjects(subjectRes.data);
        setAllMaterials(materialRes.data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSoalChange = (index: number, field: keyof Soal, value: string) => {
        const newSoalList = [...soalList];
        newSoalList[index] = { ...newSoalList[index], [field]: value };
        setSoalList(newSoalList);
    };

    const addSoal = () => {
        setSoalList([...soalList, { pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'A' }]);
    };
    
    const removeSoal = (index: number) => {
        if(soalList.length > 1) {
            setSoalList(soalList.filter((_, i) => i !== index));
        }
    };
    
    const resetQuizForm = () => {
        setQuizTitle('');
        setQuizSubjectId('');
        setSoalList([{ pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'A' }]);
    };

    const handleOpenModal = () => {
        resetQuizForm();
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = {
            judul: quizTitle,
            mata_pelajaran_id: quizSubjectId,
            soal: soalList,
        };
        await apiService.post('/api/guru/quiz', data);
        fetchData();
        setIsModalOpen(false);
        resetQuizForm();
    };

    const handleQuizGenerated = (generatedSoal: Soal[], subjectId: string, subjectName: string) => {
        setQuizTitle(`Kuis AI: ${subjectName}`);
        setQuizSubjectId(subjectId);
        setSoalList(generatedSoal);
        setIsModalOpen(true);
    };
    
    if (loading) return <Spinner />;
    
    return (
        <div>
            <div className="flex justify-end items-center gap-2 mb-4">
                <Button variant="secondary" onClick={() => setIsAIModalOpen(true)} disabled={subjects.length === 0}>
                    <span className="mr-2">{ICONS.sparkles}</span>Buat dengan AI
                </Button>
                <Button onClick={handleOpenModal} disabled={subjects.length === 0}>
                    <span className="mr-2">{ICONS.plusCircle}</span>Buat Kuis Manual
                </Button>
            </div>
            {subjects.length === 0 && <p className="text-center text-sm text-amber-600 dark:text-amber-400 mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">Harap buat mata pelajaran terlebih dahulu sebelum menambahkan kuis.</p>}
            <Card>
                <CardContent>
                    {quizzes.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {quizzes.map(q => (
                                <li key={q.id} className="py-3">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{q.judul}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Mata Pelajaran: {q.nama_mapel}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-slate-500 dark:text-slate-400 py-8">Belum ada kuis yang dibuat.</p>}
                </CardContent>
            </Card>

            <AIQuizGeneratorModal 
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                subjects={subjects}
                materials={allMaterials}
                onQuizGenerated={handleQuizGenerated}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Kuis Baru">
                 <form onSubmit={handleFormSubmit} className="space-y-6">
                    <Input name="judul" placeholder="Judul Kuis" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required />
                     <Select name="mata_pelajaran_id" value={quizSubjectId} onChange={e => setQuizSubjectId(e.target.value)} required>
                        <option value="">Pilih Mata Pelajaran</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                    </Select>
                    
                    <div className="space-y-4">
                        {soalList.map((soal, index) => (
                            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-900/40 relative">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Pertanyaan {index + 1}</h4>
                                    {soalList.length > 1 && (
                                        <Button type="button" variant="ghost" className="!p-1 h-auto text-red-500" onClick={() => removeSoal(index)}>
                                           <span className="w-5 h-5">{ICONS.trash}</span>
                                        </Button>
                                    )}
                                </div>
                                <Input value={soal.pertanyaan} onChange={e => handleSoalChange(index, 'pertanyaan', e.target.value)} placeholder="Pertanyaan" required />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Input value={soal.pilihan_a} onChange={e => handleSoalChange(index, 'pilihan_a', e.target.value)} placeholder="Pilihan A" required />
                                    <Input value={soal.pilihan_b} onChange={e => handleSoalChange(index, 'pilihan_b', e.target.value)} placeholder="Pilihan B" required />
                                    <Input value={soal.pilihan_c} onChange={e => handleSoalChange(index, 'pilihan_c', e.target.value)} placeholder="Pilihan C" required />
                                    <Input value={soal.pilihan_d} onChange={e => handleSoalChange(index, 'pilihan_d', e.target.value)} placeholder="Pilihan D" required />
                                </div>
                                <Select label="Jawaban Benar" value={soal.jawaban_benar} onChange={e => handleSoalChange(index, 'jawaban_benar', e.target.value as 'A' | 'B' | 'C' | 'D')}>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </Select>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <Button type="button" variant="secondary" onClick={addSoal}>Tambah Pertanyaan</Button>
                      <Button type="submit">Buat Kuis</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// Student Scores & Stats Component
const StudentScores: React.FC = () => {
    const [results, setResults] = useState<HasilQuiz[]>([]);
    const [stats, setStats] = useState<StatistikNilai[]>([]);
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async (kelas: string) => {
        setLoading(true);
        setError('');
        try {
            const filterQuery = kelas === 'all' ? '' : `?kelas=${kelas}`;
            const [resultsRes, statsRes] = await Promise.all([
                apiService.get<{ data: HasilQuiz[] }>(`/api/guru/nilai${filterQuery}`),
                apiService.get<{ data: StatistikNilai[] }>(`/api/guru/nilai/statistik${filterQuery}`)
            ]);
            
            setResults(resultsRes.data);
            setStats(statsRes.data);

            if (kelas === 'all') {
                const uniqueClasses = [...new Set(resultsRes.data.map(r => r.kelas))];
                setAvailableClasses(uniqueClasses.sort());
            }

        } catch (err: any) {
            setError(err.message || 'Gagal memuat data nilai.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedClass);
    }, [fetchData, selectedClass]);

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClass(e.target.value);
    };

    if (loading && selectedClass === 'all') return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-6">
             <div className="flex justify-end">
                <div className="w-full sm:w-64">
                    <Select label="Filter Berdasarkan Kelas" value={selectedClass} onChange={handleClassChange}>
                        <option value="all">Semua Kelas</option>
                        {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </div>
            </div>
            
            <Card>
                <CardHeader><h2 className="text-xl font-semibold">Statistik Kuis</h2></CardHeader>
                <CardContent>
                    {loading ? <Spinner /> : (
                        stats.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-center py-8">Tidak ada statistik yang tersedia untuk filter ini.</p> : (
                             <div className="overflow-x-auto relative">
                                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Mata Pelajaran</th>
                                            <th scope="col" className="px-6 py-3 text-center">Jumlah Kuis</th>
                                            <th scope="col" className="px-6 py-3 text-center">Rata-rata Nilai</th>
                                            <th scope="col" className="px-6 py-3 text-center">Nilai Terendah</th>
                                            <th scope="col" className="px-6 py-3 text-center">Nilai Tertinggi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.map(stat => (
                                            <tr key={stat.nama_mapel} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700">
                                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{stat.nama_mapel}</td>
                                                <td className="px-6 py-4 text-center">{stat.jumlah_quiz}</td>
                                                <td className="px-6 py-4 text-center">{Number(stat.rata_rata).toFixed(1)}%</td>
                                                <td className="px-6 py-4 text-center">{Number(stat.nilai_min).toFixed(0)}%</td>
                                                <td className="px-6 py-4 text-center">{Number(stat.nilai_max).toFixed(0)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        )
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h2 className="text-xl font-semibold">Rincian Hasil Kuis Siswa</h2></CardHeader>
                <CardContent>
                    {loading ? <Spinner /> : (
                        results.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-center py-8">Tidak ada hasil kuis yang ditemukan untuk filter ini.</p> : (
                            <div className="overflow-x-auto relative">
                                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Nama Murid</th>
                                            <th scope="col" className="px-6 py-3">Kelas</th>
                                            <th scope="col" className="px-6 py-3">Mata Pelajaran</th>
                                            <th scope="col" className="px-6 py-3">Skor</th>
                                            <th scope="col" className="px-6 py-3">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map(result => (
                                            <tr key={result.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/30">
                                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{result.murid_nama}</td>
                                                <td className="px-6 py-4">{result.kelas}</td>
                                                <td className="px-6 py-4">{result.nama_mapel}</td>
                                                <td className="px-6 py-4">{Number(result.score).toFixed(0)}% ({result.jawaban_benar}/{result.total_soal})</td>
                                                <td className="px-6 py-4">{new Date(result.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};