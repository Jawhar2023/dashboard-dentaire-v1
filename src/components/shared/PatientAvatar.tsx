import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface PatientAvatarProps {
  name: string
  avatar?: string
  profileEmoji?: string
  flag?: string
  countryCode?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = { sm: "h-8 w-8", md: "h-11 w-11", lg: "h-20 w-20" }
const emojiSizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" }
const codeSizes = { sm: "text-[8px] px-1", md: "text-[9px] px-1", lg: "text-[10px] px-1.5" }

export function PatientAvatar({
  name,
  avatar,
  profileEmoji,
  flag,
  countryCode,
  size = "md",
  className,
}: PatientAvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const useCharacter = !!avatar

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      <Avatar className={cn(sizes[size], "ring-2 ring-background shadow-sm")}>
        {useCharacter ? (
          <>
            <AvatarImage src={avatar} alt={name} className="object-cover scale-110" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </>
        ) : profileEmoji ? (
          <AvatarFallback className="bg-primary/10 font-normal">
            <span className={emojiSizes[size]}>{profileEmoji}</span>
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
        )}
      </Avatar>
      {(countryCode || flag) && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1 rounded-md bg-background/95 border border-border/60 font-semibold text-muted-foreground shadow-sm leading-none py-0.5",
            codeSizes[size]
          )}
        >
          {countryCode ?? flag}
        </span>
      )}
    </div>
  )
}
