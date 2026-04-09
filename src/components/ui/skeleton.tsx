import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/20 relative overflow-hidden",
        "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-primary/10 after:to-transparent after:animate-shimmer after:-translate-x-full",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
