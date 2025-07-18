import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:scale-105 shadow-sm",
        destructive: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:scale-105",
        outline: "border border-gray-200 bg-white hover:bg-gray-50 hover:text-primary-500 hover:border-primary-300 hover:shadow-md",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md",
        ghost: "hover:bg-gray-100 hover:text-primary-500 hover:scale-105",
        link: "text-primary-500 underline-offset-4 hover:underline hover:scale-105",
        premium: "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:scale-105 shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-full px-3",
        lg: "h-11 rounded-full px-8",
        icon: "h-10 w-10",
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
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
