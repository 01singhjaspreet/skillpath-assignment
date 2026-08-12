import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva("button ui-button", {
  variants: {
    variant: {
      default: "button--primary",
      secondary: "button--secondary",
      ghost: "button--ghost",
      link: "text-button",
    },
    size: {
      default: "",
      sm: "ui-button--sm",
      icon: "ui-button--icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

const Button = forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
