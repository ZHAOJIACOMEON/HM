/**
 * 录入建议候选池：《心灵餐饮 · 餐食名字》——以「心情」为线索，
 * 把情绪与处境对应到食物上，提供诗意、有画面感、有陪伴感的文学化菜名。
 * 仅供「增加餐食 / 换一份」预填表单使用，均为数据库之外的全新数据；
 * App 会在挑选前查 query_all_food，剔除库里已有的名字，保证建议不与数据库重名。
 */
export interface Suggestion {
  name: string
  preference: string
  price: number
  description: string
}

const DEFAULT_MEALS: Suggestion[] = [
  { name: '把乌云炖成奶白汤', preference: '喜欢', price: 32, description: '心情发霉的下午，让胡椒和骨髓慢慢把阴天煮开' },
  { name: '月亮沉进小米粥', preference: '喜欢', price: 14, description: '夜深了还不困，就喝一碗金黄色的平静' },
  { name: '眼泪掉进酒酿圆子', preference: '喜欢', price: 16, description: '哭完再吃，甜会先苦后甜' },
  { name: '晚风拌黄瓜', preference: '喜欢', price: 9, description: '拍碎的响声里，烦躁也跟着碎掉了' },
  { name: '心事焗进芝士里', preference: '喜欢', price: 38, description: '拉丝的那一秒，没什么好隐瞒的' },
  { name: '一碗热雾', preference: '喜欢', price: 12, description: '鸡汤面升起的热气，是冬天递来的手' },
  { name: '委屈包进饺子', preference: '喜欢', price: 22, description: '捏紧褶口，下锅煮熟，出来就只剩香了' },
  { name: '焦糖色的下午', preference: '喜欢', price: 18, description: '布丁晃晃悠悠，提醒你日子可以慢一点' },
  { name: '星星掉进麻酱碗', preference: '喜欢', price: 17, description: '每一根面都裹住了今天的运气' },
  { name: '把「算了」煮成糖水', preference: '喜欢', price: 13, description: '红豆慢火熬到开花，不甘心也熬软了' },
  { name: '失眠者桂花蜜藕', preference: '喜欢', price: 21, description: '凌晨两点，甜和糯比数羊有用' },
  { name: '心软的豆腐羹', preference: '喜欢', price: 15, description: '你也心软，它也心软，正好凑成一碗温柔' },
  { name: '白日梦蒸糕', preference: '喜欢', price: 19, description: '米香松软，适合发呆时垫在梦底下' },
  { name: '疲惫清蒸鲈鱼', preference: '喜欢', price: 45, description: '葱姜丝落上去的瞬间，今天就被原谅了' },
  { name: '倔强的苦瓜', preference: '不喜欢', price: 14, description: '先苦后甜是骗小孩的，可它偏偏有它自己的道理' },
  { name: '香菜人的劫难', preference: '不喜欢', price: 28, description: '绿意汹涌，其余灵魂当场告辞' },
  { name: '清水煮白的星期一', preference: '不喜欢', price: 7, description: '白菜豆腐清汤寡水，像一周里最不想面对的那天' },
  { name: '没说完的话渣渣饼', preference: '不喜欢', price: 11, description: '掉了一桌子的碎屑，都是咽回去的半句话' },
]

/** 随机挑一条「数据库里没有的」建议；excludeNames 为数据库已存在的菜名，avoid 为当前已预填的那条 */
export function pickSuggestion(excludeNames: Iterable<string>, avoid: string | null): Suggestion | null {
  const taken = new Set(excludeNames)
  const pool = DEFAULT_MEALS.filter((m) => !taken.has(m.name) && m.name !== avoid)
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
