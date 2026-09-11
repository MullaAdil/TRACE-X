import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data...',
  size = 'md',
  className = 'h-64'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-3'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3.5 ${className}`}>
      <div className="relative">
        {/* Subtle glowing halo behind spinner */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-sm transform scale-125" />
        <div
          className={`${sizeClasses[size]} rounded-full border-blue-600/20 border-t-blue-600 animate-spin`}
          style={{ animationDuration: '0.8s' }}
        />
      </div>
      {message && (
        <p className="text-xs font-mono font-medium text-slate-500 tracking-wide select-none">
          {message}
        </p>
      )}
    </div>
  );
};
