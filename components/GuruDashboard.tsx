
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
            case 'subjects': return <SubjectManager />; // BE: Mapel, FE: Materi
            case 'materials': return <MaterialsManager />; // BE: Materi, FE: Pembahasan
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
                <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto pb-2" aria-label="Tabs">
                    <TabButton tabName="pending" label="Verifikasi Murid" icon={ICONS.userCheck} />
                    <TabButton tabName="murid" label="Daftar Murid" icon={ICONS.users} />
                    <TabButton tabName="subjects" label="Kelola Materi" icon={ICONS.bookOpen} />
                    <TabButton tabName="materials" label="Kelola Pembahasan" icon={ICONS.fileText} />
                    <TabButton tabName="quizzes" label="Kuis" icon={ICONS.puzzle} />
                    <TabButton tabName="scores" label="Nilai" icon={ICONS.award} />
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
            const data = res?.data;
            setMurid(Array.isArray(data) ? data.filter(m => m && m.id) : []);
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
            setMurid(prev => prev.filter(m => m.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>;

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
            const data = res?.data;
            setMuridList(Array.isArray(data) ? data.filter(m => m && m.id) : []);
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
    if (error) return <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>;

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
                                            {(m.gaya_belajar || m.minat_bidang) ? (
                                                <ul className="list-disc list-inside text-xs space-y-1">
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

// Subject Manager (Renamed to "Materi" in UI, but manages BE MataPelajaran)
const SubjectManager: React.FC = () => {
    const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState({ nama_mapel: '', deskripsi: '', tingkat_kesulitan: 'Pemula' });
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiService.get<{ data: MataPelajaran[] }>('/api/guru/mata-pelajaran');
            setSubjects(Array.isArray(res?.data) ? res.data.filter(s => s && s.id) : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSubject(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.post('/api/guru/mata-pelajaran', newSubject);
            fetchData();
            setIsModalOpen(false);
            setNewSubject({ nama_mapel: '', deskripsi: '', tingkat_kesulitan: 'Pemula' });
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus materi ini? Semua pembahasan dan kuis terkait akan ikut terhapus.')) {
            try {
                await apiService.delete(`/api/guru/mata-pelajaran/${id}`);
                fetchData();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsModalOpen(true)}>
                    <span className="mr-2">{ICONS.plusCircle}</span>Tambah Materi
                </Button>
            </div>
            <Card>
                <CardHeader><h2 className="text-xl font-semibold">Daftar Materi</h2></CardHeader>
                <CardContent>
                    {subjects.length === 0 ? <p className="text-center text-slate-500 py-8">Belum ada materi (mata pelajaran) yang dibuat.</p> : (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {subjects.map(s => (
                                <li key={s.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-lg dark:text-white">{s.nama_mapel}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{s.deskripsi}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                            {s.tingkat_kesulitan}
                                        </span>
                                    </div>
                                    <Button variant="danger" onClick={() => handleDelete(s.id)} className="!p-2">
                                        {ICONS.trash}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Materi Baru">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nama Materi" name="nama_mapel" value={newSubject.nama_mapel} onChange={handleInputChange} required placeholder="Contoh: Pemrograman Web Lanjut" />
                    <Input label="Deskripsi Singkat" name="deskripsi" value={newSubject.deskripsi} onChange={handleInputChange} required placeholder="Deskripsi singkat tentang materi ini" />
                    <Select label="Tingkat Kesulitan" name="tingkat_kesulitan" value={newSubject.tingkat_kesulitan} onChange={handleInputChange}>
                        <option value="Pemula">Pemula</option>
                        <option value="Menengah">Menengah</option>
                        <option value="Lanjut">Lanjut</option>
                    </Select>
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Simpan Materi</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// AI Material Generator Modal (Generates Pembahasan)
const AIMaterialGeneratorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    subjects: MataPelajaran[];
    onMaterialGenerated: (data: { judul: string; konten: string; mata_pelajaran_id: string }) => void;
}> = ({ isOpen, onClose, subjects, onMaterialGenerated }) => {
    const [topic, setTopic] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-select first subject if available
    useEffect(() => {
        if (subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(subjects[0].id.toString());
        }
    }, [subjects, selectedSubject]);

    const handleGenerate = async () => {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setError('API Key untuk Gemini tidak ditemukan.');
            return;
        }
        
        if (!topic || !selectedSubject) {
             setError('Silakan pilih materi dan masukkan topik pembahasan.');
             return;
        }

        setIsLoading(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey });
            const subjectName = subjects.find(s => s.id.toString() === selectedSubject)?.nama_mapel || "Umum";

            const prompt = `Anda adalah seorang guru ahli. Buatkan draf pembahasan (materi belajar) untuk materi pelajaran "${subjectName}" dengan topik "${topic}". Buatlah judul pembahasan yang menarik dan konten yang informatif, terstruktur, dan mudah dipahami.`;

            const materialSchema = {
                type: Type.OBJECT,
                properties: {
                    judul: { type: Type.STRING, description: "Judul pembahasan." },
                    konten: { type: Type.STRING, description: "Isi pembahasan yang lengkap." }
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
            onMaterialGenerated({ ...generatedData, mata_pelajaran_id: selectedSubject });
            onClose();

        } catch (err: any) {
            console.error("Gemini API Error:", err);
            setError('Gagal membuat pembahasan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setTopic('');
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Pembahasan dengan AI">
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Pilih materi induk, masukkan topik, dan AI akan membuat draf pembahasan.
                </p>
                 <Select label="Pilih Materi" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                </Select>
                <Input
                    label="Topik Pembahasan"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Contoh: Variabel dan Tipe Data"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end pt-2">
                    <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading || subjects.length === 0}>
                        <span className="mr-2">{ICONS.sparkles}</span> Buat Pembahasan
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


// Materials Manager (Renamed to "Pembahasan" in UI, manages BE Materi)
const MaterialsManager: React.FC = () => {
    const [materials, setMaterials] = useState<Materi[]>([]);
    const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [error, setError] = useState('');

    // Controlled form state
    const [newMaterial, setNewMaterial] = useState({
        judul: '',
        konten: '',
        mata_pelajaran_id: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [materiRes, subjectRes] = await Promise.all([
                 apiService.get<{data: Materi[]}>('/api/guru/materi'),
                 apiService.get<{data: MataPelajaran[]}>('/api/guru/mata-pelajaran')
            ]);

            setMaterials(Array.isArray(materiRes?.data) ? materiRes.data.filter(m => m && m.id) : []);
            const fetchedSubjects = Array.isArray(subjectRes?.data) ? subjectRes.data.filter(s => s && s.id) : [];
            setSubjects(fetchedSubjects);

            if (fetchedSubjects.length > 0 && !newMaterial.mata_pelajaran_id) {
                setNewMaterial(prev => ({ ...prev, mata_pelajaran_id: String(fetchedSubjects[0].id) }));
            }

        } catch (err: any) {
            console.error("Failed to fetch data", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewMaterial(prev => ({ ...prev, [name]: value }));
    };
    
    const resetForm = () => {
        setNewMaterial({ judul: '', konten: '', mata_pelajaran_id: subjects.length > 0 ? String(subjects[0].id) : '' });
    };
    
    const handleOpenModal = () => {
        if (subjects.length === 0) {
            alert("Buat Materi (Mata Pelajaran) terlebih dahulu sebelum membuat Pembahasan.");
            return;
        }
        resetForm();
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await apiService.post('/api/guru/materi', newMaterial);
            fetchData();
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleMaterialGenerated = (data: { judul: string; konten: string; mata_pelajaran_id: string }) => {
        setNewMaterial(data);
        setIsAIModalOpen(false);
        setIsModalOpen(true);
    };

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4">{error}</p>;

    return (
        <div>
            <div className="flex justify-end items-center gap-2 mb-4">
                 <Button variant="secondary" onClick={() => {
                     if (subjects.length === 0) {
                         alert("Buat Materi terlebih dahulu.");
                         return;
                     }
                     setIsAIModalOpen(true);
                 }}>
                    <span className="mr-2">{ICONS.sparkles}</span>Buat dengan AI
                </Button>
                <Button onClick={handleOpenModal}>
                    <span className="mr-2">{ICONS.plusCircle}</span>Tambah Pembahasan
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Kelola Pembahasan</h2>
                    <p className="text-sm text-slate-500">Daftar semua pembahasan dari berbagai materi.</p>
                </CardHeader>
                <CardContent>
                    {materials.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {materials.map(m => (
                                <li key={m.id} className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{m.judul}</p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Materi: {m.nama_mapel}</p>
                                            <p className="text-xs text-slate-500 truncate max-w-md">{m.konten.substring(0, 100)}...</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-slate-500 dark:text-slate-400 py-8">Belum ada pembahasan yang ditambahkan.</p>}
                </CardContent>
            </Card>
            <AIMaterialGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                subjects={subjects}
                onMaterialGenerated={handleMaterialGenerated}
            />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Pembahasan Baru">
                 <form onSubmit={handleFormSubmit} className="space-y-4">
                    <Select label="Pilih Materi Induk" name="mata_pelajaran_id" value={newMaterial.mata_pelajaran_id} onChange={handleInputChange}>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                    </Select>
                    <Input name="judul" label="Judul Pembahasan" placeholder="Contoh: Pengenalan Sintaks" value={newMaterial.judul} onChange={handleInputChange} required />
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Konten Pembahasan</label>
                        <textarea
                             name="konten"
                             className="block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
                             placeholder="Isi materi pembahasan..."
                             value={newMaterial.konten}
                             onChange={(e) => setNewMaterial(prev => ({...prev, konten: e.target.value}))}
                             required
                        />
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Simpan Pembahasan</Button>
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
    materials: Materi[]; // BE Materials (FE Pembahasan)
    subjects: MataPelajaran[]; // BE Subjects (FE Materi)
    onQuizGenerated: (generatedSoal: Soal[], subjectId: string, subjectName: string) => void;
}> = ({ isOpen, onClose, materials, subjects, onQuizGenerated }) => {
    const [numQuestions, setNumQuestions] = useState(5);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

     // Auto-select first subject
     useEffect(() => {
        if (subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(String(subjects[0].id));
        }
    }, [subjects, selectedSubject]);

    const handleGenerate = async () => {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setError('API Key untuk Gemini tidak ditemukan.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey });
            const subjectName = subjects.find(s => String(s.id) === selectedSubject)?.nama_mapel || "Materi";
            
            // Filter materials (pembahasan) belonging to the selected subject (materi)
            const relevantMaterials = materials.filter(m => String(m.mata_pelajaran_id) === selectedSubject);
            
            if (relevantMaterials.length === 0) {
                 setError('Tidak ada pembahasan pada materi ini untuk dijadikan sumber kuis.');
                 setIsLoading(false);
                 return;
            }

            const materialContent = relevantMaterials.map(m => `Judul Pembahasan: ${m.judul}\nKonten: ${m.konten}`).join('\n\n---\n\n');

            const prompt = `Anda adalah asisten ahli. Berdasarkan pembahasan berikut dari materi "${subjectName}", buatlah ${numQuestions} soal kuis pilihan ganda (A, B, C, D). Pastikan jawaban_benar hanya 'A', 'B', 'C', atau 'D'.

Sumber Pembahasan:
${materialContent}

Berikan jawaban dalam format JSON valid.`;
            
            const quizSchema = {
                type: Type.OBJECT,
                properties: {
                    soal: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                pertanyaan: { type: Type.STRING },
                                pilihan_a: { type: Type.STRING },
                                pilihan_b: { type: Type.STRING },
                                pilihan_c: { type: Type.STRING },
                                pilihan_d: { type: Type.STRING },
                                jawaban_benar: { type: Type.STRING }
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
            setError('Gagal membuat kuis. ' + (err.message || ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Kuis dengan AI">
            <div className="space-y-4">
                 <Select label="Pilih Materi Sumber" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                </Select>
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
                    <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading || subjects.length === 0}>
                       <span className="mr-2">{ICONS.sparkles}</span> Buat Kuis
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// QuizzesManager Component
const QuizzesManager: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [allMaterials, setAllMaterials] = useState<Materi[]>([]);
    const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizSubjectId, setQuizSubjectId] = useState('');
    const [soalList, setSoalList] = useState<Soal[]>([{ pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'A' }]);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [quizRes, materialRes, subjectRes] = await Promise.all([
                apiService.get<{data: Quiz[]}>('/api/guru/quiz'),
                apiService.get<{data: Materi[]}>('/api/guru/materi'),
                apiService.get<{data: MataPelajaran[]}>('/api/guru/mata-pelajaran')
            ]);
            setQuizzes(Array.isArray(quizRes?.data) ? quizRes.data.filter(q => q && q.id) : []);
            setAllMaterials(Array.isArray(materialRes?.data) ? materialRes.data.filter(m => m && m.id) : []);
            
            const fetchedSubjects = Array.isArray(subjectRes?.data) ? subjectRes.data.filter(s => s && s.id) : [];
            setSubjects(fetchedSubjects);
            
            if(fetchedSubjects.length > 0 && !quizSubjectId) {
                setQuizSubjectId(String(fetchedSubjects[0].id));
            }

        } catch (err: any) {
             console.error("Failed to fetch data", err);
             setError(err.message);
        } finally {
            setLoading(false);
        }
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
        setQuizSubjectId(subjects.length > 0 ? String(subjects[0].id) : '');
        setSoalList([{ pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'A' }]);
    };

    const handleOpenModal = () => {
        if (subjects.length === 0) {
             alert("Buat Materi terlebih dahulu.");
             return;
        }
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
        try {
            await apiService.post('/api/guru/quiz', data);
            fetchData();
            setIsModalOpen(false);
            resetQuizForm();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleQuizGenerated = (generatedSoal: Soal[], subjectId: string, subjectName: string) => {
        setQuizTitle(`Kuis: ${subjectName}`);
        setQuizSubjectId(subjectId);
        setSoalList(generatedSoal);
        setIsModalOpen(true);
    };
    
    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4">{error}</p>;

    return (
        <div>
            <div className="flex justify-end items-center gap-2 mb-4">
                <Button variant="secondary" onClick={() => {
                     if (subjects.length === 0) {
                         alert("Buat Materi terlebih dahulu.");
                         return;
                     }
                    setIsAIModalOpen(true);
                }}>
                    <span className="mr-2">{ICONS.sparkles}</span>Buat dengan AI
                </Button>
                <Button onClick={handleOpenModal}>
                    <span className="mr-2">{ICONS.plusCircle}</span>Buat Kuis Manual
                </Button>
            </div>
            <Card>
                 <CardHeader>
                    <h2 className="text-xl font-semibold">Kelola Kuis</h2>
                </CardHeader>
                <CardContent>
                    {quizzes.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {quizzes.map(q => (
                                <li key={q.id} className="py-3">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{q.judul}</p>
                                    <p className="text-xs text-indigo-600">Materi: {q.nama_mapel}</p>
                                    <p className="text-xs text-slate-500">{q.total_soal} Soal</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-slate-500 dark:text-slate-400 py-8">Belum ada kuis yang dibuat.</p>}
                </CardContent>
            </Card>

            <AIQuizGeneratorModal 
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                materials={allMaterials}
                subjects={subjects}
                onQuizGenerated={handleQuizGenerated}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Kuis Baru">
                 <form onSubmit={handleFormSubmit} className="space-y-6">
                    <Select label="Pilih Materi" value={quizSubjectId} onChange={e => setQuizSubjectId(e.target.value)}>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                    </Select>
                    <Input name="judul" placeholder="Judul Kuis" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required />
                    
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
                      <Button type="submit">Simpan Kuis</Button>
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
            
            const fetchedResults = Array.isArray(resultsRes?.data) ? resultsRes.data.filter(r => r && r.id) : [];
            const fetchedStats = Array.isArray(statsRes?.data) ? statsRes.data.filter(s => s) : [];
            
            setResults(fetchedResults);
            setStats(fetchedStats);

            if (kelas === 'all') {
                const uniqueClasses = [...new Set(fetchedResults.map(r => r.kelas))];
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
    if (error) return <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>;

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
                <CardHeader><h2 className="text-xl font-semibold">Statistik Kuis per Materi</h2></CardHeader>
                <CardContent>
                    {loading ? <Spinner /> : (
                        stats.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-center py-8">Tidak ada statistik yang tersedia.</p> : (
                             <div className="overflow-x-auto relative">
                                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Materi</th>
                                            <th scope="col" className="px-6 py-3 text-center">Jumlah Kuis</th>
                                            <th scope="col" className="px-6 py-3 text-center">Rata-rata Nilai</th>
                                            <th scope="col" className="px-6 py-3 text-center">Min</th>
                                            <th scope="col" className="px-6 py-3 text-center">Max</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.map((stat, index) => (
                                            <tr key={`${stat?.nama_mapel || index}`} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{stat?.nama_mapel}</td>
                                                <td className="px-6 py-4 text-center">{stat?.jumlah_quiz}</td>
                                                <td className="px-6 py-4 text-center">{Number(stat?.rata_rata || 0).toFixed(1)}%</td>
                                                <td className="px-6 py-4 text-center">{Number(stat?.nilai_min || 0).toFixed(0)}%</td>
                                                <td className="px-6 py-4 text-center">{Number(stat?.nilai_max || 0).toFixed(0)}%</td>
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
                        results.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-center py-8">Tidak ada hasil kuis.</p> : (
                            <div className="overflow-x-auto relative">
                                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Nama Murid</th>
                                            <th scope="col" className="px-6 py-3">Kelas</th>
                                            <th scope="col" className="px-6 py-3">Materi</th>
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
                                                <td className="px-6 py-4">{Number(result.score).toFixed(0)}%</td>
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
