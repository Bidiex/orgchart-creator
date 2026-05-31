import { useState, useEffect, useCallback } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ocs_prefs_theme')
      if (saved === 'light' || saved === 'dark') {
        return saved
      }
    } catch (e) {
      console.error('Error reading theme preference from localStorage:', e)
    }
    return 'dark' // Default is dark theme
  })

  // Sincronizar el tema con document.documentElement y localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ocs_prefs_theme', theme)
    } catch (e) {
      console.error('Error saving theme preference to localStorage:', e)
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const isDark = theme === 'dark'

  return {
    theme,
    toggleTheme,
    isDark
  }
}
