# 2.定义基类
from datetime import datetime

from sqlalchemy import DateTime, func, String, Float, INT
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


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
class Foods(Base):
    __tablename__ = 'goods'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))
    preference: Mapped[str] = mapped_column(String(50))
    price: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(String(100))
