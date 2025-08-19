
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Materi, Quiz, MataPelajaran } from '../types';
import { Card, CardContent, CardHeader, Spinner } from './ui';
import { ICONS } from '../constants';

export const SubjectPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [subject, setSubject] = useState<MataPelajaran | null>(null);
    const [materials, setMaterials] = useState<Materi[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeMaterial, setActiveMaterial] = useState<Materi | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [materialsRes, quizzesRes, allSubjectsRes] = await Promise.all([
                apiService.get<{ data: Materi[] }>(`/api/murid/materi/${id}`),
                apiService.get<{ data: Quiz[] }>(`/api/murid/quiz/${id}`),
                apiService.get<{ data: MataPelajaran[] }>('/api/murid/mata-pelajaran')
            ]);
            
            // Find the full subject details from the all subjects list
            const currentSubject = allSubjectsRes.data.find(s => s.id === parseInt(id, 10));
            setSubject(currentSubject || null);
            
            // Set materials and default active material
            setMaterials(materialsRes.data);
            if (materialsRes.data.length > 0) {
                 setActiveMaterial(materialsRes.data[0]);
            }
            
            // Set quizzes
            setQuizzes(quizzesRes.data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!subject) return <p>Mata pelajaran tidak ditemukan.</p>;

    return (
        <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{subject.nama_mapel}</h1>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{subject.deskripsi}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <aside className="lg:col-span-1 space-y-6">
                    {/* Materials List */}
                    <Card>
                        <CardHeader><h2 className="text-xl font-semibold">Materi</h2></CardHeader>
                        <CardContent className="p-2">
                            {materials.length > 0 ? (
                                <ul className="space-y-1">
                                    {materials.map(m => (
                                        <li key={m.id}>
                                            <button 
                                                onClick={() => setActiveMaterial(m)} 
                                                className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${activeMaterial?.id === m.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                   <span className={`flex-shrink-0 w-5 h-5 ${activeMaterial?.id === m.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{ICONS.fileText}</span>
                                                   <span className={`font-medium ${activeMaterial?.id === m.id ? 'text-indigo-700 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{m.judul}</span>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-slate-500 p-2 text-sm text-center">Belum ada materi.</p>}
                        </CardContent>
                    </Card>

                    {/* Quizzes List */}
                    <Card>
                        <CardHeader><h2 className="text-xl font-semibold">Kuis</h2></CardHeader>
                        <CardContent className="p-2">
                            {quizzes.length > 0 ? (
                               <ul className="space-y-1">
                                    {quizzes.map(q => (
                                        <li key={q.id}>
                                            {q.score !== null && q.score !== undefined ? (
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-not-allowed">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="flex-shrink-0 w-5 h-5 text-green-500">{ICONS.checkCircle}</span>
                                                        <span className="font-medium text-slate-500 dark:text-slate-400">{q.judul}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                        Skor: {q.score.toFixed(0)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <Link to={`/quiz/${q.id}`} className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-sm">
                                                     <div className="flex items-center space-x-3">
                                                       <span className="flex-shrink-0 w-5 h-5 text-slate-500">{ICONS.puzzle}</span>
                                                       <span className="font-medium text-slate-700 dark:text-slate-300">{q.judul}</span>
                                                     </div>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-slate-500 p-2 text-sm text-center">Belum ada kuis.</p>}
                        </CardContent>
                    </Card>
                </aside>

                <div className="lg:col-span-2">
                    <Card className="min-h-[60vh] sticky top-24">
                        <CardHeader>
                             <h2 className="text-xl font-semibold">{activeMaterial ? activeMaterial.judul : "Pilih materi untuk dilihat"}</h2>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none prose-slate">
                            {activeMaterial ? <p>{activeMaterial.konten}</p> : <p className="text-slate-500">Silakan pilih materi dari daftar di sebelah kiri untuk melihat isinya.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
