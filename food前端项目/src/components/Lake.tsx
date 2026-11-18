import { horizonY, useViewport } from '../hooks/useViewport'
import s from './Lake.module.css'

export default function Lake() {
  const { w, h } = useViewport()
  const samples = Array.from({ length: 49 }, (_, i) => {
    const x = (w * i) / 48
    return `${x.toFixed(1)} ${horizonY(x, w, h).toFixed(1)}`
  })
  const curve = `M ${samples.join(' L ')}`
  const water = `${curve} L ${w} ${h} L 0 ${h} Z`
  const deep = h - horizonY(w / 2, w, h)

  const waves = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10
    const y = horizonY(w / 2, w, h) + deep * t
    const amp = 3 + t * 9
    const width = w * (0.22 + t * 0.5)
    const x = (w - width) / 2 + Math.sin(i * 2.3) * w * 0.08
    return (
      <path
        key={i}
        className={s.wave}
        style={{ animationDelay: `${-i * 1.8}s`, animationDuration: `${9 + i * 2}s` }}
        d={`M ${x} ${y} Q ${x + width * 0.25} ${y - amp} ${x + width * 0.5} ${y} T ${x + width} ${y}`}
        strokeWidth={i < 3 ? 1.4 : 1}
        opacity={(0.32 - t * 0.22).toFixed(2)}
      />
    )
  })

  return (
    <svg className={s.root} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="lakeFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lake-top)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--lake-bottom)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="lakeFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.85" />
          <stop offset="70%" stopColor="white" stopOpacity="0.45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="lakeMask"><rect x="0" y="0" width={w} height={h} fill="url(#lakeFade)" /></mask>
        <filter id="horizonGlow" x="-10%" y="-300%" width="120%" height="700%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <g mask="url(#lakeMask)">
        <path d={water} fill="url(#lakeFill)" />
        <g fill="none" stroke="var(--line)" strokeLinecap="round">
          {waves}
        </g>
      </g>

      <path d={curve} fill="none" stroke="var(--accent)" strokeWidth="3" opacity="0.42" filter="url(#horizonGlow)" />
      <path d={curve} fill="none" stroke="var(--line)" strokeWidth="1.6" opacity="0.72" filter="url(#roughen)" />
    </svg>
  )
}
