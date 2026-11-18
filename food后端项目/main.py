from contextlib import asynccontextmanager
import random
from typing import Annotated

from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.cors import CORSMiddleware

from config.db_food import get_database, async_engine
from crud.food import select_food, query_food, add_food, update_food, delete_food
from models.food import Base, Foods
from schemas.food import AddFoods, UpdateFood


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            yield

app = FastAPI(lifespan=lifespan, title="午饭盲盒系统")

# 允许的来源（可以是域名列表）
origins = [
  "http://localhost",
  "http://localhost:5000",
  "https://your-frontend-domain.com"
]

# 添加 CORS 中间件
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],     # 允许访问的源
  allow_credentials=True,  # 允许携带 Cookie
  allow_methods=["*"],     # 允许所有请求方法
  allow_headers=["*"],     # 允许所有请求头
)

@app.get("/")
async def root():
    return {
        "message": "欢迎进入点餐系统",
        "功能列表": {
            '1. 添加新增餐食': '/add_food',
            '2. 根据id查询餐食': '/query_food',
            '3. 更新餐食': '/update_food',
            '4. 删除餐食': '/delete_food',
            '5. 查询所有餐食': '/query_all_food'
        }
    }

db = Annotated[AsyncSession, Depends(get_database)]

# 查询所有餐食
@app.get("/query_all_food")
async def query_all_food(db: db):
    res = await select_food(db)
    return {
        "message": "查询成功",
        "data": res
    }

# 根据id查询餐食
@app.get("/query_food/{food_id}")
async def query_food_by_id(food_id: int, db: db):
    res = await query_food(food_id, db)

    if res is None:
        return {
            "message": "您要查询的food_id不存在，请检查food_id是否正确～"
        }

    return {
        "message": "查询成功",
        "food_id": f"您要查询的food_id为{food_id}",
        "data": res
    }

# 新增餐食
@app.post("/add_food")
async def add_food_by_id(data: AddFoods, db: db):
    res = await query_food(data.id, db)
    if res:
        return {
            "message": "您要添加的food_id已存在，请重新输入～"
        }

    res = await add_food(data, db)
    return {
        "message": "新增成功",
        "data": res
    }

# 修改餐食
@app.put("/update_food/{food_id}")
async def update_food_by_id(food_id: int, data: UpdateFood, db: db):
    res = await query_food(food_id, db)
    if res is None:
        return {
            "message": "您要修改的food_id不存在，请重新输入～"
        }

    res = await update_food(res, data, db)

    return {
        "message": "修改成功",
        "data": res
    }

# 删除餐食
@app.delete("/delete_food/{food_id}")
async def delete_food_by_id(food_id: int, db: db):
    res = await query_food(food_id, db)
    if res is None:
        return {
            "message": "您要删除的food_id不存在，请重新输入～"
        }

    await delete_food(res, db)
    return {
        "message": "删除成功",
        "data": f"已删除id为{food_id}的餐食"
    }


# ===== 抽盲盒 / 推荐餐食 =====
def _is_like(pref: str) -> bool:
    """判断偏好是否为「喜欢」"""
    s = str(pref).lower()
    if "不喜欢" in s or s in ("dislike", "hate", "0", "no", "bad"):
        return False
    return "喜欢" in s or s in ("like", "love", "1", "yes", "good")


def _is_dislike(pref: str) -> bool:
    """判断偏好是否为「不喜欢」"""
    s = str(pref).lower()
    return "不喜欢" in s or s in ("dislike", "hate", "0", "no", "bad")


def _meal_to_dict(food: Foods) -> dict:
    return {
        "id": food.id,
        "name": food.name,
        "preference": food.preference,
        "price": food.price,
        "description": food.description,
    }


_GOOD_MSGS = [
    "就是它了，今天对自己好一点！",
    "这家绝了，钱包在笑你懂吗。",
    "奖励辛苦了一天的你，冲！",
    "吃完这顿，明天继续加油（大概）。",
    "命运之选，不接受反驳。",
]
_BAD_MSGS = [
    "别嫌寒酸，能吃上就不错了。",
    "至少它便宜，省下的钱还能再抽一次。",
    "这就是生活，凑合一口得了。",
    "心情不好？那更要填饱肚子。",
    "随机分配，爱要不要。",
]


# 根据心情推荐一餐：good 只抽「喜欢」，bad 只抽「不喜欢」
@app.get("/recommend_food")
async def recommend_food(mood: str = "good", db: db = None):
    res = await select_food(db)
    if mood == "bad":
        pool = [f for f in res if _is_dislike(f.preference)]
        msgs = _BAD_MSGS
    else:
        pool = [f for f in res if _is_like(f.preference)]
        msgs = _GOOD_MSGS

    if not pool:
        return {
            "message": "对应偏好库为空",
            "msg": "这个抽屉是空的…先去添加点餐食吧",
            "meal": None,
        }

    meal = random.choice(pool)
    return {
        "message": "推荐成功",
        "msg": random.choice(msgs),
        "meal": _meal_to_dict(meal),
    }
