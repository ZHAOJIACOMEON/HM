from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.food import Foods
from schemas.food import AddFoods, UpdateFood


# 查询所有餐食
async def select_food(db: AsyncSession):
    stmt = select(Foods)
    res = await db.execute(stmt)
    result = res.scalars().all()

    return result

# 根据id查询餐食
async def query_food(food_id: int, db: AsyncSession):
    result = await db.get(Foods, food_id)

    return result

# 新增餐食
async def add_food(data: AddFoods, db: AsyncSession):
    food_orm = Foods(**data.__dict__)
    db.add(food_orm)
    await db.commit()

    return food_orm


# 修改餐食
async def update_food(food: Foods, data: UpdateFood, db: AsyncSession):
    food.name = data.name
    food.preference = data.preference
    food.price = data.price
    food.description = data.description
    await db.commit()
    return food

# 删除餐食
async def delete_food(food: Foods, db: AsyncSession):
    await db.delete(food)
    await db.commit()
    return food
