"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

function ThemeProviderContent({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const pathname = usePathname()
  const [theme, setTheme] = React.useState<Theme>(
    () => (typeof window !== "undefined" && (localStorage.getItem(storageKey) as Theme)) || defaultTheme
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    // Force light mode for non-admin routes
    const isAdminRoute = pathname?.startsWith("/admin")
    const effectiveTheme = isAdminRoute ? theme : "light"

    const currentTheme = root.classList.contains("dark") ? "dark" : "light"
    const newTheme = effectiveTheme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : effectiveTheme

    if (currentTheme !== newTheme) {
      root.classList.remove("light", "dark")
      root.classList.add(newTheme)
    }
  }, [theme, pathname])

  // Listen for system theme changes when using system theme
  React.useEffect(() => {
    const isAdminRoute = pathname?.startsWith("/admin")
    if (theme === "system" && isAdminRoute) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => {
        const root = window.document.documentElement
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        root.classList.remove("light", "dark")
        root.classList.add(systemTheme)
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, pathname])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function ThemeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProviderContent {...props} />
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
