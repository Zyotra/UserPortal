import React from 'react';
import ZyotraLogo from './ZyotraLogo';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullScreen?: boolean;
    className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false, className = '' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const loaderContent = (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div className={`relative ${sizeClasses[size]}`}>
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping"></div>

                {/* Spinning ring */}
                <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin"></div>

                {/* Centered Logo with pulse */}
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <ZyotraLogo className="w-2/3 h-2/3" />
                </div>
            </div>
            <p className="text-sm font-medium text-gray-400 animate-pulse tracking-wider uppercase text-[10px]">
                Loading
            </p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4">
            {loaderContent}
        </div>
    );
};

export default Loader;
