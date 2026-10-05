"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      dir="rtl"
      className="toaster group font-sans"
      icons={{
        success: <CircleCheckIcon className="size-4 text-sage-dark" />,
        info: <InfoIcon className="size-4 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-4 text-gold-dark" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin text-ink-700" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-ink-900 group-[.toaster]:border-ink-100/80 group-[.toaster]:shadow-card group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-ink-500",
          actionButton:
            "group-[.toast]:bg-ink-700 group-[.toast]:text-white group-[.toast]:rounded-xl",
          cancelButton:
            "group-[.toast]:bg-ink-50 group-[.toast]:text-ink-700 group-[.toast]:rounded-xl",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
