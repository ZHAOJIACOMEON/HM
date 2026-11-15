# 1.创建数据库引擎             租店
# 2.定义基类                  签合同约束
# 3.定义数据库表对应的模型类     选定装修模版
# 4.数据库创建实体表           启动装修
# 5.会话工厂                  服务台调度中心【任务分配中心，类似点餐机后台，不干活，在接收到点餐后分配服务员】
# 6.定义依赖项(核心！！！)      客人进门后流程接待服务【包含整个服务周期，从客人进门到离开】
# 7.路由使用                  体验服务

# 1-4 只执行一次
# 5-7 有需求即响应

import time
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Depends, Header
from fastapi.exceptions import HTTPException
from typing import Annotated

from sqlalchemy import DateTime, func, String, Float, INT, select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession  # 导包数据库引擎创建包
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# 1.创建数据库引擎
ASYNC_DATABASE_URL = 'mysql+aiomysql://root:@localhost:3306/shop?charset=utf8'
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # 输出日志
    pool_size=10,  # 设置连接池
    max_overflow=20,  # 设置连接池允许的最大连接数
)

# 2.定义基类
class Base(DeclarativeBase):
    create_time: Mapped[datetime] = mapped_column(
        DateTime,
        insert_default=func.now(),
        comment="创建时间"
    )
    update_time: Mapped[datetime] = mapped_column(
        DateTime,
        onupdate=func.now(),
        comment="修改时间"
    )

# 3.定义数据库表对应的模型类
class Goods(Base):
    __tablename__ = 'goods'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))
    category: Mapped[str] = mapped_column(String(50))
    price: Mapped[float] = mapped_column(Float)
    stock: Mapped[int] = mapped_column(INT)

# 4.数据库创建实体表
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            yield

app = FastAPI(lifespan=lifespan, )

# 5.会话工厂
AsyncSessionLocal = async_sessionmaker(
  bind=async_engine,  # 绑定数据库引擎
  class_=AsyncSession,  # 指定会话类
  expire_on_commit=False  # 会话对象不过期，不重新查询数据库
)

# 6.定义依赖项(核心！！！)
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


# 7.路由使用
@app.get('/products')
async def get_goods(db: Annotated[AsyncSession, Depends(get_database)]):

    goods = await db.get(Goods, 2)
    return goods