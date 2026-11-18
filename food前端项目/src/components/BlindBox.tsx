import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import type { DrawPhase, Gift } from '../types'
import RewardCard from './RewardCard'
import s from './BlindBox.module.css'

interface Props {
  phase: DrawPhase
  reward: Gift | null
  mood: string | null
  moodKey: number
  onDraw: () => void
  onCloseReward: () => void
  onRedraw: () => void
}

/**
 * 天降礼物盒：天空顶端一道平滑曲线撕口，透出即将升起的太阳的暖光；
 * 白色绳索从撕口尖端垂下（长约到水面上方 100px），吊着两只线稿礼物盒：
 * 左盒暖金色 = 好心情，右盒青色 = 坏心情。
 * 每条手臂（绳+盒）各自以撕口尖端为轴摆动；点击哪只，哪只摇晃并开盖。
 */
interface BoxArt {
  transform: string
  body: string
  hatch: string
  ribbon: string
  lid: string
  bowL: string
  bowR: string
  knot: { x: number; y: number; r: number }
}

const LEFT: BoxArt = {
  transform: 'translate(60 490) rotate(-8) scale(2)',
  body: 'M -27 -8 C -29 4 -28 16 -25 22 C -9 25 11 25 26 21 C 29 10 28 -3 25 -9 C 8 -13 -11 -12 -27 -8 Z',
  hatch: 'M -18 2 L -12 14 M -8 0 L -2 14 M 2 0 L 8 13',
  ribbon: 'M 0 -25 C 1 -12 0 8 1 21',
  lid: 'M -31 -10 C -13 -14 13 -14 30 -10 C 32 -15 31 -20 28 -23 C 9 -26 -13 -26 -28 -23 C -31 -19 -31 -14 -31 -10 Z',
  bowL: 'M 0 -26 C -7 -35 -18 -33 -13 -26 C -10 -22 -4 -23 0 -26 Z',
  bowR: 'M 0 -26 C 7 -35 18 -33 13 -26 C 10 -22 4 -23 0 -26 Z',
  knot: { x: 0, y: -26, r: 2.2 },
}

const RIGHT: BoxArt = {
  transform: 'translate(200 498) rotate(5) scale(2)',
  body: 'M -30 -9 C -32 5 -31 18 -27 24 C -9 27 13 27 29 23 C 33 11 32 -4 28 -10 C 9 -14 -13 -13 -30 -9 Z',
  hatch: 'M -20 2 L -13 16 M -9 0 L -2 15 M 3 1 L 10 14 M 14 -1 L 20 11',
  ribbon: 'M 1 -27 C 2 -12 0 9 1 23',
  lid: 'M -34 -11 C -14 -15 14 -15 33 -11 C 35 -17 34 -22 30 -25 C 10 -28 -15 -28 -31 -25 C -34 -21 -34 -15 -34 -11 Z',
  bowL: 'M 1 -27 C -6 -37 -19 -34 -13 -27 C -10 -23 -4 -24 1 -27 Z',
  bowR: 'M 1 -27 C 8 -37 21 -34 15 -27 C 12 -23 6 -24 1 -27 Z',
  knot: { x: 1, y: -27, r: 2.4 },
}

/* 绳索：均从撕口尖端 (130,52) 垂下，长度到水面上方约 100px */
const ROPE_L = 'M 130 52 C 118 190 80 320 50 422'
const ROPE_R = 'M 130 52 C 142 200 178 330 207 429'

/* 撕口：平滑曲线围成的三角形区域，光从内部透出 */
const TEAR_FILL = 'M 54 4 C 96 16 122 32 130 52 C 138 32 164 16 206 4 Z'
const TEAR_EDGE_L = 'M 54 4 C 96 16 122 32 130 52'
const TEAR_EDGE_R = 'M 206 4 C 164 16 138 32 130 52'

const SPARK_PATH = 'M 0 -6 L 1.7 -1.7 L 6 0 L 1.7 1.7 L 0 6 L -1.7 1.7 L -6 0 L -1.7 -1.7 Z'
const SPARKS = [
  { x: 26, y: 400, scale: 1, delay: 0 },
  { x: 238, y: 420, scale: 0.8, delay: 900 },
  { x: 130, y: 340, scale: 0.65, delay: 1600 },
  { x: 240, y: 580, scale: 0.85, delay: 500 },
  { x: 22, y: 572, scale: 0.7, delay: 1300 },
]

const BURST = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * 360,
  dist: 70 + (i % 3) * 22,
  delay: (i % 4) * 30,
}))

