
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
            setAllSubjects(subRes.data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dasbor Murid</h1>
            
            {/* Recommendations Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Direkomendasikan Untuk Anda</h2>
                {error && !recommendations && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-slate-500 dark:text-slate-400">{error}</p>
                            <Button onClick={() => navigate('/preferences')} className="mt-4">
                               Atur Preferensi
                            </Button>
                        </CardContent>
                    </Card>
                )}
                {recommendations && (
                    <div>
                        <p className="mb-4 text-slate-600 dark:text-slate-300">{recommendations.message}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.recommended_subjects.map(subject => (
                                <SubjectCard key={subject.id} subject={subject} />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* All Subjects Section */}
            <section>
                 <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Jelajahi Semua Mata Pelajaran</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allSubjects.map(subject => (
                       <SubjectCard key={subject.id} subject={subject} />
                    ))}
                </div>
            </section>
        </div>
    );
};

const SubjectCard: React.FC<{subject: MataPelajaran}> = ({ subject }) => {
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