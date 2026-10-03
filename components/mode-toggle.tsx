"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full bg-secondary">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-10 w-10 rounded-full bg-secondary/80 hover:bg-primary/10"
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-primary-foreground" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-primary-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
