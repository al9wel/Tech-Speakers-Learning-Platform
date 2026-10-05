'use client'

import React from 'react'
import { useFormStatus } from 'react-dom'
import { LoadingSpinner } from './LoadingSpinner'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pendingText?: string
    children: React.ReactNode
}

export function SubmitButton({
    children,
    pendingText,
    className = '',
    disabled,
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus()
    const isDisabled = disabled || pending

    return (
        <button
            type="submit"
            disabled={isDisabled}
            className={`inline-flex items-center justify-center gap-2 transition-opacity ${
                isDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            } ${className}`}
            {...props}
        >
            {pending && <LoadingSpinner size="sm" />}
            {pending ? (pendingText || 'يرجى الانتظار...') : children}
        </button>
    )
}
