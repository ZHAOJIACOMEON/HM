import type { MouseEvent, MutableRefObject, ReactNode } from 'react'
import type { Theme } from '../types'
import SkyCanvas from './SkyCanvas'
import StarParticles from './StarParticles'
import SkyCelestial from './SkyCelestial'
import Lake from './Lake'
import Reflection from './Reflection'
import s from './Scene.module.css'

interface Props {
  theme: Theme
  switchSeq: number
  wiping: boolean
  reduced: boolean
  pulseRef: MutableRefObject<(() => void) | null>
  rippleRef: MutableRefObject<((x: number, strong?: boolean) => void) | null>
  hintHidden?: boolean
  onSkyDoubleClick: (e: MouseEvent<HTMLDivElement>) => void
  children: ReactNode
}

/** 全局 SVG 滤镜：手绘抖动与暖光 */
function Filters() {
  return (
    <svg className={s.defs} aria-hidden="true">
      <defs>
        <filter id="roughen" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="9" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
  )
}

export default function Scene({ theme, switchSeq, wiping, reduced, pulseRef, rippleRef, hintHidden = false, onSkyDoubleClick, children }: Props) {
  return (
    <div className={s.root}>
      <Filters />
      <div className={s.sky} />
      <div className={`${s.canvasLayer} ${theme === 'day' ? s.dayCanvas : ''}`}>
        <SkyCanvas theme={theme} switchSeq={switchSeq} reduced={reduced} pulseRef={pulseRef} rippleRef={rippleRef} />
        <StarParticles theme={theme} reduced={reduced} rippleRef={rippleRef} />
      </div>
      <SkyCelestial theme={theme} />
      <Lake />
      <Reflection theme={theme} />
      <div className={s.skyHit} onDoubleClick={onSkyDoubleClick} aria-hidden="true" />
      {children}
      <div className={`${s.hint} ${hintHidden ? s.hintHidden : ''}`} aria-hidden="true">轻触礼物盒 · 抽一份今天</div>
      {wiping && <div className={s.wipe} aria-hidden="true" />}
    </div>
  )
}
