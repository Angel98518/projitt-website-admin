import React from 'react';

interface LoadingSpinnerProps {
    content?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    spinnerClassName?: string;
    contentClassName?: string;
    minHeight?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    content = "Loading...",
    size = 'md',
    className = "",
    spinnerClassName = "",
    contentClassName = "",
    minHeight = "h-64"
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    const contentSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className={`flex justify-center items-center ${minHeight} ${className}`}>
            <div className="flex items-center gap-2">
                <div className={`animate-spin rounded-full border-b-2 border-[#0d978b] ${sizeClasses[size]} ${spinnerClassName}`}></div>
                {content && (
                    <span className={`text-[#4b4b4b] ${contentSizeClasses[size]} ${contentClassName}`}>
                        {content}
                    </span>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;
