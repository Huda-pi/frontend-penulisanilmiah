
import React, { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ICONS } from '../constants';
import { Button } from './ui';

const NavItem: React.FC<{ to: string, icon: ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-700/60'}`}
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navLinks = isAuthenticated && user?.role === 'guru' ? (
        <NavItem to="/" icon={ICONS.home} label="Dasbor" onClick={closeMobileMenu} />
    ) : (
        <>
            <NavItem to="/" icon={ICONS.home} label="Dasbor" onClick={closeMobileMenu} />
            <NavItem to="/preferences" icon={ICONS.settings} label="Preferensi" onClick={closeMobileMenu} />
        </>
    );

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 text-slate-900 dark:text-white font-bold text-xl flex items-center space-x-2">
                                {ICONS.award} <span>Web Pembelajaran</span>
                            </div>
                            <div className="hidden md:block">
                                <nav className="ml-10 flex items-baseline space-x-2">
                                    {isAuthenticated && user?.role === 'murid' && navLinks}
                                </nav>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="hidden md:flex items-center space-x-4">
                                {isAuthenticated && user ? (
                                    <>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Selamat datang, {user.nama}</span>
                                        <Button variant="secondary" onClick={handleLogout}>
                                            <span className="mr-2">{ICONS.logOut}</span> Keluar
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => navigate('/auth')}>Masuk</Button>
                                )}
                            </div>
                            <div className="md:hidden flex items-center">
                                {isAuthenticated && (
                                     <Button variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="!p-2 h-10 w-10">
                                        <span className="sr-only">Buka menu utama</span>
                                        {isMobileMenuOpen ? ICONS.x : ICONS.menu}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && isAuthenticated && (
                    <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">
                         <div className="space-y-1">
                           {navLinks}
                         </div>
                         <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                             <div className="flex items-center">
                                 <div className="flex-shrink-0">
                                     <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                         {user?.nama.charAt(0)}
                                     </div>
                                 </div>
                                 <div className="ml-3">
                                     <div className="text-base font-medium text-slate-800 dark:text-white">{user?.nama}</div>
                                     <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{user?.email}</div>
                                 </div>
                             </div>
                             <Button variant="secondary" onClick={handleLogout} className="w-full mt-3">
                                 <span className="mr-2">{ICONS.logOut}</span> Keluar
                             </Button>
                         </div>
                    </div>
                )}
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};