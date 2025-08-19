
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Input } from './ui';

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [role, setRole] = useState<'murid' | 'guru'>('murid');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            if (isLogin) {
                await login({ ...data, role });
                navigate('/');
            } else {
                await register(data);
                setMessage('Pendaftaran berhasil! Silakan tunggu verifikasi dari guru sebelum masuk.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isLogin ? 'Masuk ke akun Anda' : 'Buat akun murid'}
                    </h2>
                </div>
                <Card>
                    <CardContent className="p-8">
                        {error && <p className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-center mb-4 p-3 rounded-md text-sm">{error}</p>}
                        {message && <p className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-center mb-4 p-3 rounded-md text-sm">{message}</p>}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <>
                                    <Input name="nama" type="text" required placeholder="Nama Lengkap" aria-label="Nama Lengkap" />
                                    <Input name="kelas" type="text" required placeholder="Kelas (contoh: 10A)" aria-label="Kelas" />
                                </>
                            )}
                            <Input name="email" type="email" required placeholder="Alamat Email" aria-label="Alamat Email" />
                            <Input name="password" type="password" required placeholder="Kata Sandi" aria-label="Kata Sandi" />
                            {isLogin && (
                                 <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Saya adalah seorang...</label>
                                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
                                         <button type="button" onClick={() => setRole('murid')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${role === 'murid' ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-900/50 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>Murid</button>
                                         <button type="button" onClick={() => setRole('guru')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${role === 'guru' ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-900/50 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>Guru</button>
                                    </div>
                                 </div>
                            )}
                            
                            <Button type="submit" className="w-full !py-3" isLoading={isLoading}>
                                {isLogin ? 'Masuk' : 'Daftar'}
                            </Button>
                        </form>
                        <div className="mt-6 text-center">
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage('');}} className="font-medium text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};