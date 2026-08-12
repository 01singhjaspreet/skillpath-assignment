import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("ui-badge", {
  variants: {
    variant: {
      default: "ui-badge--default",
      outline: "ui-badge--outline",
    },
  },
  defaultVariants: { variant: "default" },
})

function Badge({ className, variant, ...props }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
