import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import Scene from './components/Scene'
import BlindBox from './components/BlindBox'
// 主题切换开关暂时隐藏，恢复时连同此处 import 一起启用
// import CornerFold from './components/CornerFold'
import ConstellationView from './components/ConstellationView'
import type { SeedPoint } from './components/ConstellationView'
import Toast from './components/Toast'
import MealEntry from './components/MealEntry'
import StarEditCard from './components/StarEditCard'
import { useTheme } from './hooks/useTheme'
import { useGifts } from './hooks/useGifts'
import { api } from './lib/api'
import { pickSuggestion } from './lib/mealDefaults'
import type { DrawPhase, Gift, NewGiftInput } from './types'
import s from './App.module.css'

const MOODS = ['今天也要好好吃饭', '风是甜的', '慢慢来，星星会落下', '有一点点幸运', '湖面在偷笑']
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

interface Undo {
  gift: Gift
  index: number
}

export default function App() {
  // 主题切换开关暂时隐藏，toggle 保留在解构外待恢复时使用
  const { theme, wiping, switchSeq } = useTheme()
  const { gifts, refresh, add, update, remove, restore, draw } = useGifts()

  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [paused, setPaused] = useState(false)
  const [phase, setPhase] = useState<DrawPhase>('idle')
  const [reward, setReward] = useState<Gift | null>(null)
  const [mood, setMood] = useState<string | null>(null)
  const [moodKey, setMoodKey] = useState(0)
  const [announcement, setAnnouncement] = useState('')

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [seed, setSeed] = useState<SeedPoint | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [undo, setUndo] = useState<Undo | null>(null)

  /** 增加餐食：入口 + 推荐卡片 */
  const [mealOpen, setMealOpen] = useState(false)
  const [meal, setMeal] = useState<Gift | null>(null)
  const [mealLoading, setMealLoading] = useState(false)

  const pulseRef = useRef<(() => void) | null>(null)
  const rippleRef = useRef<((x: number, strong?: boolean) => void) | null>(null)
  const timers = useRef<number[]>([])
  const toastTimer = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout)
    window.clearTimeout(toastTimer.current)
  }, [])

  const showToast = useCallback((message: string, nextUndo?: Undo) => {
    setToast(message)
    setUndo(nextUndo ?? null)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setToast(null)
      setUndo(null)
    }, 4200)
  }, [])

  /** 抽取演出：蓄力 → 摇晃 → 开盖 → 奖品浮现 */
  const handleDraw = useCallback(async () => {
    if (phase !== 'idle' || open) return
    const k = reduced ? 0.12 : 1
    setMood(pick(MOODS))
    setMoodKey((n) => n + 1)
    setPhase('charge')

    timers.current.push(
      window.setTimeout(() => setPhase('shake'), 300 * k),
      window.setTimeout(() => setPhase('open'), 900 * k),
      window.setTimeout(async () => {
        const result = await draw()
        if (result.gift) {
          setReward(result.gift)
          setPhase('reveal')
          const text = result.msg || `抽到了 ${result.gift.name}`
          setAnnouncement(text)
        } else {
          setPhase('empty')
          setAnnouncement(result.msg ?? '池子空了，去投喂一颗星星吧')
          timers.current.push(window.setTimeout(() => setPhase('idle'), 2400 * k))
        }
      }, 1100 * k),
    )
  }, [phase, open, reduced, draw])

  const closeReward = useCallback(() => {
    setReward(null)
    setPhase('idle')
  }, [])

  /* handleDraw 闭包捕获的是旧 phase，重抽需等状态复位后取最新的 handleDraw 再执行 */
  const drawRef = useRef<() => void>(() => {})
  useEffect(() => { drawRef.current = () => { void handleDraw() } }, [handleDraw])

  /** 便签上的「再抽一次」：收起卡片，回到 idle 后立刻重开抽取演出 */
  const handleRedraw = useCallback(() => {
    setReward(null)
    setPhase('idle')
    timers.current.push(window.setTimeout(() => drawRef.current(), 80))
  }, [])

  /** 预填一道建议餐食：来自内置候选池，且剔除数据库已有的名字——
   *  这是新增录入入口，建议不能是库里已有的数据，避免录入重名 */
  const fetchMeal = useCallback(async () => {
    setMealLoading(true)
    let takenNames: string[] = []
    try {
      const list = await api.listGifts()
      takenNames = list.map((g) => g.name.trim())
    } catch {
      /* 接口不可达也继续：候选池本身与库无关 */
    }
    setMeal((prev) => {
      const picked = pickSuggestion(takenNames, prev?.name ?? null)
      if (!picked) return null
      return { id: 0, weight: 1, ...picked, displayDescription: picked.description }
    })
    setMealLoading(false)
  }, [])

  const openMeal = useCallback(() => {
    setMealOpen(true)
    setAnnouncement('看看今天吃什么')
    void fetchMeal()
  }, [fetchMeal])

  const rerollMeal = useCallback(() => {
    void fetchMeal()
  }, [fetchMeal])

  /** 录入前先查重：数据库里已有同名菜则不提交，提示换名 */
  const acceptMeal = useCallback(async (input: NewGiftInput) => {
    try {
      const list = await api.listGifts()
      if (list.some((g) => g.name.trim() === input.name.trim())) {
        showToast('这道菜已经在星星池里啦，换个名字试试')
        return
      }
    } catch {
      /* 查重失败不阻断录入 */
    }
    void add(input)
    setMealOpen(false)
    showToast(`${input.name} 已放进星星池`)
    setAnnouncement(`已录入 ${input.name}`)
  }, [add, showToast])

  /** 全局 Space / Enter：焦点不在任何控件上时也可抽取 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      const active = document.activeElement
      if (active && active !== document.body && active !== document.documentElement) return
      e.preventDefault()
      void handleDraw()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleDraw])

  /** 打开星空收藏时重新调 query_all_food，保证星星始终是接口最新数据 */
  const handleToggleConstellation = useCallback(() => {
    setOpen((v) => {
      if (!v) void refresh()
      return !v
    })
  }, [refresh])

  /** 双击天空投喂一颗星星 */
  const handleSkyDoubleClick = useCallback(async (e: MouseEvent<HTMLDivElement>) => {
    if (open || phase !== 'idle') return
    if (e.clientY > window.innerHeight * 0.61) return
    setSeed({ x: e.clientX, y: e.clientY, key: Date.now() })
    pulseRef.current?.()
    const created = await add({ name: '' })
    setOpen(true)
    setEditingId(created.id)
    setAnnouncement('投喂了一颗星星，给它起个名字吧')
  }, [open, phase, add])

  const handleDelete = useCallback(async (id: number) => {
    const result = await remove(id)
    if (result) {
      showToast(`${result.gift.name} 沉入湖底`, { gift: result.gift, index: result.index })
      setAnnouncement(`已删除 ${result.gift.name}`)
    }
    setEditingId(null)
  }, [remove, showToast])

  /** 编辑卡片保存：走 PUT /update_food/{id} */
  const handleSaveStar = useCallback((id: number, input: NewGiftInput) => {
    void update(id, input)
    setEditingId(null)
    showToast(`${input.name} 已更新`)
    setAnnouncement(`已更新 ${input.name}`)
  }, [update, showToast])

  const handleDeleteStarCard = useCallback((id: number) => {
    setEditingId(null)
    void handleDelete(id)
  }, [handleDelete])

  /** 关闭编辑卡片：新星（未命名/空名）取消时直接回收 */
  const closeStarCard = useCallback(() => {
    const current = gifts.find((g) => g.id === editingId)
    if (current && (!current.name.trim() || current.name === '未命名礼物')) {
      handleDeleteStarCard(current.id)
      return
    }
    setEditingId(null)
  }, [gifts, editingId, handleDeleteStarCard])

  const handleUndo = useCallback(() => {
    if (!undo) return
    void restore(undo.gift, undo.index)
    setAnnouncement(`已恢复 ${undo.gift.name}`)
    setToast(null)
    setUndo(null)
  }, [undo, restore])

  return (
    <div className={s.app} data-paused={paused}>
      <Scene
        theme={theme}
        switchSeq={switchSeq}
        wiping={wiping}
        reduced={reduced}
        pulseRef={pulseRef}
        rippleRef={rippleRef}
        hintHidden={open}
        onSkyDoubleClick={handleSkyDoubleClick}
      >
        <BlindBox
          phase={phase}
          reward={reward}
          mood={mood}
          moodKey={moodKey}
          onDraw={() => void handleDraw()}
          onCloseReward={closeReward}
          onRedraw={handleRedraw}
        />

        {phase === 'empty' && (
          <div className={s.emptyNote} key="empty">池子空了，去投喂一颗星星吧</div>
        )}

        <ConstellationView
          open={open}
          gifts={gifts}
          seed={seed}
          onToggle={handleToggleConstellation}
          onClose={() => { setOpen(false); setEditingId(null) }}
          onStartEdit={(id) => setEditingId(id)}
          onDelete={(id) => void handleDelete(id)}
        />

        <StarEditCard
          gift={gifts.find((g) => g.id === editingId) ?? null}
          onClose={closeStarCard}
          onSave={handleSaveStar}
          onDelete={handleDeleteStarCard}
        />

        <MealEntry
          visible={phase === 'idle' && !reward && !mealOpen}
          open={mealOpen}
          meal={meal}
          loading={mealLoading}
          onOpen={openMeal}
          onReroll={rerollMeal}
          onAccept={acceptMeal}
          onClose={() => setMealOpen(false)}
        />

        {/* 主题切换开关暂时隐藏（需要恢复时取消注释） */}
        {/* <CornerFold onToggle={handleToggleTheme} muted={open} /> */}
        <Toast message={toast} actionLabel={undo ? '撤销' : undefined} onAction={handleUndo} />
      </Scene>

      <div className={s.srOnly} role="status" aria-live="polite">{announcement}</div>
    </div>
  )
}
