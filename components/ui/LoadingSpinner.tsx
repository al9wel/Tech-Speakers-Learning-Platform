import React from 'react'

export function LoadingSpinner({
    size = 'md',
    className = '',
}: {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-5 h-5 border-2',
        lg: 'w-8 h-8 border-3',
    }[size]

    return (
        <span
            className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses} ${className}`}
            role="status"
            aria-label="جاري التحميل"
        />
    )
}
