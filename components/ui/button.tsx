import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-gold/50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-ink-700 text-white hover:bg-ink-800 shadow-soft",
        primary: "bg-ink-700 text-white hover:bg-ink-800 shadow-soft",
        gold: "bg-gold text-ink-900 hover:bg-gold-dark hover:text-white shadow-soft font-semibold",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-soft",
        outline: "border border-ink-200 text-ink-700 bg-white/70 hover:bg-ink-50 hover:border-ink-300",
        secondary: "bg-ink-100 text-ink-800 hover:bg-ink-200",
        ghost: "text-ink-700 hover:bg-ink-50 hover:text-ink-900",
        link: "text-ink-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "size-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
