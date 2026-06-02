import { useCallback, useEffect, useState } from 'react'

/**
 * Typisierter localStorage-Hook. Hält State und persistiert ihn im Browser.
 * Synchronisiert auch über mehrere Tabs hinweg (storage-Event).
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Speicher voll oder nicht verfügbar – ignorieren
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue) as T)
        } catch {
          // ignorieren
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue(next)
  }, [])

  return [value, update] as const
}

/** Einfache, kollisionsarme ID ohne externe Lib. */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
