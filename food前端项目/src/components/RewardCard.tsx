import { useRef } from 'react'
import type { Gift } from '../types'
import s from './RewardCard.module.css'

interface Props {
  gift: Gift
  onClose: () => void
  onRedraw: () => void
}

const rarity = (w: number) => (w >= 3 ? '稀有' : w === 2 ? '少见' : '寻常')

/* 心情文案：随机抽一句，印在便签上 */
const QUOTES = [
  '允许心情偶尔的乌云',
  '风会把烦恼吹散的',
  '慢慢来，一切都来得及',
  '今天也要对自己温柔一点',
  '坏心情也会过期的',
  '星星会记得你的愿望',
  '云散之后，月色更亮',
  '把今天的褶皱，留给明天抚平',
]

/** 奖品以"手写便签"呈现：roughen 抖动手绘纸片 + 手写字排版 + 心情文案 */
export default function RewardCard({ gift, onClose, onRedraw }: Props) {
  const quote = useRef(QUOTES[Math.floor(Math.random() * QUOTES.length)]).current
  const sub = `${rarity(gift.weight)} · ¥${gift.price.toFixed(0)}`

  return (
    <div className={s.wrap}>
      {/* 透明遮罩：点击卡片之外的任意区域关闭便签 */}
      <div className={s.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        className={s.card}
        role="button"
        tabIndex={0}
        aria-label={`抽到 ${gift.name}，${sub}。按回车收起`}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClose()
          }
        }}
      >
      {/* 手绘纸片：歪斜边缘 + 铅笔描边 + 内侧淡描线 */}
      <svg className={s.paper} viewBox="0 0 340 250" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="notePaper" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#FFFAEB" />
            <stop offset="78%" stopColor="#FFF3D6" />
            <stop offset="100%" stopColor="#FBEBC4" />
          </linearGradient>
        </defs>
        <g filter="url(#roughen)">
          <path
            d="M 16 18 C 92 10, 246 13, 324 20 C 329 82, 327 168, 320 230 C 238 238, 102 236, 22 228 C 14 164, 16 84, 16 18 Z"
            fill="url(#notePaper)"
            stroke="rgba(58, 52, 39, 0.55)"
            strokeWidth="1.6"
          />
          <path
            d="M 26 30 C 96 24, 240 26, 312 32"
            fill="none" stroke="rgba(58, 52, 39, 0.14)" strokeWidth="1"
          />
        </g>
      </svg>

      <div className={s.tape} aria-hidden="true" />

      <div className={s.body}>
        <span className={s.stamp}>今日份小礼物</span>
        <div className={s.name}>
          {gift.name}
          <svg className={s.scribble} viewBox="0 0 120 8" aria-hidden="true">
            <path
              d="M 3 5 C 22 1, 38 7, 58 4 C 78 1, 96 6, 117 3"
              fill="none" stroke="rgba(58, 52, 39, 0.4)" strokeWidth="1.4" strokeLinecap="round" filter="url(#roughen)"
            />
          </svg>
        </div>
        <div className={s.quote}>「 {quote} 」</div>
        <div className={s.foot}>
          <span>{sub}</span>
          <i aria-hidden="true" />
          <button
            type="button"
            className={s.redraw}
            onClick={(e) => { e.stopPropagation(); onRedraw() }}
          >
            再抽一次
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
