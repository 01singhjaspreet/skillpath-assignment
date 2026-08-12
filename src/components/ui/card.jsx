import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const Card = forwardRef(({ className, ...props }, ref) => (
  <article
    ref={ref}
    data-slot="card"
    className={cn("ui-card", className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("ui-card__content", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

export { Card, CardContent }
