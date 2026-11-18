import { useState } from 'react'
import { load, save } from '../lib/storage'
import s from './CornerFold.module.css'

interface Props {
  onToggle: () => void
  muted?: boolean
}

export default function CornerFold({ onToggle, muted = false }: Props) {
  const [seen, setSeen] = useState(() => load<boolean>('fold-seen', false))

  const handleClick = () => {
    if (!seen) {
      save('fold-seen', true)
      setSeen(true)
    }
    onToggle()
  }

  return (
    <button
      type="button"
      className={`${s.root} ${seen ? '' : s.guide} ${muted ? s.muted : ''}`}
      onClick={handleClick}
      aria-label="切换昼夜主题"
    >
      <svg viewBox="0 0 100 100" className={s.svg} aria-hidden="true">
        <path className={s.shade} d="M0 0 L104 0 L0 104 Z" fill="var(--shadow-ink)" opacity="0.16" />
        <g className={s.flap}>
          <path d="M0 0 L96 0 L0 96 Z" fill="var(--sky-top)" opacity="0.5" />
          <path d="M0 0 L96 0 L0 96 Z" fill="none" stroke="var(--line)" strokeWidth="1.6" filter="url(#roughen)" />
          <path d="M96 0 L0 96" fill="none" stroke="var(--line-soft)" strokeWidth="1" strokeDasharray="3 4" />
          <path d="M9 9 L62 9" stroke="var(--line-faint)" strokeWidth="1" />
        </g>
      </svg>
      <span className={s.hint} aria-hidden="true">
        <svg viewBox="0 0 44 18" className={s.arrow}>
          <path d="M40 9 L8 9 M14 3 L7 9 L14 15" fill="none" stroke="var(--accent)" strokeWidth="1.2" filter="url(#roughen)" />
        </svg>
        <span>点我</span>
      </span>
    </button>
  )
}
