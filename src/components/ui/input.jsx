import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    data-slot="input"
    className={cn("ui-input", className)}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }
