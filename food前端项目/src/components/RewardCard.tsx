import { useEffect, useRef } from 'react'
import type { Gift } from '../types'
import s from './RewardCard.module.css'

interface Props {
  gift: Gift
  onClose: () => void
  onRedraw: () => void
}

/* 心情文案：随机抽一句，印在卡片上 */
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

/** 绘制少量清晰星点，作为卡片右上角装饰。 */
function drawSparkleField(canvas: HTMLCanvasElement) {
  const bounds = canvas.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(bounds.width * dpr)
  canvas.height = Math.round(bounds.height * dpr)

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, bounds.width, bounds.height)
  ctx.globalCompositeOperation = 'lighter'

  const colors = [
    '150,210,255',
    '192,154,255',
    '255,184,226',
    '255,255,255',
    '255,226,164',
    '126,224,255',
  ]
  const centerX = bounds.width * 0.52
  const centerY = bounds.height * 0.48
  const spreadX = bounds.width * 0.42
  const spreadY = bounds.height * 0.42

  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2
    const irregularEdge =
      0.72
      + 0.14 * Math.sin(angle * 3 + 0.7)
      + 0.09 * Math.sin(angle * 5 - 1.2)
      + 0.05 * Math.sin(angle * 2 + 1.8)
    const distance = Math.pow(Math.random(), 0.8) * irregularEdge
    const x = centerX + Math.cos(angle) * distance * spreadX
    const y = centerY + Math.sin(angle) * distance * spreadY
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = 1.1 + Math.random() * 0.8
    const alpha = 0.72 + Math.random() * 0.28

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${color},${alpha})`
    ctx.fill()
  }

  for (let i = 0; i < 4; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = 0.15 + Math.random() * 0.8
    const x = centerX + Math.cos(angle) * distance * spreadX
    const y = centerY + Math.sin(angle) * distance * spreadY
    const size = 4 + Math.random() * 3
    const color = colors[Math.floor(Math.random() * colors.length)]

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.random() * Math.PI)
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.quadraticCurveTo(-size * 0.12, -size * 0.12, -size * 0.42, 0)
    ctx.quadraticCurveTo(-size * 0.12, size * 0.12, 0, size)
    ctx.quadraticCurveTo(size * 0.12, size * 0.12, size * 0.42, 0)
    ctx.quadraticCurveTo(size * 0.12, -size * 0.12, 0, -size)
    ctx.closePath()
    ctx.fillStyle = `rgba(${color},0.94)`
    ctx.fill()
    ctx.restore()
  }
}

/** 奖品卡片：霓虹描边大卡片 + 右上角星尘爆发 + 单栏排版 */
export default function RewardCard({ gift, onClose, onRedraw }: Props) {
  const quote = useRef(QUOTES[Math.floor(Math.random() * QUOTES.length)]).current
  const sparkleCanvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = sparkleCanvas.current
    if (!canvas) return

    const redraw = () => drawSparkleField(canvas)
    redraw()
    const observer = new ResizeObserver(redraw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={s.wrap}>
      {/* 半透明遮罩：点击卡片之外的任意区域关闭 */}
      <div className={s.backdrop} onClick={onClose} aria-hidden="true" />

      {/* 卡片 + 星尘共用舞台：星尘要溢出卡片右上角，不能被卡片裁切 */}
      <div className={s.stage}>
        {/* 顶部两根若隐若现的吊线 */}
        <div className={s.cords} aria-hidden="true" />

        {/* 卡片外围整圈发光（在卡片之外，不被裁切） */}
        <div className={s.halo} aria-hidden="true" />

        <div
          className={s.card}
          role="button"
          tabIndex={0}
          aria-label={`抽到 ${gift.name}，¥${gift.price.toFixed(0)}。按回车收起`}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClose()
            }
          }}
        >
          {/* 内部深蓝紫渐变底色 + 底部透出的青光 */}
          <div className={s.base} aria-hidden="true" />

          {/* 卡片表面散落的细星点（纯 CSS 绘制） */}
          <div className={s.stars} aria-hidden="true" />

          {/* 右上角的月亮线稿圆 / 蓝色光球 / 气泡 */}
          <div className={s.celestial} aria-hidden="true" />

          {/* 玻璃斜向反光 */}
          <div className={s.sheen} aria-hidden="true" />

          {/* 四角 L 形粗亮线 + 角点光斑 */}
          <div className={s.corners} aria-hidden="true">
            <i className={`${s.corner} ${s.tl}`} />
            <i className={`${s.corner} ${s.tr}`} />
            <i className={`${s.corner} ${s.bl}`} />
            <i className={`${s.corner} ${s.br}`} />
          </div>

          {/* 整圈霓虹渐变描边 */}
          <div className={s.frame} aria-hidden="true" />

          <div className={s.body}>
            <span className={s.stamp}>今日份小礼物</span>
            <h2 className={s.name}>{gift.name}</h2>
            <p className={s.quote}>「 {quote} 」</p>
            {gift.displayDescription && (
              <p className={s.desc}>{gift.displayDescription}</p>
            )}
            <span className={s.price}>¥{gift.price.toFixed(0)}</span>
            <button
              type="button"
              className={s.redraw}
              onClick={(e) => { e.stopPropagation(); onRedraw() }}
            >
              再抽一次
            </button>
          </div>
        </div>

        {/* 右上角星尘爆发：纯代码生成，screen 混合叠亮，跨越卡片边界向外溢出 */}
        <div className={s.stardust} aria-hidden="true">
          <canvas ref={sparkleCanvas} className={s.sparkleCanvas} />
        </div>
      </div>
    </div>
  )
}
