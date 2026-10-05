import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30",
  {
    variants: {
      variant: {
        default: "bg-ink-100 text-ink-900 border border-ink-200",
        admin: "bg-ink-800 text-white",
        teacher: "bg-gold/20 text-gold-dark border border-gold/30",
        student: "bg-sage-50 text-sage-dark border border-sage-100",
        supervisor: "bg-blue-50 text-blue-700 border border-blue-200",
        counselor: "bg-rose-50 text-rose-700 border border-rose-200",
        destructive: "bg-red-100 text-red-800 border border-red-200",
        outline: "text-ink-700 border border-ink-200 bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
