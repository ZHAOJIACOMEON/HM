from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field


class AddFoods(BaseModel):
    id: int
    name: str
    preference: str
    price: float
    description: str
    update_time: Annotated[datetime, Field(default=datetime.now())]

class UpdateFood(BaseModel):
    name: str
    preference: str
    price: float
    description: str