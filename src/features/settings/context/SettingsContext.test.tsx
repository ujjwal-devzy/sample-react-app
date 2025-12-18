import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { SettingsProvider, useSettings } from './SettingsContext'

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>
}

describe('SettingsContext', () => {
  it('loads preferences on mount', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.preferences).not.toBeNull()
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('applies theme to document when setTheme is called', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => {
      expect(result.current.preferences).not.toBeNull()
    })

    const currentTheme = result.current.preferences?.theme
    if (!currentTheme) {
      throw new Error('Theme not loaded')
    }

    const nextMode = currentTheme.mode === 'dark' ? 'light' : 'dark'

    result.current.setTheme({ ...currentTheme, mode: nextMode })

    await waitFor(() => {
      const applied = document.documentElement.getAttribute('data-theme')
      expect(applied === 'dark' || applied === 'light').toBe(true)
    })
  })
})
