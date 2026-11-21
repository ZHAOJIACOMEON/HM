import { useDragStar } from '../hooks/useDragStar'
import { useViewport } from '../hooks/useViewport'
import type { Gift } from '../types'
import s from './GiftStar.module.css'

interface Props {
  gift: Gift
  x: number
  y: number
  sinking: boolean
  /** 点击星星：打开编辑卡片 */
  onClick: () => void
  /** 向下拖入湖面删除 */
  onDelete: () => void
}

export default function GiftStar({ gift, x, y, sinking, onClick, onDelete }: Props) {
  const { h } = useViewport()
  /* 点击统一在根节点处理（pointer capture 重定向），子元素 onClick 收不到 */
  const { drag, handlers } = useDragStar((dy) => {
    if (dy > Math.max(90, h * 0.13)) onDelete()
  }, onClick)

  return (
    <div
      className={`${s.root} ${drag.active ? s.dragging : ''} ${sinking ? s.sinking : ''}`}
      style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) translate(${drag.dx}px, ${drag.dy}px)` }}
      {...handlers}
    >
      <button
        type="button"
        className={s.starButton}
        style={{ animationDelay: `${((gift.id * 0.6180339887) % 1) * 2200}ms` }}
        aria-label={`星星 ${gift.name}，点击编辑`}
      >
        <svg viewBox="0 0 80 80" className={s.star} aria-hidden="true">
          {/* 四角星光：全曲线勾勒的柔和轮廓，无一条直线 */}
          <path
            d="M40 6 C 43.5 27 53 36.5 74 40 C 53 43.5 43.5 53 40 74 C 36.5 53 27 43.5 6 40 C 27 36.5 36.5 27 40 6 Z"
            fill="var(--star)"
            stroke="var(--star)"
            strokeWidth="2.4"
            strokeLinejoin="round"
            filter="url(#roughen)"
          />
        </svg>
        {/* 闪烁的小星光 */}
        <svg viewBox="0 0 20 20" className={`${s.sparkle} ${s.sparkleA}`} aria-hidden="true">
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#FFFFFF" />
        </svg>
        <svg viewBox="0 0 20 20" className={`${s.sparkle} ${s.sparkleB}`} aria-hidden="true">
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#FFFFFF" />
        </svg>
      </button>
      <span className={s.label}>{gift.name}</span>
    </div>
  )
}
