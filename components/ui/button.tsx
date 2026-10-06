import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-accent text-white hover:bg-accent-light",
        primary: "bg-accent text-white hover:bg-accent-light",
        gold: "bg-amber text-white hover:bg-[#8c531d]",
        destructive: "bg-error text-white hover:bg-[#8a3333]",
        outline: "border border-border-base bg-bg-surface text-ink-primary hover:bg-bg-alt hover:border-ink-muted/40",
        secondary: "bg-bg-alt text-ink-primary hover:bg-[#eae4da]",
        ghost: "text-ink-secondary hover:text-ink-primary hover:bg-bg-alt",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5 py-1.5 text-sm",
        sm: "h-7 rounded-[4px] px-2.5 text-xs",
        lg: "h-10 rounded-md px-5 text-sm font-medium",
        icon: "size-8 rounded-md",
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
