
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { Recommendation, MataPelajaran } from '../types';
import { Button, Card, CardContent, CardHeader, Spinner } from './ui';
import { Link, useNavigate } from 'react-router-dom';

export const MuridDashboard: React.FC = () => {
    const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
    const [allSubjects, setAllSubjects] = useState<MataPelajaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [recRes, subRes] = await Promise.all([
                apiService.get<Recommendation>('/api/murid/recommendations').catch(e => {
                    console.warn("Could not fetch recommendations:", e.message);
                    setError('Selesaikan kuis dan atur preferensi belajar Anda untuk mendapatkan rekomendasi yang dipersonalisasi.');
                    return null;
                }),
                apiService.get<{data: MataPelajaran[]}>('/api/murid/mata-pelajaran')
            ]);
            
            setRecommendations(recRes);
            setAllSubjects(Array.isArray(subRes?.data) ? subRes.data.filter(s => s && s.id) : []);

        } catch (err: any) {
            setError(err.message || 'Gagal memuat data materi.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;
    
    const showRecommendations = recommendations?.recommended_subjects && Array.isArray(recommendations.recommended_subjects) && recommendations.recommended_subjects.length > 0;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dasbor Murid</h1>
            
            {showRecommendations ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                        Rekomendasi Materi
                    </h2>
                    <p className="mb-4 text-slate-600 dark:text-slate-300">{recommendations!.message}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendations!.recommended_subjects.map(subject => (
                            <SubjectCard key={subject.id} subject={subject} />
                        ))}
                    </div>
                </section>
            ) : (
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                        Materi Tersedia
                    </h2>
                    
                    {error && (
                        <Card className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50">
                            <CardContent className="text-center py-6">
                                <p className="text-amber-800 dark:text-amber-200">{error}</p>
                                <Button onClick={() => navigate('/preferences')} className="mt-4">
                                   Atur Preferensi
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allSubjects.length > 0 ? (
                            allSubjects.map(subject => (
                               <SubjectCard key={subject.id} subject={subject} />
                            ))
                        ) : (
                            <div className="col-span-full">
                                <Card>
                                    <CardContent className="text-center py-10">
                                        <p className="text-slate-500 dark:text-slate-400">
                                            Tidak ada materi yang tersedia saat ini.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

const SubjectCard: React.FC<{subject: MataPelajaran}> = ({ subject }) => {
    if (!subject) return null;
    return (
        <Link to={`/subjects/${subject.id}`} className="block group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-indigo-500 dark:group-hover:border-indigo-500 group-hover:-translate-y-1">
                <CardContent className="p-5">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{subject.nama_mapel}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 h-10">{subject.deskripsi}</p>
                    <div className="mt-3">
                        <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full">{subject.tingkat_kesulitan}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};
