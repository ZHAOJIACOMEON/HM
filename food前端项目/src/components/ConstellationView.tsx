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

function randomFor(seed: number) {
  let state = (seed >>> 0) || 1
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/** Scatter stable random positions across the full sky while keeping labels apart. */
function computeLayout(gifts: Gift[], width: number, height: number): Map<number, { x: number; y: number }> {
  const map = new Map<number, { x: number; y: number }>()
  const ordered = [...gifts].sort((a, b) => a.id - b.id)
  if (ordered.length === 0) return map

  const placed: Array<{ x: number; y: number; halfWidth: number }> = []
  const minY = Math.max(17, (height * 0.15 + 24) / height * 100)
  const maxY = 84

  for (const gift of ordered) {
    const halfWidth = Math.max(24, Math.min(88, Array.from(gift.name).length * 6.5))
    const minX = Math.max(12, (halfWidth + 20) / width * 100)
    const maxX = 100 - minX
    const random = randomFor(Math.imul(gift.id + 1, 0x9E3779B1))
    let bestPoint = { x: 50, y: 50 }
    let bestScore = Number.NEGATIVE_INFINITY
    let fallbackPoint = bestPoint
    let fallbackScore = Number.NEGATIVE_INFINITY

    for (let attempt = 0; attempt < 900; attempt++) {
      const candidate = {
        x: minX + random() * Math.max(0, maxX - minX),
        y: minY + random() * (maxY - minY),
      }
      let overlap = 0
      let nearest = Number.POSITIVE_INFINITY

      for (const other of placed) {
        const dx = Math.abs(candidate.x - other.x) * width / 100
        const dy = Math.abs(candidate.y - other.y) * height / 100
        nearest = Math.min(nearest, Math.hypot(dx, dy))

        const overlapX = halfWidth + other.halfWidth + 16 - dx
        const overlapY = 52 - dy
        if (overlapX > 0 && overlapY > 0) overlap += overlapX * overlapY
      }

      const spreadScore = (placed.length ? nearest : 0) + random() * 90
      const fallback = spreadScore - overlap * 4
      if (fallback > fallbackScore) {
        fallbackScore = fallback
        fallbackPoint = candidate
      }
      if (overlap === 0 && spreadScore > bestScore) {
        bestScore = spreadScore
        bestPoint = candidate
      }
    }

    if (bestScore === Number.NEGATIVE_INFINITY) bestPoint = fallbackPoint
    placed.push({ ...bestPoint, halfWidth })
    map.set(gift.id, bestPoint)
  }

  return map
}

export default function ConstellationView({
  open, gifts, seed, onToggle, onClose, onStartEdit, onDelete,
}: Props) {
  const [sinkingId, setSinkingId] = useState<number | null>(null)
  const [viewSize, setViewSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  useEffect(() => {
    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        setViewSize({ width: window.innerWidth, height: window.innerHeight })
      }, 120)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const handleDelete = (id: number) => {
    if (sinkingId !== null) return
    setSinkingId(id)
    timers.current.push(window.setTimeout(() => {
      onDelete(id)
      setSinkingId(null)
    }, 500))
  }

  const layout = useMemo(
    () => computeLayout(gifts, viewSize.width, viewSize.height),
    [gifts, viewSize],
  )
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
        <div className={s.landscape} aria-hidden="true">
          <svg viewBox="0 0 1440 460" preserveAspectRatio="none">
            <defs>
              <linearGradient id="starMapFarRange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#9eb7e6" stopOpacity="0.2" />
                <stop offset="1" stopColor="#31496f" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="starMapMidRange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#718bb7" stopOpacity="0.24" />
                <stop offset="1" stopColor="#20395f" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="starMapNearRange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#405e8a" stopOpacity="0.34" />
                <stop offset="1" stopColor="#142947" stopOpacity="0.52" />
              </linearGradient>
              <linearGradient id="starMapWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7f9fc9" stopOpacity="0.13" />
                <stop offset="0.35" stopColor="#496b9d" stopOpacity="0.11" />
                <stop offset="1" stopColor="#172c4d" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            <path
              d="M0 258 C62 255 83 218 126 210 C169 201 193 224 231 224 C271 224 282 151 321 118 C345 98 362 107 378 139 C400 184 419 235 454 240 C491 245 516 209 552 192 C588 175 617 194 650 221 C682 247 708 253 739 246 C773 238 779 166 818 132 C844 109 863 122 880 153 C905 198 921 236 954 240 C991 245 1027 207 1060 198 C1094 188 1115 222 1149 232 C1186 243 1225 147 1262 112 C1286 89 1308 102 1325 133 C1354 185 1391 204 1440 188V460H0Z"
              fill="url(#starMapFarRange)"
            />
            <path
              d="M0 258 C62 255 83 218 126 210 C169 201 193 224 231 224 C271 224 282 151 321 118 C345 98 362 107 378 139 C400 184 419 235 454 240 C491 245 516 209 552 192 C588 175 617 194 650 221 C682 247 708 253 739 246 C773 238 779 166 818 132 C844 109 863 122 880 153 C905 198 921 236 954 240 C991 245 1027 207 1060 198 C1094 188 1115 222 1149 232 C1186 243 1225 147 1262 112 C1286 89 1308 102 1325 133 C1354 185 1391 204 1440 188"
              fill="none" stroke="#bdcdef" strokeOpacity="0.18" strokeWidth="1"
            />
            <path
              d="M0 303 C75 299 104 264 150 257 C196 250 230 275 278 276 C325 277 354 209 397 189 C433 172 460 203 485 237 C514 278 536 299 574 297 C615 295 632 244 673 232 C715 220 741 253 770 281 C799 308 837 313 873 292 C909 271 915 228 952 212 C991 195 1022 232 1051 263 C1082 296 1116 310 1151 294 C1190 277 1206 238 1244 240 C1285 242 1314 284 1351 289 C1386 294 1413 262 1440 250V460H0Z"
              fill="url(#starMapMidRange)"
            />
            <path
              d="M0 303 C75 299 104 264 150 257 C196 250 230 275 278 276 C325 277 354 209 397 189 C433 172 460 203 485 237 C514 278 536 299 574 297 C615 295 632 244 673 232 C715 220 741 253 770 281 C799 308 837 313 873 292 C909 271 915 228 952 212 C991 195 1022 232 1051 263 C1082 296 1116 310 1151 294 C1190 277 1206 238 1244 240 C1285 242 1314 284 1351 289 C1386 294 1413 262 1440 250"
              fill="none" stroke="#c5d5f2" strokeOpacity="0.13" strokeWidth="1"
            />
            <path
              d="M0 338 C74 335 92 304 134 300 C178 296 206 332 250 338 C294 344 337 274 388 255 C429 240 451 279 476 312 C505 352 533 350 566 344 C601 337 619 302 657 297 C697 292 728 321 758 343 C791 368 829 372 861 353 C895 334 911 281 952 269 C993 257 1020 296 1053 327 C1085 358 1118 366 1152 352 C1190 336 1210 307 1247 308 C1288 309 1317 345 1350 352 C1385 359 1410 337 1440 320V460H0Z"
              fill="url(#starMapNearRange)"
            />
            <path d="M0 326 Q180 316 360 329 T720 326 T1080 330 T1440 320V460H0Z" fill="url(#starMapWater)" />
            <g fill="none" stroke="#bdd2f3" strokeLinecap="round">
              <path d="M0 342 Q170 333 340 342 T680 342 T1020 340 T1440 342" strokeOpacity="0.17" strokeWidth="1.1" />
              <path d="M90 370 Q250 363 410 370 T730 369 T1050 371 T1380 368" strokeOpacity="0.12" strokeWidth="1" />
              <path d="M0 400 Q210 393 420 400 T840 399 T1260 401 T1440 397" strokeOpacity="0.1" strokeWidth="1" />
              <path d="M250 426 Q430 421 610 426 T970 425 T1330 427" strokeOpacity="0.08" strokeWidth="1" />
            </g>
          </svg>
        </div>

        <header className={s.header}>
          <span className={s.eyebrow}>A CONSTELLATION OF MEMORIES</span>
          <h1 className={s.title}>星湖星图</h1>
          <p className={s.subtitle}>{gifts.length} 颗记忆星，静静发着光</p>
        </header>

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
