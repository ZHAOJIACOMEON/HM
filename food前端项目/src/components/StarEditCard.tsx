import { useEffect, useState } from 'react'
import type { Gift, NewGiftInput } from '../types'
import s from './StarEditCard.module.css'

interface Props {
  gift: Gift | null
  onClose: () => void
  onSave: (id: number, input: NewGiftInput) => void
  onDelete: (id: number) => void
}

interface FormState {
  name: string
  preference: string
  price: string
  description: string
}

/** 星星编辑卡片：点击星星弹出，名字/偏好/价格/描述全部可改，走 PUT /update_food/{id} */
export default function StarEditCard({ gift, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<FormState>({ name: '', preference: '喜欢', price: '', description: '' })
  const [error, setError] = useState<string | null>(null)

  /* 打开或切换目标星星时，用当前数据预填表单 */
  useEffect(() => {
    if (!gift) return
    setForm({
      name: gift.name,
      preference: gift.preference || '喜欢',
      price: gift.price ? String(Math.round(gift.price)) : '',
      description: gift.displayDescription || gift.description || '',
    })
    setError(null)
  }, [gift])

  if (!gift) return null
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    const name = form.name.trim()
    if (!name) {
      setError('总得给它留个名字呀')
      return
    }
    onSave(gift.id, {
      name: name.slice(0, 50),
      preference: form.preference,
      price: Math.max(0, Number(form.price) || 0),
      description: form.description.trim().slice(0, 100),
    })
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={s.card} role="dialog" aria-label="编辑星星">
        <svg className={s.paper} viewBox="0 0 340 330" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="starPaper" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#FFFAEB" />
              <stop offset="78%" stopColor="#FFF3D6" />
              <stop offset="100%" stopColor="#FBEBC4" />
            </linearGradient>
          </defs>
          <g filter="url(#roughen)">
            <path
              d="M 16 18 C 92 10, 246 13, 324 20 C 329 106, 327 238, 320 308 C 238 316, 102 314, 22 306 C 14 238, 16 106, 16 18 Z"
              fill="url(#starPaper)"
              stroke="rgba(58, 52, 39, 0.55)"
              strokeWidth="1.6"
            />
            <path d="M 26 30 C 96 24, 240 26, 312 32" fill="none" stroke="rgba(58, 52, 39, 0.14)" strokeWidth="1" />
          </g>
        </svg>

        <div className={s.tape} aria-hidden="true" />

        <div className={s.body}>
          <span className={s.stamp}>改一改这颗星</span>

          <div className={s.rows}>
            <label className={s.row}>
              <span className={s.key}>名字</span>
              <input
                className={s.input}
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="它叫什么"
                maxLength={50}
              />
            </label>

            <div className={s.row}>
              <span className={s.key}>偏好</span>
              <div className={s.segment}>
                {['喜欢', '不喜欢'].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    className={`${s.segmentItem} ${form.preference === pref ? s.segmentOn : ''}`}
                    onClick={() => set({ preference: pref })}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <label className={s.row}>
              <span className={s.key}>价格</span>
              <span className={s.priceWrap}>
                <i className={s.yen}>¥</i>
                <input
                  className={`${s.input} ${s.inputPrice}`}
                  value={form.price}
                  onChange={(e) => set({ price: e.target.value.replace(/[^\d.]/g, '') })}
                  placeholder="0"
                  inputMode="decimal"
                />
              </span>
              <span className={s.key}>描述</span>
              <input
                className={s.input}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="一句话，可留空"
                maxLength={100}
              />
            </label>
          </div>

          {error && <div className={s.error}>{error}</div>}

          <div className={s.actions}>
            <button type="button" className={`${s.action} ${s.actionGhost}`} onClick={onClose}>
              取消
            </button>
            <button type="button" className={`${s.action} ${s.actionGhost} ${s.actionDanger}`} onClick={() => onDelete(gift.id)}>
              删除
            </button>
            <button type="button" className={`${s.action} ${s.actionSolid}`} onClick={save}>
              保存
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
