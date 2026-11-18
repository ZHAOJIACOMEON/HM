import { useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import { rand } from '../lib/random'
import { horizonY } from './useViewport'
import type { Theme } from '../types'

const MAX_RIPPLES = 12

interface Ripple {
  x: number
  y: number
  start: number
  duration: number
  delay: number
  strong: boolean
}

interface Dot {
  x: number
  y: number
  r: number
  a: number
  phase: number
  speed: number
  delay: number
}

function toRgb(css: string): [number, number, number] {
  const c = css.trim()
  if (c.startsWith('#')) {
    const h = c.slice(1)
    const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
  }
  const nums = c.match(/[\d.]+/g)
  return nums && nums.length >= 3 ? [Number(nums[0]), Number(nums[1]), Number(nums[2])] : [255, 247, 214]
}

interface Options {
  theme: Theme
  switchSeq: number
  reduced: boolean
  pulseRef: MutableRefObject<(() => void) | null>
  /** 落星触水时由 StarParticles 调用：x 为触水点横坐标 */
  rippleRef: MutableRefObject<((x: number, strong?: boolean) => void) | null>
}

/**
 * L1 星空引擎：静态星点 + 涟漪，单 canvas / 单 rAF。
 * 落星粒子已迁移到 tsparticles（StarParticles.tsx），此处只负责
 * 背景星点闪烁、涟漪池与主题重绘。涟漪用固定池复用，超出上限覆盖最旧的。
 */
export function useStarField(canvasRef: RefObject<HTMLCanvasElement>, { theme, switchSeq, reduced, pulseRef, rippleRef }: Options) {
  const themeRef = useRef(theme)
  const reducedRef = useRef(reduced)
  const redrawRef = useRef<(() => void) | null>(null)
  const relightRef = useRef<(() => void) | null>(null)
  themeRef.current = theme
  reducedRef.current = reduced

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const ctxRaw = canvasEl.getContext('2d')
    if (!ctxRaw) return
    // 显式声明为非空类型，避免闭包内丢失控制流收窄
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = ctxRaw

    let w = 0
    let h = 0
    let raf = 0
    let frameCount = 0
    let starColor: [number, number, number] = [255, 247, 214]
    let accentColor: [number, number, number] = [127, 209, 193]

    const dots: Dot[] = []
    const ripples: Ripple[] = []

    function readColors() {
      const cs = getComputedStyle(document.documentElement)
      starColor = toRgb(cs.getPropertyValue('--star'))
      accentColor = toRgb(cs.getPropertyValue('--accent2'))
    }

    function buildDots() {
      dots.length = 0
      const count = Math.min(110, Math.round((w * h) / 16000))
      for (let i = 0; i < count; i += 1) {
        dots.push({
          x: rand(0, w),
          y: rand(0, h * 0.6),
          r: rand(0.5, 1.7),
          a: rand(0.25, 0.85),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.4, 1.4),
          delay: 0,
        })
      }
    }

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildDots()
      readColors()
      drawOnce()
    }

    function addRipple(x: number, y: number, strong = false, delay = 0) {
      let slot: Ripple
      if (ripples.length < MAX_RIPPLES) {
        slot = { x, y, start: 0, duration: 700, strong, delay }
        ripples.push(slot)
      } else {
        slot = ripples.reduce((a, b) => (a.start + a.delay <= b.start + b.delay ? a : b))
      }
      slot.x = x
      slot.y = y
      slot.strong = strong
      slot.delay = delay
      slot.duration = strong ? 1100 : 700
      slot.start = performance.now()
    }

    function drawStatic(now: number, relight: boolean) {
      for (const d of dots) {
        const delayT = relight ? d.delay : 0
        const t = Math.max(0, now - delayT)
        const twinkle = relight ? Math.min(1, t / 260) : 0.7 + 0.3 * Math.sin(now * 0.001 * d.speed + d.phase)
        const alpha = d.a * twinkle
        if (alpha <= 0.01) continue
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${starColor[0]},${starColor[1]},${starColor[2]},${alpha})`
        ctx.fill()
      }
    }

    function drawRipples(now: number) {
      for (const r of ripples) {
        const p = (now - r.start - r.delay) / r.duration
        if (p < 0 || p > 1) continue
        ctx.save()
        ctx.translate(r.x, r.y)
        ctx.scale(1, 0.26)
        for (let ring = 0; ring < 2; ring += 1) {
          const rp = Math.min(1, Math.max(0, (p - ring * 0.16) / (1 - ring * 0.16)))
          if (rp <= 0) continue
          const radius = rp * (ring === 0 ? 100 : 72)
          const alpha = (r.strong ? 0.75 : 0.6) * (1 - rp)
          ctx.beginPath()
          ctx.arc(0, 0, radius, 0, Math.PI * 2)
          ctx.lineWidth = r.strong ? 2 : 1.2
          ctx.strokeStyle = `rgba(${accentColor[0]},${accentColor[1]},${accentColor[2]},${alpha})`
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    function drawOnce() {
      ctx.clearRect(0, 0, w, h)
      drawStatic(performance.now(), false)
    }

    function frame(now: number) {
      frameCount += 1
      if (frameCount % 12 === 0) readColors()

      ctx.clearRect(0, 0, w, h)
      drawStatic(now, false)
      drawRipples(now)
      if (!reducedRef.current) raf = requestAnimationFrame(frame)
    }

    redrawRef.current = () => { drawOnce() }
    relightRef.current = () => {
      for (const d of dots) d.delay = performance.now() + Math.random() * 400
      if (reducedRef.current) return
      // 逐颗点亮由 drawStatic 的 relight 分支完成；这里用一次性标记
      let ticks = 0
      const relightFrame = (now: number) => {
        ctx.clearRect(0, 0, w, h)
        drawStatic(now, true)
        ticks += 1
        if (ticks < 24) requestAnimationFrame(relightFrame)
      }
      requestAnimationFrame(relightFrame)
    }

    pulseRef.current = () => {
      for (let i = 0; i < 9; i += 1) {
        const x = (w * (i + 0.5)) / 9
        addRipple(x, horizonY(x, w, h), true, i * 45)
      }
    }

    rippleRef.current = (x, strong = false) => {
      addRipple(x, horizonY(x, w, h), strong)
    }

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else if (!reducedRef.current) raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    if (!reducedRef.current) raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      pulseRef.current = null
      rippleRef.current = null
      redrawRef.current = null
      relightRef.current = null
    }
    // 引擎只初始化一次；主题/减弱动画通过 ref 热更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    redrawRef.current?.()
  }, [theme])

  useEffect(() => {
    if (theme === 'night' && switchSeq > 0) relightRef.current?.()
  }, [theme, switchSeq])

  useEffect(() => {
    if (reduced) redrawRef.current?.()
  }, [reduced])
}
