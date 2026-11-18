# 星湖盲盒 · Star Lake Blind Box

一个全屏沉浸式的盲盒抽取页面：星空在上、湖面在下，蒲公英从水面生长出来。点它抽取今天的礼物；双击天空投喂新的礼物星；点左上角折角切换昼夜。

技术栈：**Vite 6 + React 18 + TypeScript + CSS Modules**。星星流由 `@tsparticles/react + slim` 粒子库驱动，其余图形为手写 SVG 路径 + Canvas，无 UI 组件库、无图片资源。

---

## 运行

```bash
cd star-lake-blind-box
npm i
npm run dev          # http://localhost:5173
```

生产构建：

```bash
npm run build
npm run preview
```

后端需先启动（默认 `http://localhost:8000`）：

```bash
cd "/Users/gao/PycharmProjects/elem/food后端项目"
uvicorn main:app --reload --port 8000
```

后端不可达时前端会自动进入**离线模式**：使用本地缓存 / 默认礼物池，抽取、改名、拖拽删除仍可用，刷新后保留在 localStorage。

### 环境变量（可选）

在项目根目录新建 `.env.local`：

```dotenv
VITE_API_BASE=http://localhost:8000
# 抽取模式：weighted（默认，按权重在礼品池里抽） | recommend（调用后端 /recommend_food?mood=good）
VITE_DRAW_MODE=weighted
```

---

## 与 FastAPI 的接口对应

| 前端操作 | 方法 | 后端路由 | 备注 |
| --- | --- | --- | --- |
| 首屏加载礼物池 | GET | `/query_all_food` | 取 `data` 数组 |
| 双击天空投喂星星 | POST | `/add_food` | 后端要求显式 `id`，前端取 `max(id)+1` |
| 原地编辑礼物名 | PUT | `/update_food/{id}` | 全量回传 `name / preference / price / description` |
| 拖拽沉湖删除 | DELETE | `/delete_food/{id}` | 删后 4.2s 内可撤销，撤销会重新 POST 原 id |
| `VITE_DRAW_MODE=recommend` 时抽取 | GET | `/recommend_food?mood=good` | 使用后端返回的 `meal` 与 `msg` |

后端 `Foods` 表没有权重字段。前端约定：**在 `description` 里写 `w:3` 即权重为 3**，不写默认 1。权重标记会从卡片展示文本里移除。解析逻辑在 `src/lib/random.ts` 的 `parseWeight`。若后续后端增加 `weight` 列，只需改 `src/lib/api.ts` 的 `toGift()`。

默认抽取模式为 `weighted`：`src/hooks/useGifts.ts` 的 `draw()` 用 `weightedPick()` 从 `/query_all_food` 的结果里抽。**抽取记录不落库**，奖品池是唯一数据源。

---

## 交互说明

| 操作 | 效果 |
| --- | --- |
| 点击蒲公英 / Tab 聚焦后按 Space、Enter | 抽取：蓄力 → 摇晃 → 开盖 → 奖励浮现 |
| 点击奖励卡片 / 再按 Space | 收起卡片，回到待机 |
| 点左上角折角 | 昼夜切换（带圆形扩散擦除 + 水面涟漪），引导动画永久停止 |
| 双击天空空白处 | 投喂一颗种子星 → 打开星空收藏 → 新礼物名进入原地编辑 |
| 星空收藏里单击星星 | 原地改名；Enter 完成，Esc 取消（未命名礼物会删除） |
| 星空收藏里把星星向下拖进湖面 | 溶解删除，底部出现「撤销」 |
| 点右上角星形图标 / 点空白处 | 进入 / 退出星空收藏 |

读屏：抽取结果、改名、删除与撤销都通过 `aria-live="polite"` 播报；蒲公英、折角、礼物星均可聚焦并有可见焦点描边。

---

## 关键动效与可调参数

