
import React, { ReactNode } from 'react';

// Spinner Component
export const Spinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div className="flex justify-center items-center">
    <div className={`animate-spin rounded-full border-b-2 border-current ${size === 'sm' ? 'h-5 w-5' : 'h-8 w-8'}`}></div>
  </div>
);

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', isLoading = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus-visible:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 focus-visible:ring-slate-400'
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
};

// Card Component
interface CardProps {
  children: ReactNode;
  className?: string;
}
export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white dark:bg-slate-800 shadow-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 ${className}`}>
    {children}
  </div>
);
export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
    <div className={`p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 ${className}`}>
        {children}
    </div>
);
export const CardContent: React.FC<CardProps> = ({ children, className }) => (
    <div className={`p-4 sm:p-6 ${className}`}>
        {children}
    </div>
);
export const CardFooter: React.FC<CardProps> = ({ children, className }) => (
    <div className={`p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 ${className}`}>
        {children}
    </div>
);

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
    <input
      id={id}
      ref={ref}
      className={`block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
      {...props}
    />
  </div>
));

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, id, children, className, ...props }, ref) => (
    <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
        <select
            id={id}
            ref={ref}
            className={`block w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
            {...props}
        >
            {children}
        </select>
    </div>
));

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};
