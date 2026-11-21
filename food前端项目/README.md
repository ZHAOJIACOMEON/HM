# 星湖盲盒 · Star Lake Blind Box

一个全屏沉浸式的盲盒抽取页面：星空在上、湖面在下，天空顶端有一道平滑曲线撕口，透出淡淡日出暖光，两只白色手绘线稿礼物盒被细绳吊在撕口下方、悬于水面上方——**左盒暖金色 = 抽好心情礼物，右盒青色 = 抽坏心情礼物**。点哪只盒，哪只盒开始演出；抽中的奖品以**最大宽度 600px、约 2.2:1 的玻璃卡片**居中呈现（深蓝紫渐变、白色外围光晕、霓虹描边、四角亮线、Canvas 清晰星尘与顶部吊线），采用紧凑单栏排版展示菜名、心情文案、描述、弱化后的价格与「再抽一次」。星空收藏页里每颗星星对应一条餐食记录，星点稳定随机散布、独立呼吸闪烁，无星间连线；底部「增加餐食」可直接录入新菜。

技术栈：**Vite 6 + React 18 + TypeScript + CSS Modules**。主场景星河由 `@tsparticles/react + slim` 驱动，背景静态星点和水面涟漪由单个 Canvas 绘制；其余图形（撕口、礼盒、录入便签、纸飞机、星光、小碗）使用手写 SVG 路径与 `roughen` 抖动滤镜。奖品卡片采用 CSS 玻璃拟态，右上角星尘由 Canvas 绘制 60 个清晰圆点和 4 枚柔曲星芒，不依赖 PNG 星尘素材，也不添加逐点模糊阴影。无 UI 组件库。

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

后端需先启动（**food 后端跑在 9000**）：

```bash
cd "/Users/gao/PycharmProjects/shunyi7qi/11月06号/food后端项目"
python3 -m uvicorn main:app --port 9000
```

后端不可达时前端会进入**离线模式**：不再请求接口，新增 / 编辑 / 删除只作用于当前页面状态。奖品池只在挂载时从 `/query_all_food` 拉取，因此首次加载即失败时列表为空，抽取会提示「池子空了」——需先恢复后端并刷新页面。

### 环境变量

项目根目录已有 `.env.local`：

```dotenv
VITE_API_BASE=http://localhost:9000
# 抽取模式：weighted（默认，按权重在礼品池里抽） | recommend（调用后端 /recommend_food?mood=good）
VITE_DRAW_MODE=weighted
```

---

## 与 FastAPI 的接口对应

| 前端操作 | 方法 | 后端路由 | 备注 |
| --- | --- | --- | --- |
| 星空页 / 录入查重拉取礼物池 | GET | `/query_all_food` | 取 `data` 数组；**每次打开星空页都会重新拉取** |
| 双击天空投喂星星、增加餐食录入 | POST | `/add_food` | 后端要求显式 `id`，前端取 `max(id)+1` |
| 星星编辑卡片保存 | PUT | `/update_food/{id}` | 全量回传 `name / preference / price / description`，乐观更新 + 失败回滚 |
| 删除星星（卡片 × / 拖拽沉湖） | DELETE | `/delete_food/{id}` | 删后可撤销，撤销会重新 POST 原 id |
| `VITE_DRAW_MODE=recommend` 时抽取 | GET | `/recommend_food?mood=good` | 使用后端返回的 `meal` 与 `msg` |

后端 `Foods` 表没有权重字段。前端约定：**在 `description` 里写 `w:3` 即权重为 3**，不写默认 1。权重标记会从卡片展示文本里移除。解析逻辑在 `src/lib/random.ts` 的 `parseWeight`。若后续后端增加 `weight` 列，只需改 `src/lib/api.ts` 的 `toGift()`。

默认抽取模式为 `weighted`：`src/hooks/useGifts.ts` 的 `draw()` 用 `weightedPick()` 从 `/query_all_food` 的结果里抽。**抽取记录不落库**，奖品池是唯一数据源。

