import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Soal, QuizResultDetail } from '../types';
import { Button, Card, CardContent, CardHeader, Spinner } from './ui';

export const QuizPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Soal[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState<QuizResultDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const checkResultAndFetchQuestions = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            // First, check if there's an existing result for this quiz
            const resultRes = await apiService.get<QuizResultDetail>(`/api/murid/quiz/${id}/hasil`);
            
            // If score is present, it means the quiz has been taken
            if (resultRes && resultRes.score !== undefined && resultRes.score !== null) {
                setResult(resultRes);
            } else {
                // If not taken, fetch the questions
                const questionsRes = await apiService.get<{ data: Soal[] }>(`/api/murid/quiz/${id}/soal`);
                const fetchedQuestions = questionsRes?.data || [];
                setQuestions(fetchedQuestions);
                 if (fetchedQuestions.length === 0) {
                    setError("Kuis ini tidak memiliki pertanyaan.");
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        checkResultAndFetchQuestions();
    }, [checkResultAndFetchQuestions]);

    const handleAnswerSelect = (questionId: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!id) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await apiService.post<QuizResultDetail>(`/api/murid/quiz/${id}/submit`, { jawaban: answers });
            setResult(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    
    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;
    
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    if (result) {
        const score = result.score ?? 0;
        const isSuccess = score >= 75;
        return (
            <div className="max-w-2xl mx-auto text-center">
                <Card>
                    <CardHeader>
                        <h1 className="text-2xl font-bold">{result.message}</h1>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-lg">Skor Anda:</p>
                        <p className={`text-6xl font-bold ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{score.toFixed(0)}%</p>
                        <p>Anda menjawab {result.jawaban_benar} dari {result.total_soal} pertanyaan dengan benar.</p>
                        {result.submitted_at && <p className="text-sm text-slate-500">Dikerjakan pada: {new Date(result.submitted_at).toLocaleString('id-ID')}</p>}
                        <Button onClick={() => navigate(-1)}>Kembali ke Mata Pelajaran</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (questions.length === 0) return <p className="text-center text-slate-500">Tidak ada pertanyaan yang ditemukan untuk kuis ini.</p>;

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl font-bold">Kuis</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-semibold mb-6 min-h-[56px]">{currentQuestion.pertanyaan}</p>
                    <div className="space-y-3">
                        {(['A', 'B', 'C', 'D'] as const).map(option => {
                            const optionKey = `pilihan_${option.toLowerCase()}` as keyof Soal;
                            return (
                                <label key={option} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${answers[currentQuestion.id!] === option ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border-slate-300 dark:border-slate-600'}`}>
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value={option}
                                        checked={answers[currentQuestion.id!] === option}
                                        onChange={() => handleAnswerSelect(currentQuestion.id!, option)}
                                        className="sr-only"
                                    />
                                    <span className={`font-bold mr-4 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm ${answers[currentQuestion.id!] === option ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{option}</span>
                                    <span className="text-slate-800 dark:text-slate-200">{currentQuestion[optionKey]}</span>
                                </label>
                            );
                        })}
                    </div>
                     <div className="mt-8 flex justify-between items-center">
                        <Button variant="secondary" onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} disabled={currentQuestionIndex === 0}>Sebelumnya</Button>
                        {isLastQuestion ? (
                            <Button onClick={handleSubmit} isLoading={submitting} disabled={Object.keys(answers).length !== questions.length}>Kirim Kuis</Button>
                        ) : (
                            <Button onClick={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))}>Berikutnya</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};