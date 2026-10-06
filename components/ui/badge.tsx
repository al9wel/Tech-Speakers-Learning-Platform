import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-accent/40 border",
  {
    variants: {
      variant: {
        default: "bg-bg-alt text-ink-primary border-border-base",
        admin: "bg-ink-primary text-white border-transparent",
        teacher: "bg-amber-bg text-amber border-amber/30",
        student: "bg-accent-bg text-accent border-accent/30",
        supervisor: "bg-[#eef3f7] text-[#2c5270] border-[#c8d8e5]",
        counselor: "bg-[#fbf0ee] text-[#8a3e38] border-[#ebd4d1]",
        destructive: "bg-error-bg text-error border-error/30",
        outline: "text-ink-secondary border-border-base bg-bg-surface",
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
