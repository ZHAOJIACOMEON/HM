/**
 * localStorage 安全读写 + 版本迁移。
 * 所有 key 统一带命名空间和版本号：star-lake:v1:<key>
 * 旧版本 star-lake:<key> 会在首次读取时迁移过来；解析失败回退默认值。
 */

const PREFIX = 'star-lake:v1:'
const LEGACY_PREFIX = 'star-lake:'

let migrated = false

function migrate(): void {
  if (migrated) return
  migrated = true
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(LEGACY_PREFIX) || key.startsWith(PREFIX)) continue
      const value = localStorage.getItem(key)
      if (value == null) continue
      localStorage.setItem(PREFIX + key.slice(LEGACY_PREFIX.length), value)
      localStorage.removeItem(key)
    }
  } catch {
    /* 隐私模式等场景下 localStorage 不可用，静默降级 */
  }
}

export function load<T>(key: string, fallback: T): T {
  migrate()
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T): void {
  migrate()
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* 忽略配额超限 / 禁用存储 */
  }
}
