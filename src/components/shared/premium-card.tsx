import * as React from "react"
import { cn } from "@/lib/utils"

export interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowOpacity?: string;
  innerClassName?: string;
  withBlobs?: boolean;
}

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, innerClassName, children, glowOpacity = "opacity-20 group-hover:opacity-50", withBlobs = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-3xl bg-[#171717] p-[1.5px] shadow-2xl",
          className
        )}
        {...props}
      >
        {/* Colorful Animated Border / Glow Behind */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 transition-opacity duration-700",
            glowOpacity
          )}
        />

        {/* Inner Card (Glassmorphism Shell) */}
        <div
          className={cn(
            "relative flex h-full flex-col bg-black/80 backdrop-blur-2xl rounded-[22px] overflow-hidden",
            innerClassName
          )}
        >
          {/* Decorative Mesh Blobs */}
          {withBlobs && (
            <>
              <div className="absolute -right-20 -top-20 h-48 w-48 bg-fuchsia-500/20 blur-[60px] rounded-full group-hover:bg-fuchsia-500/40 transition-colors duration-700 pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 h-48 w-48 bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-indigo-500/40 transition-colors duration-700 pointer-events-none" />
            </>
          )}

          <div className="relative z-10 flex h-full flex-col">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
PremiumCard.displayName = "PremiumCard"
