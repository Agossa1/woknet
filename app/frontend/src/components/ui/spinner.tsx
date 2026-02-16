'use client';

import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'white' | 'black' | 'current';
    className?: string;
    label?: string;
}

export function Spinner({
    size = 'md',
    color = 'primary',
    className = '',
    label
}: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4',
    };

    const colorClasses = {
        primary: 'border-blue-600 border-t-transparent',
        white: 'border-white border-t-transparent',
        black: 'border-black border-t-transparent',
        current: 'border-current border-t-transparent',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full 
          animate-spin 
          transition-all 
          duration-300
        `}
            />
            {label && (
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">
                    {label}
                </p>
            )}
        </div>
    );
}

export function FullPageSpinner() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md">
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />

                <div className="relative flex flex-col items-center gap-6">
                    <Spinner size="lg" label="Chargement WorkNet" />
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-blue-600"
                                style={{ animation: `bounce 1s infinite ${i * 0.2}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
