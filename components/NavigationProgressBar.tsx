'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgressBar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isNavigating, setIsNavigating] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Complete the progress when route change completes
        setIsNavigating(false)
        setProgress(100)
        const timer = setTimeout(() => {
            setProgress(0)
        }, 200)
        return () => clearTimeout(timer)
    }, [pathname, searchParams])

    useEffect(() => {
        // Intercept all internal link clicks to trigger progress immediately
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a')
            if (!target) return

            const href = target.getAttribute('href')
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || target.target === '_blank') {
                return
            }

            // If navigating to different path or search params
            const currentUrl = window.location.pathname + window.location.search
            if (href !== currentUrl) {
                setIsNavigating(true)
                setProgress(35)
                setTimeout(() => setProgress(75), 100)
            }
        }

        window.addEventListener('click', handleClick, true)
        return () => window.removeEventListener('click', handleClick, true)
    }, [])

    if (!isNavigating && progress === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
            <div
                className="h-full bg-accent transition-all duration-300 ease-out shadow-[0_0_10px_rgba(45,95,93,0.6)]"
                style={{
                    width: `${progress}%`,
                    opacity: progress === 100 ? 0 : 1,
                    transition: progress === 100 ? 'width 0.1s ease-out, opacity 0.3s ease-out' : 'width 0.4s ease-out',
                }}
            />
        </div>
    )
}
