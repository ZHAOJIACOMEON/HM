import { useCallback, useEffect, useRef, useState } from 'react'
import type { Theme } from '../types'
import { load, save } from '../lib/storage'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => load<Theme>('theme', 'night'))
  const [wiping, setWiping] = useState(false)
  /** 每次切换自增，供星空做「逐个点亮」用 */
  const [switchSeq, setSwitchSeq] = useState(0)
  const cooling = useRef(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    save('theme', theme)
  }, [theme])

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout)
  }, [])

  const toggle = useCallback(() => {
    if (cooling.current) return
    cooling.current = true
    setWiping(true)
    setTheme((prev) => (prev === 'night' ? 'day' : 'night'))
    setSwitchSeq((n) => n + 1)

    timers.current.push(
      window.setTimeout(() => setWiping(false), 820),
      window.setTimeout(() => { cooling.current = false }, 900), // 900ms 冷却
    )
  }, [])

  return { theme, toggle, wiping, switchSeq }
}
