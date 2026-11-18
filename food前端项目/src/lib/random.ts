export const rand = (min: number, max: number): number => min + Math.random() * (max - min)

export const randInt = (min: number, max: number): number => Math.floor(rand(min, max + 1))

/** 由 id 派生稳定的 0~1 值，用于星座图里星星的固定位置 */
export function hash01(input: number | string, salt = 0): number {
  const s = String(input) + ':' + salt
  let h = 2166136261
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // avalanche：让相邻 salt / 相邻 id 的结果充分散开
  h ^= h >>> 16
  h = Math.imul(h, 0x7feb352d)
  h ^= h >>> 15
  h = Math.imul(h, 0x846ca68b)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

/**
 * 权重约定：在 description 里写 `w:3` 即可把该礼物的权重设为 3。
 * 未写则默认 1。权重标记会从展示文本中移除。
 */
export function parseWeight(description: string | undefined): { weight: number; clean: string } {
  const src = description ?? ''
  const match = src.match(/(?:^|\s)w:(\d+(?:\.\d+)?)/i)
  if (!match) return { weight: 1, clean: src.trim() }
  const weight = Math.max(0, Number(match[1]) || 1)
  return {
    weight,
    clean: src.replace(match[0], '').replace(/\s{2,}/g, ' ').trim(),
  }
}

/** 按权重随机取一项；权重全为 0 时退化为等概率 */
export function weightedPick<T>(items: T[], weightOf: (item: T) => number): T | undefined {
  if (items.length === 0) return undefined
  const weights = items.map((item) => Math.max(0, weightOf(item)))
  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) return items[Math.floor(Math.random() * items.length)]
  let r = Math.random() * total
  for (let i = 0; i < items.length; i += 1) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}
