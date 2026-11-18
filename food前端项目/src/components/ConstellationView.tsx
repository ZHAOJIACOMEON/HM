import { useEffect, useMemo, useRef, useState } from 'react'
import type { Gift } from '../types'
import GiftStar from './GiftStar'
import s from './ConstellationView.module.css'

export interface SeedPoint { x: number; y: number; key: number }

interface Props {
  open: boolean
  gifts: Gift[]
  seed: SeedPoint | null
  onToggle: () => void
  onClose: () => void
  onStartEdit: (id: number) => void
  onDelete: (id: number) => void
}

/**
 * 星星布局：黄金角螺旋（向日葵种子排列）+ 最小间距约束，
 * 按 id 排序确定性排布，任意两颗星星（含名字标签）互不重叠。
 * 坐标为百分比；x 距离权重较低，因为名字标签是横向的。
 */
function computeLayout(gifts: Gift[]): Map<number, { x: number; y: number }> {
  const map = new Map<number, { x: number; y: number }>()
  const placed: { x: number; y: number }[] = []
  const GOLDEN_ANGLE = 2.399963229728653
  const CX = 50
  const CY = 45
  const MIN_DIST = 13.5

  const ordered = [...gifts].sort((a, b) => a.id - b.id)
  for (const gift of ordered) {
    let point = { x: CX, y: CY }
    for (let i = 1; i < 900; i++) {
      const r = 2.1 * Math.sqrt(i)
      const x = CX + r * 2.05 * Math.cos(i * GOLDEN_ANGLE)
      const y = CY + r * 1.25 * Math.sin(i * GOLDEN_ANGLE)
      if (x < 6 || x > 94 || y < 11 || y > 78) continue
      const far = placed.every(
        (p) => Math.hypot((p.x - x) * 0.85, (p.y - y) * 1.9) >= MIN_DIST,
      )
      if (far) { point = { x, y }; break }
    }
    placed.push(point)
    map.set(gift.id, point)
  }
  return map
}

export default function ConstellationView({
  open, gifts, seed, onToggle, onClose, onStartEdit, onDelete,
}: Props) {
  const [sinkingId, setSinkingId] = useState<number | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const handleDelete = (id: number) => {
    if (sinkingId !== null) return
    setSinkingId(id)
    timers.current.push(window.setTimeout(() => {
      onDelete(id)
      setSinkingId(null)
    }, 500))
  }

  const layout = useMemo(() => computeLayout(gifts), [gifts])
  const points = gifts.map((g) => ({ ...(layout.get(g.id) ?? { x: 50, y: 45 }), id: g.id }))

  return (
    <>
      <button
        type="button"
        className={`${s.entry} ${open ? s.entryOpen : ''}`}
        onClick={onToggle}
        aria-label={open ? '返回星湖' : '打开星空收藏'}
      >
        {/* 纸飞机：柔曲线稿 + 虚线航迹，呼吸微光引导点击 */}
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <g fill="none" stroke="var(--line)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#roughen)">
            {/* 航迹：机尾左下方的独立虚线弧，加重、与机身脱开 */}
            <path d="M2 42.5 C 6 41.8, 9.5 40.5, 12.5 39.3" strokeWidth="1.6" strokeDasharray="3 3.5" opacity="0.7" />
            {/* 上翼边缘：舒展的浅弧 */}
            <path d="M39 9 C 28.5 11, 15.5 14.2, 5 18" />
            {/* 折痕（机身线） */}
            <path d="M39 9 C 31.5 18, 24.5 24.5, 17 28" strokeWidth="1.2" opacity="0.75" />
            {/* 下翼轮廓：饱满对称，收尾干净 */}
            <path d="M5 18 C 9 21.5, 13 25, 17 28 C 16 31.5, 14.5 35, 13 39 C 20 32, 30 20, 39 9" />
          </g>
        </svg>
      </button>

      <div
        className={`${s.view} ${open ? s.open : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      >
        <svg className={s.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {points.slice(1).map((p, i) => (
            <line
              key={p.id}
              x1={points[i].x} y1={points[i].y} x2={p.x} y2={p.y}
              stroke="var(--line-soft)" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.55"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {seed && (
          <span key={seed.key} className={s.seed} style={{ left: seed.x, top: seed.y }} aria-hidden="true" />
        )}

        {gifts.map((gift) => {
          const p = layout.get(gift.id) ?? { x: 50, y: 45 }
          return (
            <GiftStar
              key={gift.id}
              gift={gift}
              x={p.x}
              y={p.y}
              sinking={sinkingId === gift.id}
              onClick={() => onStartEdit(gift.id)}
              onDelete={() => handleDelete(gift.id)}
            />
          )
        })}
      </div>
    </>
  )
}
