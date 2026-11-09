import { useEffect, useState } from 'react'

/** État persistant par navigateur (progression, brouillons). Tolère un stockage indisponible. */
export function useStored<T>(key: string, initial: T) {
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
      /* stockage indisponible : on garde l'état en mémoire */
    }
  }, [key, value])
  return [value, setValue] as const
}
