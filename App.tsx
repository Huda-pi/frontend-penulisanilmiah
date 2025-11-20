
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Spinner } from './components/ui';
import { AuthPage } from './components/AuthPage';
import { GuruDashboard } from './components/GuruDashboard';
import { MuridDashboard } from './components/MuridDashboard';
import { SubjectPage } from './components/SubjectPage';
import { QuizPage } from './components/QuizPage';
import { PreferencesPage } from './components/PreferencesPage';

const ProtectedRoute: React.FC<{ allowedRoles: ('guru' | 'murid')[] }> = ({ allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    if (user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Or a dedicated "Unauthorized" page
    }
    return <Outlet />;
};

const AppRoutes: React.FC = () => {
    const { role, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return (
        <Layout>
            <Routes>
                <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} />
                
                <Route element={<ProtectedRoute allowedRoles={['guru', 'murid']} />}>
                    <Route path="/" element={
                        role === 'guru' ? <GuruDashboard /> : <MuridDashboard />
                    } />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['murid']} />}>
                    <Route path="/subjects/:id" element={<SubjectPage />} />
                    <Route path="/quiz/:id" element={<QuizPage />} />
                    <Route path="/preferences" element={<PreferencesPage />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;