
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { Preferensi, MataPelajaran } from '../types';
import { Button, Card, CardContent, CardHeader, Input, Select, Spinner } from './ui';

const initialPreferences: Preferensi = {
    mata_pelajaran_favorit: '',
    gaya_belajar: '',
    minat_bidang: ''
};

export const PreferencesPage: React.FC = () => {
    const [preferences, setPreferences] = useState<Preferensi>(initialPreferences);
    const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [prefRes, subRes] = await Promise.all([
                apiService.get<{ data: Preferensi | null }>('/api/murid/preferensi'),
                apiService.get<{ data: MataPelajaran[] }>('/api/murid/mata-pelajaran')
            ]);
            
            const fetchedSubjects = Array.isArray(subRes?.data) ? subRes.data.filter(s => s && s.id) : [];
            // Create a copy to avoid mutating the initial constant
            let currentPrefs = prefRes.data ? { ...prefRes.data } : { ...initialPreferences };

            if (fetchedSubjects.length > 0 && !currentPrefs.mata_pelajaran_favorit) {
                 // Optional: set default if empty, though user should pick
                 currentPrefs.mata_pelajaran_favorit = fetchedSubjects[0].nama_mapel;
            }

            setPreferences(currentPrefs);
            setSubjects(fetchedSubjects);
        } catch (error) {
            console.error("Failed to fetch preferences data", error);
            setError('Tidak dapat memuat data Anda. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPreferences(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');
        try {
            await apiService.post('/api/murid/preferensi', preferences);
            setMessage('Preferensi berhasil disimpan!');
            setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
        } catch (error) {
            setError('Gagal menyimpan preferensi.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <h1 className="text-2xl font-bold">Preferensi Belajar</h1>
                    <p className="text-slate-500 dark:text-slate-400">Bantu kami merekomendasikan materi terbaik untuk Anda.</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Select
                            label="Materi Favorit"
                            name="mata_pelajaran_favorit"
                            value={preferences.mata_pelajaran_favorit}
                            onChange={handleChange}
                        >
                            <option value="">Pilih Materi</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.nama_mapel}>{s.nama_mapel}</option>
                            ))}
                        </Select>
                        
                        <Select
                            label="Gaya Belajar"
                            name="gaya_belajar"
                            value={preferences.gaya_belajar}
                            onChange={handleChange}
                        >
                            <option value="">Pilih gaya belajar Anda</option>
                            <option value="Visual">Visual (Grafik, gambar)</option>
                            <option value="Audio">Audio (Ceramah, diskusi)</option>
                            <option value="Kinestetik">Kinestetik (Praktik, interaktif)</option>
                        </Select>

                        <Input
                            label="Bidang Minat"
                            name="minat_bidang"
                            value={preferences.minat_bidang}
                            onChange={handleChange}
                            placeholder="cth., teknologi, seni, sains, sejarah"
                        />

                        <div className="flex items-center space-x-4 pt-2">
                            <Button type="submit" isLoading={saving}>Simpan Preferensi</Button>
                            {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
                             {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
