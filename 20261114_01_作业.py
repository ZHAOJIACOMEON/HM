# FastAPI 进阶 · 课后练习题
## 第1题：中间件概念（理论）
# 简述什么是中间件，它在 FastAPI 请求处理流程中的执行时机是什么？列举至少 3 个中间件的典型应用场景。
'''
中间件是一个在每次请求进入 FastAPI 应用时都会被执行的函数。它在请求到达路由处理函数之前运行，并且在响应返回给客户端之前再运行一次。

执行时机：
请求阶段：请求到达时，先经过中间件，再到达路由处理函数
响应阶段：路由处理函数返回响应后，再经过中间件，最后返回给客户端
多个中间件的执行顺序是**自下而上**

典型应用场景：
1. 日志记录
2. 身份认证
3. 跨域处理（CORS）
4. 性能监控
5. 响应头处理
'''

## 第2题：依赖注入概念（理论）
# 简述 FastAPI 依赖注入系统的核心概念（依赖项、注入），并列出它的三个优点。
'''
**核心概念**：
- **依赖项**：可重用的组件（函数/类），负责提供某种功能或数据
- **注入**：FastAPI 自动帮你调用依赖项，并将结果"注入"到路径操作函数中

**三个优点**：
1. **代码复用**：一次编写，多处使用
2. **解耦**：业务逻辑与基础设施代码分离
3. **易于测试**：轻松地用模拟依赖替换真实依赖进行测试
'''

## 第3题：ORM 概念（理论）
# 简述 ORM 是什么，并列出相比直接编写 SQL 语句的四大优势。
'''
ORM（Object-Relational Mapping，对象关系映射）是一种编程技术，用于在面向对象编程语言和关系型数据库之间建立映射。它允许开发者通过操作对象的方式与数据库进行交互，而无需直接编写复杂的 SQL 语句。

**四大优势**：
1. 减少重复的 SQL 代码
2. 代码更简洁易读
3. 自动处理数据库连接和事务
4. 自动防止 SQL 注入攻击
'''

# ## 第4题：中间件编程（编程）
# 使用 `@app.middleware("http")` 实现一个**请求耗时统计中间件**：
# 记录每个请求的处理耗时（毫秒），并将耗时添加到响应头 `X-Response-Time` 中返回给客户端。
'''
import time
from fastapi import FastAPI

app = FastAPI()


# 中间件：多个中间件执行顺序-自下而上
# request：请求  call_next：向后传递请求的参数
@app.middleware('http')
async def middle_ware(request, call_next):
    print('middle_ware___开始')
    # 放一个开始计时器
    start_time = time.time()
    response = await call_next(request)
    print('middle_ware___结束')
    # 放一个结束计时器 计算时间差
    cost = (time.time() - start_time) * 1000
    # .2f表示浮点数保留两位小数
    response.headers["X-Response-Time"] = f"{cost:.2f}ms"
    return response


@app.get("/")
async def get_name():
    return {
        'name': 'name'
    }
# x-response-time: 10.53ms 
'''

## 第5题：依赖注入编程（编程）
# 某商品管理系统的多个接口都需要校验请求头中的 `token`。
# 请使用 `Depends` 抽取一个公共依赖项 `verify_token`：
# - 从请求头中获取 `token` 参数
# - 如果 `token` 不等于 `"admin123"`，抛出 `HTTPException`（401，detail `"未授权"`）
# - 将该依赖项注入到一个查询接口中
'''
from fastapi import FastAPI, Depends, HTTPException, Header
from typing import Annotated

app = FastAPI()


async def verify_token(token: Annotated[str, Header()]):
    print(f'这是token校验逻辑……')
    if token != 'admin123':
        raise HTTPException(status_code=401, detail=f'未授权')

    return token


@app.get("/check")
async def get_list(token: Annotated[str, Depends(verify_token)]):
    print('这是列表查询处理函数的逻辑代码……')
    return {"msg": "商品信息查询成功", "token": token}

# 打印信息
# {
#   "msg": "商品信息查询成功",
#   "token": "admin123"
# }
'''

