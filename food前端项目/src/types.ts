export type Theme = 'night' | 'day'

/** 后端 Foods 表的原始结构 */
export interface RawFood {
  id: number
  name: string
  preference: string
  price: number
  description: string
  create_time?: string
  update_time?: string
}

/** 前端礼品模型；weight 由 description 中的 `w:N` 解析而来 */
export interface Gift extends RawFood {
  weight: number
  /** 去掉权重标记后的描述，用于卡片小字 */
  displayDescription: string
}

export interface NewGiftInput {
  name: string
  preference?: string
  price?: number
  description?: string
}

export type DrawPhase =
  | 'idle'
  | 'charge'
  | 'shake'
  | 'open'
  | 'reveal'
  | 'empty'