| 场景 | 时长 / 缓动 | 调整位置 |
| --- | --- | --- |
| 主题色过渡 800ms | `@property` 注册颜色令牌 + `:root` transition | `src/styles/tokens.css` |
| 圆形擦除切换 | `wipeOut` 800ms，圆心 `at 0% 0%` | `src/components/Scene.module.css` |
| 折角引导 3.5s 循环 | `guideFlap` / `guideHint` 关键帧 | `src/components/CornerFold.module.css` |
| 蒲公英浮动 / 呼吸 / 摆动 | 1.6s / 1.5s / 1.2s（alternate 后为 3.2 / 3 / 2.4s） | `src/components/BlindBox.module.css` |
| 抽取五段时序 | 300 / 900 / 1100 / 1700ms | `src/App.tsx` 的 `handleDraw()` |
| 摇晃 ±10° 六次 | `shake 100ms linear 6` | `src/components/BlindBox.module.css` |
| 奖励卡片浮现 | `rise 600ms var(--ease-bounce)` | `src/components/RewardCard.module.css` |
| 星河尘埃生成（夜 / 昼） | 每 80~180ms 喷 1~2 颗 / 每 160~340ms | `src/components/StarParticles.tsx` 的 `emitters[0].rate` |
| 星河预铺（初始铺满） | 容器就绪时沿 45° 带程序化撒 90 颗（昼 50），顶部偏斜 + 垂直抖动 ±18px，约 1/7 为亮星 | `src/components/StarParticles.tsx` 的 `prefillBand()` |
| 星河带方向 / 张角 / 速度 | 45°（bottom-right）± 14°，夜 1.1~2.4 / 昼 0.8~1.6 | `emitters` + `particles.move` |
| 尘埃尺寸 / 透明度 | 0.6~2.2、0.35~0.95 | `particles.size` / `opacity` |
| 亮星点缀频率 / 尺寸 / 样式 | 0.8~1.8s 一颗、2.2~4.2、实心四角星 | `emitters[1].rate` / `emitters[1].particles` 覆写 |
| 散落范围上限 | 屏幕宽 52%（水面中部） | `StarParticles.tsx` 轮询里的 `p.position.x >= width * 0.52` |
| 尘埃落水涟漪节流 | 320ms | `StarParticles.tsx` 轮询里的 `lastDustRippleRef` |
| 触水判定轮询间隔 | 90ms | `src/components/StarParticles.tsx` 的 `setInterval` |
| 涟漪半径 / 时长 / 数量上限 | 100px、700ms、12 个 | `src/hooks/useStarField.ts` 顶部常量与 `drawRipples()` |
| 地平线位置 / 弧度 | 62%、2vh | `src/styles/tokens.css` 的 `--horizon`，`src/hooks/useViewport.ts` 的 `horizonY()` |
| 手绘抖动幅度 | `scale=1.6` | `src/components/Scene.tsx` 的 `#roughen` 滤镜 |
| 倒影压缩 / 模糊 / 位移 | 0.75、1.5px、`scale=10` | `src/components/Reflection.module.css` 与 `#waterWobble` |
| 星空收藏展开 | 400ms ease-out | `src/components/ConstellationView.module.css` |
| 拖拽删除溶解 | 500ms ease-in | `src/components/GiftStar.module.css` |

所有持续动画都走 `transform` / `opacity`；`prefers-reduced-motion: reduce` 下关闭粒子与循环动画，只保留淡入淡出；页面隐藏时暂停 rAF 与 CSS 动画。

---

## 目录

```
src/
  main.tsx / App.tsx / types.ts
  styles/     tokens.css（设计令牌） global.css（重置与降级）
  components/ Scene SkyCanvas StarParticles（tsparticles 星星流） SkyCelestial Lake Reflection
              BlindBox RewardCard CornerFold ConstellationView GiftStar Toast
  hooks/      useTheme useGifts useStarField useDragStar useViewport
  lib/        api.ts（FastAPI 请求） storage.ts random.ts
```