# ## 第6题：ORM 建表（编程）
# 使用 SQLAlchemy ORM 完成以下建表工作：
# 1. 使用 `create_async_engine` 创建异步引擎（连接 MySQL，数据库名 `shop`）
# 2. 定义基类（继承 `DeclarativeBase`）和商品模型类 `Goods`，
# 字段包含：商品 id（主键）、商品名称 `name`、分类 `category`、价格 `price`、库存 `stock`
# 3. 使用 `lifespan` 生命周期函数，在应用启动时通过 `run_sync(Base.metadata.create_all)`
# 完成建表
'''
# 提前创建数据库shop  使用：create database if not exists shop;
from typing import Annotated
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime
from sqlalchemy import DateTime, func, String, Float, select
from contextlib import asynccontextmanager


# 1.创建引擎
ASYNC_DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/shop?charset=utf8"
# 创建异步引擎
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # 可选：输出SQL日志
    pool_size=10,  # 设置连接池中保持的持久连接数
    max_overflow=20  # 设置连接池允许创建的额外连接数
)

# 2.定义模型类
# 2.1 定义Base，继承 DeclarativeBase(抽取多表共同字段)
class Base(DeclarativeBase):
    # create_time: python类型 = 映射到表里边的类型(sqlalchemy里的类型)
    create_time: Mapped[datetime] = mapped_column(
        DateTime,
        insert_default=func.now(),
        comment="创建时间"
    )
    update_time: Mapped[datetime] = mapped_column(
        DateTime,
        onupdate=func.now(),
        comment="更新时间"
    )
    

# 2.2 定义数据库对应模型表，继承Base   id、商品名称name、分类category、价格price、库存stock
class Goods(Base):
    # 指定表名
    __tablename__ = 'goods'

    # 字段和类型
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[int] = mapped_column()
    price: Mapped[float] = mapped_column(Float)
    stock: Mapped[int] = mapped_column()
    
    
    
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            yield

app = FastAPI(lifespan=lifespan, title="测试文档")
'''

# ## 第7题：查询所有数据（编程）
# 创建数据库会话依赖项 `get_session`，并使用 `Depends` 注入到路由处理函数中。
# 定义接口 `GET /goods`，使用 `select(Goods)` 查询所有商品，通过 `scalars().all()`
# 获取并返回结果。
'''
from typing import Annotated
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime
from sqlalchemy import DateTime, func, String, Float, select
from contextlib import asynccontextmanager

class Base(DeclarativeBase):
    # create_time: python类型 = 映射到表里边的类型(sqlalchemy里的类型)
    create_time: Mapped[datetime] = mapped_column(
        DateTime,
        insert_default=func.now(),
        comment="创建时间"
    )
    update_time: Mapped[datetime] = mapped_column(
        DateTime,
        onupdate=func.now(),
        comment="更新时间"
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        yield


app = FastAPI(lifespan=lifespan, title="测试文档")

ASYNC_DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/shop?charset=utf8"
# 创建异步引擎
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True, # 可选：输出SQL日志
    pool_size=10, # 设置连接池中保持的持久连接数
    max_overflow=20 # 设置连接池允许创建的额外连接数
)


# 2.2 定义数据库对应模型表，继承Base   id、商品名称name、分类category、价格price、库存stock
class Goods(Base):
    # 指定表名
    __tablename__ = 'goods'

    # 字段和类型
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[int] = mapped_column()
    price: Mapped[float] = mapped_column(Float)
    stock: Mapped[int] = mapped_column()


# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,  # 绑定数据库引擎
    class_=AsyncSession,  # 指定会话类
    expire_on_commit=False  # 会话对象不过期，不重新查询数据库
)


# 依赖项，用于获取数据库会话
async def get_database():
    async with AsyncSessionLocal() as session:
        try:
            yield session  # 返回数据库会话给路由处理函数
            await session.commit()  # 无异常，提交事务
        except Exception:
            await session.rollback()  # 有异常则回滚
            raise
        finally:
            await session.close()  # 关闭会话


@app.get("/goods")
async def get_goods(
        db: Annotated[AsyncSession, Depends(get_database)]
):
    res = await db.execute(select(Goods))
    goods = res.scalars().all()
    return goods

# [
#   {
#     "category": 1,
#     "id": 1,
#     "stock": 8,
#     "update_time": "2026-11-14T20:20:48",
#     "price": 8999.99,
#     "name": "华为手机",
#     "create_time": "2026-11-14T20:20:36"
#   },
#   {
#     "category": 2,
#     "id": 2,
#     "stock": 6,
#     "update_time": "2026-11-14T20:21:29",
#     "price": 1539,
#     "name": "SKII神仙水",
#     "create_time": "2026-11-14T20:21:18"
#   }
# ]
'''