---

## 交互说明

| 操作 | 效果 |
| --- | --- |
| 点击左 / 右礼物盒（按落点判定半区） | 仅被点中的盒子演出：蓄力下沉 → 摇晃 → 盒盖飞出 + 星屑迸发 → 奖品玻璃卡片浮现；另一只盒保持轻柔摆动 |
| 点卡片本体 / 点卡片外任意区域 / 回车、空格 | 关闭奖品卡片，回到待机 |
| 点卡片右下角胶囊按钮「再抽一次」 | 关闭卡片并重开整套抽取演出 |
| 双击天空（湖面以上）空白处 | 投喂一颗新星 → 弹出命名卡片；取消时未命名的星自动回收 |
| 星空页里点星星或名字 | 弹出编辑卡片：名字 / 偏好 / 价格 / 描述全字段可改，可保存、可删除（× 按钮 + toast 撤销） |
| 星空页里把星星向下拖进湖面 | 溶解删除，底部出现「撤销」 |
| 点右上角纸飞机 / 点空白处 | 进入 / 退出星空收藏（纸飞机带柔曲线稿、加重虚线航迹、呼吸微光 + 浮动动画） |
| 点底部「增加餐食」小碗 | 打开便签录入表单：菜名（必填）/ 偏好（喜欢 · 不喜欢）/ 价格 / 描述（≤100 字）；预填与「换一份」均来自**库外**《心灵餐饮》诗化候选池（`mealDefaults.ts`，与数据库不重名），提交前查重拦截同名菜 |

主题说明：白天 / 夜晚双主题仍保留（令牌切换、夜晚线稿自动补暗色柔光），但左上角折角切换开关已暂时隐藏，月亮及其水中倒影已删除。

读屏：抽取结果、改名、删除与撤销都通过 `aria-live="polite"` 播报；礼盒、纸飞机、礼物星均可聚焦并有可见焦点描边。

---

## 关键动效与可调参数

