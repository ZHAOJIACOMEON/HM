# 配置相关
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# 1.创建数据库引擎
ASYNC_DATABASE_URL = 'mysql+aiomysql://root:@localhost:3306/eleme?charset=utf8'
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # 输出日志
    pool_size=10,  # 设置连接池
    max_overflow=20,  # 设置连接池允许的最大连接数
)

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