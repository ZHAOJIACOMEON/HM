import { useCallback, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'

interface Origin { x: number; y: number }

/**
 * Pointer Events 拖拽（鼠标 / 触屏统一）。
 * onDrop 只在位移超过 6px 时触发，参数是总位移 dy（向下为正）。
 * onTap 在未发生拖拽的「点按」时触发；
 * 注意：根节点 setPointerCapture 会把 click 重定向到根元素，
 * 所以点击必须在这里统一处理并 stopPropagation，子元素的 onClick 收不到。
 */
export function useDragStar(onDrop: (dy: number) => void, onTap?: () => void) {
  const origin = useRef<Origin | null>(null)
  const moved = useRef(false)
  const lastMoved = useRef(false)
  const [drag, setDrag] = useState({ active: false, dx: 0, dy: 0 })

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    origin.current = { x: e.clientX, y: e.clientY }
    moved.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!origin.current) return
    const dx = e.clientX - origin.current.x
    const dy = e.clientY - origin.current.y
    if (Math.hypot(dx, dy) > 6) moved.current = true
    if (moved.current) setDrag({ active: true, dx, dy })
  }, [])

  const finish = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!origin.current) return
    const dy = e.clientY - origin.current.y
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    origin.current = null
    lastMoved.current = moved.current
    if (moved.current) onDrop(dy)
    moved.current = false
    setDrag({ active: false, dx: 0, dy: 0 })
  }, [onDrop])

  const onClick = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    /* pointer capture 使 click 重定向到根元素：统一在这里拦截冒泡 */
    e.stopPropagation()
    /* 刚发生过拖拽的松手不算点按 */
    if (lastMoved.current) { lastMoved.current = false; return }
    onTap?.()
  }, [onTap])

  return {
    drag,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onClick,
    },
  }
}