# ## 第8题：查询单条数据（编程）
# 定义接口 `GET /goods/{goods_id}`，使用 `db.get(Goods, goods_id)` 根据主键查询单条商品。
# 如果商品不存在，抛出 `HTTPException`（404，detail `"商品不存在"`）。
'''
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import select, String, Float
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


app = FastAPI()

ASYNC_DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/shop?charset=utf8"
# 创建异步引擎
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True, # 可选：输出SQL日志
    pool_size=10, # 设置连接池中保持的持久连接数
    max_overflow=20 # 设置连接池允许创建的额外连接数
)


class Goods(Base):
    # 指定表名
    __tablename__ = 'goods'

    # 字段和类型
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[int] = mapped_column()
    price: Mapped[float] = mapped_column(Float)
    stock: Mapped[int] = mapped_column()

# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,  # 绑定数据库引擎
    class_=AsyncSession,  # 指定会话类
    expire_on_commit=False  # 会话对象不过期，不重新查询数据库
)


# 依赖项，用于获取数据库会话
async def get_database():
    async with AsyncSessionLocal() as session:
        try:
            yield session  # 返回数据库会话给路由处理函数
            await session.commit()  # 无异常，提交事务
        except Exception:
            await session.rollback()  # 有异常则回滚
            raise
        finally:
            await session.close()  # 关闭会话

@app.get("/goods/{goods_id}")
async def get_goods(
        goods_id: int,
        db: Annotated[AsyncSession, Depends(get_database)]
):
    goods = await db.get(Goods, goods_id)
    if not goods:
        raise HTTPException(status_code=404, detail="商品不存在")
    return goods

# http://127.0.0.1:8000/goods/2
# {
#   "stock": 6,
#   "price": 1539,
#   "name": "SKII神仙水",
#   "category": 2,
#   "id": 2
# }
'''

# ## 第9题：条件查询 - 比较判断（编程）
# 定义接口 `GET /goods/price/{min_price}/{max_price}`，查询价格在 `min_price` 到 `max_price` 之间的商品。使用 `select(Goods).where(Goods.price >= min_price, Goods.price <= max_price)` 实现比较条件查询。

# ## 第10题：条件查询 - 模糊查询（编程）
# 定义接口 `GET /goods/search/{keyword}`，根据商品名称进行模糊搜索。使用 `like()` 方法，`%` 匹配任意字符，查询名称中包含 `keyword` 的商品。

# ## 第11题：条件查询 - 与非查询（编程）
# 定义接口 `GET /goods/filter`，查询**库存大于 0 且价格小于 100** 的商品。使用 `&`（与）组合两个条件。再定义一个接口查询**价格不低于 50 或分类为"电子"**的商品，使用 `|`（或）组合条件。

# ## 第12题：条件查询 - 包含查询（编程）
# 定义接口 `GET /goods/category`，接收一个查询参数 `categories`（如 `"电子,食品,图书"`），将其拆分为列表后，使用 `in_()` 查询分类在指定列表中的商品。

# ## 第13题：聚合查询（编程）
# 定义接口 `GET /goods/stats`，使用 `func` 聚合查询返回商品的统计信息：
# - 商品总数（`func.count()`）
# - 平均价格（`func.avg()`）
# - 最高价格（`func.max()`）
# - 最低价格（`func.min()`）

# ## 第14题：分页查询（编程）
# 定义接口 `GET /goods/page`，携带查询参数 `page`（页码，默认 1）和 `size`（每页数量，默认 10）。使用 `offset().limit()` 实现分页查询，offset 值 = (当前页码 - 1) × 每页数量。

# ## 第15题：新增数据（编程）
# 定义 Pydantic 模型 `GoodsCreate`（name、category、price、stock），接口 `POST /goods` 接收请求体。使用 `model_dump()` 将 Pydantic 模型转为 ORM 对象，通过 `add()` 添加到事务，`commit()` 提交到数据库。

# ## 第16题：修改数据（编程）
# 定义接口 `PUT /goods/{goods_id}`，先通过 `db.get()` 查询商品，再对属性重新赋值（修改名称和价格），最后 `commit()` 提交。如果商品不存在，抛出 404 异常。

# ## 第17题：删除数据（编程）
# 定义接口 `DELETE /goods/{goods_id}`，先通过 `db.get()` 查询商品，再使用 `db.delete()` 删除该商品，最后 `commit()` 提交。如果商品不存在，抛出 404 异常。
