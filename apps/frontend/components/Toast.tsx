'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4500 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 py-3.5 px-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 max-w-md ${
        isSuccess
          ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-200'
          : 'bg-rose-950/95 border-rose-500/30 text-rose-200'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 animate-bounce" />
      ) : (
        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 animate-pulse" />
      )}
      
      <p className="text-xs font-semibold leading-relaxed flex-grow pr-2">{message}</p>
      
      <button
        onClick={onClose}
        className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
export default Toast;