function GiftBox({ box, lidClass }: { box: BoxArt; lidClass?: string }) {
  return (
    <g transform={box.transform}>
      <path d={box.body} />
      <path d={box.hatch} strokeWidth="0.45" opacity="0.5" />
      <path d={box.ribbon} />
      {/* 盒盖 + 蝴蝶结：被点击的盒子在"开盖"阶段飞出 */}
      <g className={lidClass}>
        <path d={box.lid} />
        <path d={box.bowL} />
        <path d={box.bowR} />
        <circle cx={box.knot.x} cy={box.knot.y} r={box.knot.r} />
      </g>
    </g>
  )
}

export default function BlindBox({ phase, reward, mood, moodKey, onDraw, onCloseReward, onRedraw }: Props) {
  const phaseClass = {
    idle: s.idle,
    charge: s.charge,
    shake: s.shake,
    open: s.open,
    reveal: s.reveal,
    empty: s.empty,
  }[phase]

  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<'left' | 'right'>('left')

  /** 按点击位置落在左/右半区，决定哪只盒子摇晃 */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (phase !== 'idle') return
    const rect = rootRef.current?.getBoundingClientRect()
    const isLeft = rect ? e.clientX - rect.left < rect.width / 2 : true
    setActive(isLeft ? 'left' : 'right')
    onDraw()
  }

  return (
    <>
      <div
        ref={rootRef}
        className={`${s.root} ${phaseClass} ${active === 'left' ? s.activeL : s.activeR}`}
      >
      <div className={s.float}>
        <button
          type="button"
          className={s.hit}
          onClick={handleClick}
          disabled={phase !== 'idle'}
          aria-label="点击一只礼物盒抽取今日盲盒"
        >
          <svg viewBox="0 0 260 640" preserveAspectRatio="xMidYMin meet" className={s.art} aria-hidden="true">
            <defs>
              <radialGradient id="sunTear" cx="50%" cy="35%" r="75%">
                <stop offset="0%" stopColor="#FFF4CF" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#FFD98A" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#FFC857" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g className={s.rough} fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round">
              {/* 天空撕口：平滑曲线 + 内部透出的暖光 */}
              <g className={s.tear}>
                <path d={TEAR_FILL} fill="url(#sunTear)" stroke="none" />
                <path d={TEAR_EDGE_L} strokeWidth="2" />
                <path d={TEAR_EDGE_R} strokeWidth="2" />
              </g>

              {/* 左手臂：绳 + 暖金色盒（好心情） */}
              <g className={s.armL}>
                <path d={ROPE_L} strokeWidth="1.3" />
                <g className={s.boxL}>
                  <g className={s.boxPulse}>
                    <g stroke="var(--accent)" strokeWidth="1">
                      <GiftBox box={LEFT} lidClass={`${s.lid} ${s.lidL}`} />
                    </g>
                  </g>
                </g>
              </g>

              {/* 右手臂：绳 + 青色盒（坏心情） */}
              <g className={s.armR}>
                <path d={ROPE_R} strokeWidth="1.3" />
                <g className={s.boxR}>
                  <g className={s.boxPulse}>
                    <g stroke="var(--accent2)" strokeWidth="1">
                      <GiftBox box={RIGHT} lidClass={`${s.lid} ${s.lidR}`} />
                    </g>
                  </g>
                </g>
              </g>

              {/* 点点星光 */}
              {SPARKS.map((sp, i) => (
                <g key={i} transform={`translate(${sp.x} ${sp.y}) scale(${sp.scale})`}>
                  <path
                    className={s.spark}
                    d={SPARK_PATH}
                    style={{ animationDelay: `${sp.delay}ms` }}
                    strokeWidth="1.1"
                  />
                </g>
              ))}
            </g>
          </svg>
        </button>
      </div>

      {/* 开盖时的星屑 */}
      <div className={s.burst} aria-hidden="true">
        {BURST.map((b, i) => (
          <i
            key={i}
            style={{
              ['--angle' as string]: `${b.angle}deg`,
              ['--dist' as string]: `${b.dist}px`,
              ['--delay' as string]: `${b.delay}ms`,
            }}
          />
        ))}
      </div>

      {mood && (
        <span key={moodKey} className={s.mood} aria-hidden="true">{mood}</span>
      )}

      {/* 奖品卡片渲染在 .root 之外：root 带 transform 会让 fixed 相对它定位，导致卡片被限制在顶部 */}
      </div>

      {reward && phase === 'reveal' && (
        <RewardCard gift={reward} onClose={onCloseReward} onRedraw={onRedraw} />
      )}
    </>
  )
}
