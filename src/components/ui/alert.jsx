import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const Alert = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    data-slot="alert"
    className={cn("ui-alert", className)}
    {...props}
  />
))
Alert.displayName = "Alert"

function AlertDescription({ className, ...props }) {
  return (
    <p
      data-slot="alert-description"
      className={cn("ui-alert__description", className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription }
