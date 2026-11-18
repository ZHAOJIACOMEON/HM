import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { parseWeight, weightedPick } from '../lib/random'
import type { Gift, NewGiftInput } from '../types'

function normalize(gift: Gift): Gift {
  const { weight, clean } = parseWeight(gift.description)
  return { ...gift, weight, displayDescription: clean }
}

export function useGifts() {
  /** 星星只显示接口数据：初始为空，由 query_all_food 填充 */
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  /** 后端不可达时进入离线模式：所有变更只留本地 */
  const [offline, setOffline] = useState(false)

  /** 从后端拉取最新列表（query_all_food）；失败则保持当前数据并标记离线 */
  const refresh = useCallback(async (): Promise<void> => {
    try {
      const list = await api.listGifts()
      setGifts(list.map(normalize))
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }, [])

  /** 首次挂载拉取一次 */
  useEffect(() => { void refresh() }, [refresh])

  const add = useCallback(async (input: NewGiftInput): Promise<Gift> => {
    const maxId = gifts.reduce((m, g) => Math.max(m, g.id), 0)
    const id = offline ? -(Date.now() % 1000000) : maxId + 1
    const draft = normalize({
      id,
      name: input.name,
      preference: input.preference ?? '喜欢',
      price: input.price ?? 0,
      description: input.description ?? '',
      weight: 1,
      displayDescription: input.description ?? '',
    })
    setGifts((prev) => [draft, ...prev])
    if (offline) return draft

    try {
      const created = await api.createGift(id, input)
      setGifts((prev) => prev.map((g) => (g.id === id ? created : g)))
      return created
    } catch {
      setOffline(true)
      return draft
    }
  }, [gifts, offline])

  const rename = useCallback(async (id: number, name: string) => {
    const base = gifts.find((g) => g.id === id)
    if (!base || !name.trim()) return
    const trimmed = name.trim().slice(0, 50)
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, name: trimmed } : g)))
    if (offline) return
    try {
      await api.renameGift(id, trimmed, base)
    } catch {
      setOffline(true)
      setGifts((prev) => prev.map((g) => (g.id === id ? base : g)))
    }
  }, [gifts, offline])

  /** 编辑星星任意字段（name/preference/price/description），走 PUT /update_food/{id}；失败回滚 */
  const update = useCallback(async (id: number, input: NewGiftInput) => {
    const base = gifts.find((g) => g.id === id)
    if (!base || !input.name?.trim()) return
    const next: Gift = {
      ...base,
      name: input.name.trim().slice(0, 50),
      preference: input.preference ?? base.preference,
      price: input.price ?? base.price,
      description: input.description ?? base.description,
    }
    const { weight, clean } = parseWeight(next.description)
    const normalized = { ...next, weight, displayDescription: clean }
    setGifts((prev) => prev.map((g) => (g.id === id ? normalized : g)))
    if (offline) return
    try {
      await api.updateGift(id, { name: next.name, preference: next.preference, price: next.price, description: next.description })
    } catch {
      setOffline(true)
      setGifts((prev) => prev.map((g) => (g.id === id ? base : g)))
    }
  }, [gifts, offline])

  const remove = useCallback(async (id: number) => {
    const index = gifts.findIndex((g) => g.id === id)
    if (index < 0) return null
    const removed = gifts[index]
    setGifts((prev) => prev.filter((g) => g.id !== id))
    if (!offline) {
      try {
        await api.deleteGift(id)
      } catch {
        setOffline(true)
        setGifts((prev) => [...prev.slice(0, index), removed, ...prev.slice(index)])
        return null
      }
    }
    return { gift: removed, index }
  }, [gifts, offline])

  const restore = useCallback(async (gift: Gift, index: number) => {
    setGifts((prev) => {
      if (prev.some((g) => g.id === gift.id)) return prev
      const next = [...prev]
      next.splice(Math.min(index, next.length), 0, gift)
      return next
    })
    if (!offline) {
      try {
        await api.createGift(gift.id, {
          name: gift.name,
          preference: gift.preference,
          price: gift.price,
          description: gift.description,
        })
      } catch {
        setOffline(true)
      }
    }
  }, [offline])

  /** 抽取：默认按 description 里的 w:N 权重；可用 VITE_DRAW_MODE=recommend 走后端推荐 */
  const draw = useCallback(async (): Promise<{ gift?: Gift; msg?: string }> => {
    const mode = import.meta.env.VITE_DRAW_MODE ?? 'weighted'
    if (mode === 'recommend' && !offline) {
      try {
        const res = await api.recommend('good')
        return res.gift ? { gift: normalize(res.gift), msg: res.msg } : { msg: res.msg }
      } catch {
        setOffline(true)
      }
    }
    const gift = weightedPick(gifts, (g) => g.weight)
    return gift ? { gift } : { msg: '池子空了，去投喂一颗星星吧' }
  }, [gifts, offline])

  return { gifts, loading, offline, refresh, add, rename, update, remove, restore, draw }
}
