import { useEffect, useState } from 'react'
import type { Gift, NewGiftInput } from '../types'
import s from './MealEntry.module.css'

interface Props {
  /** 入口按钮是否可见（抽取演出/卡片打开期间隐藏） */
  visible: boolean
  open: boolean
  meal: Gift | null
  loading: boolean
  onOpen: () => void
  onReroll: () => void
  onAccept: (input: NewGiftInput) => void
  onClose: () => void
}

interface FormState {
  name: string
  preference: string
  price: string
  description: string
}

const EMPTY: FormState = { name: '', preference: '喜欢', price: '', description: '' }

/** 录入一份餐食：字段对齐后端 AddFoods（name/preference/price/description），
 *  打开或「换一份」时会用接口推荐/内置菜单预填，用户改完直接录入 */
export default function MealEntry({
  visible, open, meal, loading, onOpen, onReroll, onAccept, onClose,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  /* 拿到推荐结果后预填表单（内置内容兜底也走这里） */
  useEffect(() => {
    if (!meal) return
    setForm({
      name: meal.name,
      preference: meal.preference || '喜欢',
      price: meal.price ? String(Math.round(meal.price)) : '',
      description: meal.displayDescription || meal.description || '',
    })
    setError(null)
  }, [meal])

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const submit = () => {
    const name = form.name.trim()
    if (!name) {
      setError('总得给这道菜起个名字呀')
      return
    }
    setError(null)
    onAccept({
      name: name.slice(0, 50),
      preference: form.preference,
      price: Math.max(0, Number(form.price) || 0),
      description: form.description.trim().slice(0, 100),
    })
  }

  return (
    <>
      <button
        type="button"
        className={`${s.entry} ${visible ? '' : s.entryHidden}`}
        onClick={onOpen}
        aria-label="增加餐食"
      >
        {/* 手绘小碗：蒸汽、碗沿、碗身全部是柔和曲线 */}
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <g fill="none" stroke="var(--line)" strokeWidth="1.6" strokeLinecap="round" filter="url(#roughen)">
            <path d="M15 16 C 13.4 12.6 16.6 11.4 15 7.4" strokeWidth="1.1" opacity="0.75" />
            <path d="M23 16 C 21.4 12.2 24.8 11 23.2 6.6" strokeWidth="1.1" opacity="0.75" />
            <path d="M6.5 22.5 C 13 20.6 27 20.6 33.5 22.5" />
            <path d="M8 23.4 C 8.6 30.6 13.4 35 20 35 C 26.6 35 31.4 30.6 32 23.4" />
            <path d="M14 39.5 C 17.8 38.4 22.2 38.4 26 39.5" strokeWidth="1.1" opacity="0.6" />
          </g>
        </svg>
        <span className={s.entryText}>增加餐食</span>
      </button>

      {open && <div className={s.backdrop} onClick={onClose} aria-hidden="true" />}

      {open && (
        <div className={s.card} role="dialog" aria-label="录入餐食">
          <svg className={s.paper} viewBox="0 0 340 300" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="mealPaper" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#FFFAEB" />
                <stop offset="78%" stopColor="#FFF3D6" />
                <stop offset="100%" stopColor="#FBEBC4" />
              </linearGradient>
            </defs>
            <g filter="url(#roughen)">
              <path
                d="M 16 18 C 92 10, 246 13, 324 20 C 329 96, 327 212, 320 278 C 238 286, 102 284, 22 276 C 14 212, 16 96, 16 18 Z"
                fill="url(#mealPaper)"
                stroke="rgba(58, 52, 39, 0.55)"
                strokeWidth="1.6"
              />
              <path d="M 26 30 C 96 24, 240 26, 312 32" fill="none" stroke="rgba(58, 52, 39, 0.14)" strokeWidth="1" />
            </g>
          </svg>

          <div className={s.tape} aria-hidden="true" />

          <div className={s.body}>
            <span className={s.stamp}>录一份餐食</span>

            {/* 名字 */}
            <label className={s.row}>
              <span className={s.fieldLabel}>菜名</span>
              <input
                className={`${s.input} ${s.inputName}`}
                value={form.name}
                placeholder="今天想吃点什么"
                maxLength={50}
                onChange={(e) => set({ name: e.target.value })}
              />
            </label>

            {/* 偏好 */}
            <div className={s.row}>
              <span className={s.fieldLabel}>偏好</span>
              <div className={s.segment}>
                {['喜欢', '不喜欢'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`${s.segmentItem} ${form.preference === p ? s.segmentOn : ''}`}
                    onClick={() => set({ preference: p })}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 价格 + 描述 */}
            <label className={s.row}>
              <span className={s.fieldLabel}>价格</span>
              <span className={s.priceWrap}>
                <i>¥</i>
                <input
                  className={`${s.input} ${s.inputPrice}`}
                  value={form.price}
                  inputMode="decimal"
                  placeholder="0"
                  onChange={(e) => set({ price: e.target.value.replace(/[^\d.]/g, '') })}
                />
              </span>
              <input
                className={`${s.input} ${s.inputDesc}`}
                value={form.description}
                placeholder="一句话描述（选填）"
                maxLength={100}
                onChange={(e) => set({ description: e.target.value })}
              />
            </label>

            {error && <div className={s.error}>{error}</div>}

            <div className={s.actions}>
              <button
                type="button"
                className={`${s.action} ${s.actionGhost}`}
                onClick={onReroll}
                disabled={loading}
              >
                换一份
              </button>
              <button
                type="button"
                className={`${s.action} ${s.actionSolid}`}
                onClick={submit}
              >
                录入
              </button>
            </div>

            {loading && <div className={s.foot}>正在去后厨看看…</div>}
            {!loading && !meal && <div className={s.foot}>候选的菜都收录过了，自己填一份新的吧</div>}
          </div>
        </div>
      )}
    </>
  )
}
