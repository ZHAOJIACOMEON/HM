import { useEffect, useState } from 'react'

export function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

/** 地平线曲线：两侧 61%，中间 63%（2vh 弧度），与 SkyCanvas 的碰撞判定保持一致 */
export function horizonY(x: number, w: number, h: number): number {
  const nx = (2 * x) / w - 1
  return h * 0.61 + h * 0.02 * (1 - nx * nx)
}
