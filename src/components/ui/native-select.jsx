import { ChevronDown } from "lucide-react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const NativeSelect = forwardRef(({ className, children, ...props }, ref) => (
  <span className="ui-native-select__wrapper" data-slot="native-select-wrapper">
    <select
      ref={ref}
      data-slot="native-select"
      className={cn("ui-native-select", className)}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="ui-native-select__icon" aria-hidden="true" />
  </span>
))
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
