import type { Gift, NewGiftInput, RawFood } from '../types'
import { parseWeight } from './random'

/** 后端地址：http://localhost:8000（可用 VITE_API_BASE 覆盖） */
export const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:9000').replace(/\/$/, '')

const TIMEOUT = 6000

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } finally {
    window.clearTimeout(timer)
  }
}

function toGift(food: RawFood): Gift {
  const { weight, clean } = parseWeight(food.description)
  return { ...food, weight, displayDescription: clean }
}

interface ListResponse {
  message: string
  data: RawFood[]
}

interface MutateResponse {
  message: string
  data: RawFood | string
}

interface RecommendResponse {
  message: string
  msg: string
  meal: RawFood | null
}

export const api = {
  /** GET /query_all_food */
  async listGifts(): Promise<Gift[]> {
    const res = await request<ListResponse>('/query_all_food')
    return (res.data ?? []).map(toGift)
  },

  /** POST /add_food（后端要求显式传 id） */
  async createGift(id: number, input: NewGiftInput): Promise<Gift> {
    const res = await request<MutateResponse>('/add_food', {
      method: 'POST',
      body: JSON.stringify({
        id,
        name: input.name,
        preference: input.preference ?? '喜欢',
        price: input.price ?? 0,
        description: input.description ?? '',
        update_time: new Date().toISOString(),
      }),
    })
    return toGift(res.data as RawFood)
  },

  /** PUT /update_food/{id}（后端要求 name/preference/price/description 全量） */
  async renameGift(id: number, name: string, base: Gift): Promise<Gift> {
    return this.updateGift(id, { name, preference: base.preference, price: base.price, description: base.description })
  },

  /** PUT /update_food/{id}：任意字段组合，自动按后端要求补全为全量四字段 */
  async updateGift(id: number, input: NewGiftInput): Promise<Gift> {
    const res = await request<MutateResponse>(`/update_food/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: input.name,
        preference: input.preference ?? '喜欢',
        price: input.price ?? 0,
        description: input.description ?? '',
      }),
    })
    return toGift(res.data as RawFood)
  },

  /** DELETE /delete_food/{id} */
  async deleteGift(id: number): Promise<void> {
    await request<MutateResponse>(`/delete_food/${id}`, { method: 'DELETE' })
  },

  /** GET /recommend_food?mood=good|bad —— 可选抽取模式 */
  async recommend(mood: 'good' | 'bad' = 'good'): Promise<{ gift?: Gift; msg: string }> {
    const res = await request<RecommendResponse>(`/recommend_food?mood=${mood}`)
    return { gift: res.meal ? toGift(res.meal) : undefined, msg: res.msg ?? '' }
  },
}
