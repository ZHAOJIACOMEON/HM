import type { Theme } from '../types'
import s from './SkyCelestial.module.css'

interface Props {
  theme: Theme
  /** 倒影里用的压缩副本：不参与交互，尺寸更小 */
  mirror?: boolean
}

const LINE = {
  fill: 'none',
  stroke: 'var(--line)',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  filter: 'url(#roughen)',
}

function Cloud({ className, scale = 1 }: { className: string; scale?: number }) {
  return (
    <svg className={className} viewBox="0 0 180 70" style={{ width: `${180 * scale}px` }} aria-hidden="true">
      <g {...LINE} stroke="var(--cloud)" opacity="0.9">
        <path d="M14 50 Q6 50 7 42 Q8 34 20 34 Q22 20 38 21 Q48 10 62 17 Q76 10 86 23 Q102 20 106 34 Q122 33 122 45 Q122 51 112 51 Z" />
        <path d="M28 60 Q52 65 76 60" opacity="0.35" strokeWidth="1" />
        <path d="M84 62 Q102 66 118 61" opacity="0.25" strokeWidth="1" />
      </g>
    </svg>
  )
}

function Sun() {
  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    const x1 = 50 + Math.cos(a) * 34
    const y1 = 50 + Math.sin(a) * 34
    const x2 = 50 + Math.cos(a) * 44
    const y2 = 50 + Math.sin(a) * 44
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.6" />
  })
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <g {...LINE} stroke="var(--accent)">
        <circle cx="50" cy="50" r="26" />
        {rays}
        <path d="M39 58 Q50 66 61 58" strokeWidth="1" opacity="0.55" />
      </g>
    </svg>
  )
}

export default function SkyCelestial({ theme, mirror = false }: Props) {
  const day = theme === 'day'
  return (
    <div className={`${s.root} ${mirror ? s.mirror : ''} ${day ? s.day : s.night}`} aria-hidden="true">
      <div className={s.sun}><Sun /></div>
      <div className={`${s.cloud} ${s.cloudA}`}><Cloud className={s.cloudSvg} scale={1} /></div>
      <div className={`${s.cloud} ${s.cloudB}`}><Cloud className={s.cloudSvg} scale={0.72} /></div>
      <div className={`${s.cloud} ${s.cloudC}`}><Cloud className={s.cloudSvg} scale={0.55} /></div>
    </div>
  )
}
