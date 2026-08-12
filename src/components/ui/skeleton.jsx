import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton ui-skeleton", className)}
      {...props}
    />
  )
}

export { Skeleton }
