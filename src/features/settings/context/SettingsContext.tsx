import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SettingsContextValue, ThemePreference, UserPreferences, NotificationPreferences } from '../types'
import { settingsService } from '../services/settingsService'

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await settingsService.getPreferences()
      setPreferences(data)
      await settingsService.setTheme(data.theme)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load preferences'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      setIsLoading(true)
      setError(null)
      const updated = await settingsService.updatePreferences(updates)
      setPreferences(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const reset = await settingsService.resetPreferences()
      setPreferences(reset)
      await settingsService.setTheme(reset.theme)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset preferences'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setTheme = useCallback((theme: ThemePreference) => {
    settingsService.setTheme(theme).catch(() => undefined)
    setPreferences(prev => (prev ? { ...prev, theme } : prev))
  }, [])

  const updateNotificationPreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      try {
        setIsLoading(true)
        setError(null)
        const notifications = await settingsService.updateNotificationPreferences(updates)
        setPreferences(prev => (prev ? { ...prev, notifications } : prev))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update notification preferences'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const value: SettingsContextValue = useMemo(
    () => ({
      preferences,
      isLoading,
      error,
      loadPreferences,
      updatePreferences,
      resetPreferences,
      setTheme,
      updateNotificationPreferences,
    }),
    [preferences, isLoading, error, loadPreferences, updatePreferences, resetPreferences, setTheme, updateNotificationPreferences],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
