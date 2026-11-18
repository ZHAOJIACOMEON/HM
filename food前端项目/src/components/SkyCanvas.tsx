import { useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useStarField } from '../hooks/useStarField'
import type { Theme } from '../types'
import s from './SkyCanvas.module.css'

interface Props {
  theme: Theme
  switchSeq: number
  reduced: boolean
  pulseRef: MutableRefObject<(() => void) | null>
  rippleRef: MutableRefObject<((x: number, strong?: boolean) => void) | null>
}

export default function SkyCanvas({ theme, switchSeq, reduced, pulseRef, rippleRef }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  useStarField(ref, { theme, switchSeq, reduced, pulseRef, rippleRef })
  return <canvas ref={ref} className={s.canvas} aria-hidden="true" />
}
