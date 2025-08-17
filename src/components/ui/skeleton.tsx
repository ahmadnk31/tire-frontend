import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "shimmer" | "wave" | "pulse"
}) {
  const baseClasses = "rounded-md bg-muted";
  
  const variantClasses = {
    default: "animate-pulse",
    shimmer: "skeleton-shimmer",
    wave: "skeleton-wave animate-pulse",
    pulse: "animate-pulse"
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
}

export { Skeleton }