| 场景 | 时长 / 缓动 | 调整位置 |
| --- | --- | --- |
| 双臂钟摆摇摆 | 4.4s / 3.9s（错频 alternate） | `src/components/BlindBox.module.css` 的 `armSwayL / armSwayR` |
| 盒子呼吸发光 + 缩放脉动 | 2.8s（右盒延迟 1.1s，无重影） | `glowWarm / glowCool / boxPulse` |
| 抽取五段时序 | 300（蓄力）/ 900（摇晃）/ 1100 / 1700ms | `src/App.tsx` 的 `handleDraw()` |
| 蓄力下沉 / 摇晃 / 开盖 | 300ms / `110ms linear 6` / 460ms | `armDip / armShake / lidFly` |
| 星屑迸发 / 心情字浮起 | 600ms（带 delay）/ 1400ms | `burst / moodFloat` |
| 玻璃奖品卡片浮现 | `rise 620ms var(--ease-soft)`，fixed 全屏居中；桌面端 `min(600px, 86vw)`、宽高比 2.2:1，紧凑单栏排版 | `src/components/RewardCard.module.css` |
| 卡片星尘 / 外围光晕 / 描边 | Canvas 绘制 60 个清晰圆点和 4 枚小星芒；白色光晕在卡片外侧呼吸，描边柔和闪烁 | `RewardCard.tsx` 与 `RewardCard.module.css` |
| 卡片降级 | ≤760px 转为竖卡（按钮移到价格下方）；`prefers-reduced-motion` 关闭循环动画 | `RewardCard.module.css` 媒体查询 |
| 纸飞机呼吸微光 / 浮动 | 2.6s / 4.2s | `src/components/ConstellationView.module.css` 的 `planeGlow / planeFloat` |
| 投喂种子星下沉 | 900ms ease-in | `seedSink` |
| 星河尘埃生成（夜 / 昼） | 每次 1~2 颗；夜间约每 160~280ms、白天约每 240~420ms | `src/components/StarParticles.tsx` 的 `emitters[0].rate` |
| 星河预铺（初始铺满） | 容器就绪时沿对角星河带程序化撒 56 颗（夜）或 32 颗（昼），约每 9 颗点缀一颗亮星 | `StarParticles.tsx` 的 `prefillBand()` |
| 星河带方向 / 张角 / 速度 | 右下方向，约 ±14° 扰动；夜 1.1~2.4 / 昼 0.8~1.6 | `emitters` + `particles.move` |
| 尘埃尺寸 / 透明度 | 0.6~2.2、0.35~0.95 | `particles.size` / `opacity` |
| 亮星点缀频率 / 尺寸 / 样式 | 夜间约 1.6~2.8s、白天约 3~5s 一颗；尺寸 2.2~4.2，实心四角星 | `emitters[1].rate` / `emitters[1].particles` 覆写 |
| 散落范围上限 | 屏幕宽 52%（水面中部） | `StarParticles.tsx` 轮询里的 `p.position.x >= width * 0.52` |
| 触水判定轮询 / 尘埃涟漪节流 | 每 200ms 检查；尘埃涟漪至少间隔 320ms | `src/components/StarParticles.tsx` |
| 涟漪半径 / 时长 / 数量上限 | 100px、700ms、12 个 | `src/hooks/useStarField.ts` 顶部常量与 `drawRipples()` |
| 主场景 Canvas 性能上限 | 背景星点最多 80 个；最高 30fps；DPR 上限 1.5 | `src/hooks/useStarField.ts` |
| 星河粒子性能上限 | `tsparticles` 最高 30fps；预铺粒子数按主题控制 | `src/components/StarParticles.tsx` |
| 地平线位置 / 弧度 | 62%、2vh | `src/styles/tokens.css` 的 `--horizon`，`src/hooks/useViewport.ts` 的 `horizonY()` |
| 手绘抖动幅度 | `scale=1.6` | `src/components/Scene.tsx` 的 `#roughen` 滤镜 |
| 倒影压缩 / 模糊 | 纵向压缩 0.75、轻微模糊 0.8px；倒影不再叠加全屏湍流位移滤镜 | `src/components/Reflection.module.css` |
| 星空收藏展开 | 400ms ease-out | `src/components/ConstellationView.module.css` |
| 星空收藏布局 | 按礼物 ID 生成稳定随机坐标，考虑名字标签与重叠并保留左右安全边距；窗口尺寸变化时重新排布，不绘制星间连线 | `src/components/ConstellationView.tsx` |
| 收藏星点闪烁 / 背景山水 | 14px 星体与独立光晕按 ID 错峰，以 2.2s 周期呼吸；背景有缓慢星云、三层圆润山峦和湖面波纹 | `GiftStar.module.css`、`ConstellationView.tsx`、`ConstellationView.module.css` |
| 拖拽删除溶解 | 500ms ease-in | `src/components/GiftStar.module.css` |

`prefers-reduced-motion: reduce` 下关闭粒子与循环动画；页面隐藏时暂停主场景 Canvas 的 `requestAnimationFrame`。

---

## 目录

```
src/
  main.tsx / App.tsx / types.ts
  styles/     tokens.css（设计令牌） global.css（重置与降级）
  components/ Scene SkyCanvas StarParticles（tsparticles 星星流） SkyCelestial Lake Reflection
              BlindBox（天降礼物盒双盒） RewardCard（奖品玻璃卡片）
              MealEntry（增加餐食录入） StarEditCard（星星编辑卡片）
              ConstellationView（星空收藏页 + 纸飞机入口） GiftStar Toast CornerFold（已隐藏）
  hooks/      useTheme useGifts（refresh / update / 乐观回滚） useStarField useDragStar（onTap 区分拖拽与点按） useViewport
  lib/        api.ts（FastAPI 请求） mealDefaults.ts（《心灵餐饮》库外候选池） storage.ts random.ts
```
