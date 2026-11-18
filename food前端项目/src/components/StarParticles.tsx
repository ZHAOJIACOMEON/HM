import { useEffect, useMemo, useRef } from 'react'
import { useCallback } from 'react'
import type { MutableRefObject } from 'react'
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react'
import type { Container, Engine, ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { loadEmittersPlugin } from '@tsparticles/plugin-emitters'
import { loadWobbleUpdater } from '@tsparticles/updater-wobble'
import { horizonY } from '../hooks/useViewport'
import type { Theme } from '../types'
import s from './StarParticles.module.css'

interface Props {
  theme: Theme
  reduced: boolean
  rippleRef: MutableRefObject<((x: number, strong?: boolean) => void) | null>
}

/**
 * 预铺：容器就绪后沿对角线星河带随机撒一批尘点（带内连续散布，无聚集点）。
 * - 带中心线：从折纸角 (2%w, 3%h) 出发的 45° 对角线，最远到水面（与轮询销毁上限一致）
 * - 距离分布向顶部偏斜（幂次 1.5），形成"顶部密集、越近水面越分散"的梯度
 * - 垂直带方向 ±18px 抖动，让带子有厚度但不至于散出边界
 * - 每 7 颗左右混入 1 颗亮星样式（实心小四角星），与持续发射的亮星一致
 */
function prefillBand(container: Container, day: boolean, starColor: string) {
  const { width, height } = container.canvas.size
  const count = day ? 50 : 90
  const ox = width * 0.02
  const oy = height * 0.03
  const k = 0.70710678 // √2/2
  for (let i = 0; i < count; i += 1) {
    const t = width * 0.55 * Math.random() ** 1.2
    const jitter = (Math.random() - 0.5) * 36
    const x = ox + t - jitter * k
    const y = oy + t + jitter * k
    if (y >= horizonY(x, width, height)) continue
    const bright = i % 7 === 0
    container.particles.addParticle(
      { x, y },
      bright
        ? {
            size: { value: { min: 2.2, max: 4.2 } },
            paint: {
              fill: { enable: true, color: { value: starColor }, opacity: { min: 0.6, max: 1 } },
              stroke: { color: { value: starColor }, width: 0.6 },
            },
            opacity: { value: { min: 0.6, max: 1 } },
          }
        : undefined,
    )
  }
}

/** 引擎与插件只注册一次（Provider 复用同一 init 引用） */
function useEngineInit() {
  return useCallback(async (engine: Engine) => {
    await Promise.all([
      loadSlim(engine),
      loadEmittersPlugin(engine as Parameters<typeof loadEmittersPlugin>[0]),
      loadWobbleUpdater(engine),
    ])
  }, [])
}

/** 引擎就绪后才挂载 <Particles> */
function ParticleLayer({ options, onLoaded }: { options: ISourceOptions; onLoaded: (c: Container) => void }) {
  const { loaded } = useParticlesProvider()
  if (!loaded) return null
  return (
    <Particles
      id="star-flow"
      className={s.host}
      options={options}
      particlesLoaded={async (c) => { if (c) onLoaded(c) }}
    />
  )
}

/** 从主题 CSS 变量里读星星颜色（与 tokens.css 保持一致） */
function starColorFor(theme: Theme): string {
  const cs = getComputedStyle(document.documentElement)
  return cs.getPropertyValue('--star').trim() || (theme === 'day' ? '#5A6B85' : '#FFF7D6')
}

/**
 * L1b 星河：由 tsparticles 驱动。
 * 参考"尘埃星河带"：主发射源在左上角折纸处，持续喷出大量细碎尘点，
 * 沿右下方向形成一条斜向星河带，落到水面即销毁；带上偶有较大的四角星点缀。
 * 尘点落水只做节流涟漪，大星落水触发正常涟漪。
 */
export default function StarParticles({ theme, reduced, rippleRef }: Props) {
  const containerRef = useRef<Container | null>(null)
  const lastDustRippleRef = useRef(0)
  const init = useEngineInit()

  const options = useMemo<ISourceOptions>(() => {
    const cs = getComputedStyle(document.documentElement)
    const starColor = cs.getPropertyValue('--star').trim() || '#FFF7D6'
    // 白天星河更稀疏、更含蓄
    const day = theme === 'day'
    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      background: { color: 'transparent' },
      particles: {
        number: { value: 0 },
        shape: {
          type: 'star',
          options: { star: { sides: 4, inset: { min: 0.3, max: 0.52 } } },
        },
        // 基底粒子 = 细碎尘点（小、实心、半透明），星河带的主体
        size: { value: { min: 0.6, max: 2.2 } },
        paint: {
          fill: { enable: true, color: { value: starColor }, opacity: { min: 0.25, max: 0.95 } },
          stroke: { value: starColor, width: 0.5 },
        },
        opacity: day ? { value: { min: 0.2, max: 0.6 } } : { value: { min: 0.35, max: 0.95 } },
        move: {
          enable: true,
          direction: 'bottom-right',
          // 收紧方向扰动：默认 angle=90° 会摊成 0~90° 扇形，
          // 这里 ±14° 让尘点排成一条斜向星河带（比 ±11° 略宽，配合降密度）
          angle: { value: 28, offset: 0 },
          straight: false,
          random: true,
          // 速度差让尘点沿对角线拉出带状；快的落点远、慢的近
          speed: day ? { min: 0.8, max: 1.6 } : { min: 1.1, max: 2.4 },
          // 注意：v4 的 drift 是无衰减的水平加速度，速度慢时会迅速
          // 把轨迹拉成横漂，星河带必须保持 0，靠角度扰动与速度差成型
          drift: 0,
          outModes: { default: 'destroy' },
        },
        wobble: {
          enable: true,
          distance: 6,
          speed: { angle: { min: 20, max: 40 }, move: { min: 3, max: 7 } },
        },
      },
      emitters: [
        // 尘埃流：折纸左上角小区域喷洒（密度降低，粒子更分散）
        {
          position: { x: { min: 0.5, max: 4.5 }, y: { min: 0.8, max: 4 } },
          direction: 'bottom-right',
          rate: {
            quantity: { min: 1, max: 2 },
            delay: day ? { min: 0.16, max: 0.34 } : { min: 0.08, max: 0.18 },
          },
        },
        // 亮星：同源稀疏点缀，四角实心小星（与尘点同风格）
        {
          position: { x: { min: 0.5, max: 3 }, y: { min: 1, max: 3.5 } },
          direction: 'bottom-right',
          rate: { quantity: 1, delay: day ? { min: 1.6, max: 3.2 } : { min: 0.8, max: 1.8 } },
          particles: {
            size: { value: { min: 2.2, max: 4.2 } },
            paint: {
              fill: { enable: true, color: { value: starColor }, opacity: { min: 0.6, max: 1 } },
              stroke: { value: starColor, width: 0.6 },
            },
            opacity: { value: { min: 0.6, max: 1 } },
            rotate: {
              value: { min: 0, max: 360 },
              animation: { enable: true, speed: { min: -5, max: 5 }, sync: false },
            },
            move: {
              speed: day ? { min: 0.8, max: 1.5 } : { min: 1, max: 2 },
              drift: 0,
            },
            wobble: {
              distance: 8,
              speed: { angle: { min: 14, max: 26 }, move: { min: 4, max: 8 } },
            },
          },
        },
      ],
    }
  }, [theme])

  // 轮询粒子位置：越过湖面（地平线）即销毁。
  // 尘点极多，涟漪做节流（至少间隔 320ms）；大星始终触发正常涟漪。
  useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(() => {
      const c = containerRef.current
      if (!c) return
      const { width, height } = c.canvas.size
      const drowned = c.particles.filter(
        (p) =>
          p.position.y >= horizonY(p.position.x, width, height) ||
          // 散落范围上限：最远落到屏幕中间的水面，超出直接销毁
          p.position.x >= width * 0.52,
      )
      let lastRippleX = -1
      for (const p of drowned) {
        const isStar = p.size.value >= 3
        const now = performance.now()
        if (isStar) {
          rippleRef.current?.(p.position.x, true)
        } else if (now - lastDustRippleRef.current >= 320 && p.position.x !== lastRippleX) {
          rippleRef.current?.(p.position.x)
          lastDustRippleRef.current = now
          lastRippleX = p.position.x
        }
        c.particles.remove(p)
      }
    }, 90)
    return () => window.clearInterval(timer)
  }, [reduced, rippleRef])

  useEffect(() => () => {
    containerRef.current?.destroy()
    containerRef.current = null
  }, [])

  if (reduced) return null

  return (
    <div className={s.layer} aria-hidden="true">
      <ParticlesProvider init={init}>
        <ParticleLayer
          options={options}
          onLoaded={(c) => {
            containerRef.current = c
            prefillBand(c, theme === 'day', starColorFor(theme))
          }}
        />
      </ParticlesProvider>
    </div>
  )
}
