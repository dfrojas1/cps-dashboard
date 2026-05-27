import { useState, useCallback } from 'react'

const PREFIX = 'cps_'

export default function useLocalStorage(key, defaultValue) {
  const prefixedKey = PREFIX + key

  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(prefixedKey)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          localStorage.setItem(prefixedKey, JSON.stringify(resolved))
        } catch {
          /* quota exceeded — keep state in memory only */
        }
        return resolved
      })
    },
    [prefixedKey],
  )

  const remove = useCallback(() => {
    setValue(defaultValue)
    localStorage.removeItem(prefixedKey)
  }, [prefixedKey, defaultValue])

  return [value, set, remove]
}
