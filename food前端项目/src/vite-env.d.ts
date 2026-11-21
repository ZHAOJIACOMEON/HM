/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** FastAPI 服务地址，默认 http://localhost:9000 */
  readonly VITE_API_BASE?: string
  /** 抽取模式：weighted（按权重客户端抽取） | recommend（调用 /recommend_food） */
  readonly VITE_DRAW_MODE?: 'weighted' | 'recommend'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
