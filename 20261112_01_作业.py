# FastAPI 入门 · 作业题
## 第1题：FastAPI 概述与优势（理论）
# FastAPI 是一个用于构建 API 接口的现代 Web 框架。请结合实际开发场景，说明它相比传统 Web 框架（如 Flask）有哪些核心优势，并分别指出这些优势在开发中带来的具体好处。

# ## 第2题：同步与异步（理论）
# 用一个生活中的场景（如餐厅点餐）类比说明"同步"和"异步"的区别，并解释为什么 FastAPI 选择原生异步支持，这对一个高并发的接口服务意味着什么。

# ## 第3题：创建与运行项目（操作）
# 假设你要开发一个"天气查询 API"，请写出从零启动项目的关键命令：
# 1. 为什么要为每个项目创建独立的虚拟环境？
# 隔离项目运行环境，避免依赖冲突，保持全局环境的干净和稳定
# 2. 写出运行 FastAPI 项目的两种命令（含热重载参数）。
'''
uvicorn main:app --reload    --reload：更改代码后自动重启服务器
uv run fastapi dev
'''
# 3. `--reload` 参数解决了开发中的什么痛点？
# 更改代码后自动重启服务器

# ## 第4题：访问项目与交互式文档（操作）
# FastAPI 项目启动后，前端同事需要查看所有接口说明并进行在线测试。请写出：
# 1. 项目默认监听的地址和端口。
# http://127.0.0.1:8000/
# 2. 访问根路由的完整 URL。
# http://127.0.0.1:8000/
# 3. 访问交互式文档（Swagger UI）的完整 URL。
# http://127.0.0.1:8000/docs/

# ## 第5题：路由定义（编程）
# 某外卖平台需要一个欢迎接口：访问路径 `/takeout/welcome` 时，返回 JSON 数据 `{"msg": "欢迎使用外卖点餐系统"}`。
# 请用 FastAPI 实现该路由。
'''
from fastapi import FastAPI

app = FastAPI()


@app.get("/takeout/welcome")
async def welcome():
    return {"msg": "欢迎使用外卖点餐系统"}
'''

# ## 第6题：路径参数（编程）
# 某在线影院需要根据电影编号查询电影信息。设计接口 `/movie/{id}`，要求：
# - id 为整数类型
# - 响应格式为 `{"id": 101, "title": "电影101"}`（title 由 id 拼接生成）
'''
from fastapi import FastAPI

app = FastAPI()


@app.get("/movie/{id}")
async def check_movie_by_id(id: int):
    return {"id": id, "title": f"电影{id}"}
'''

# ## 第7题：路径参数 Path 校验（编程）
# 某旅游平台需要两个带校验的路径参数接口：
# - 接口1：航班查询 `/flight/{flight_no}`，航班号长度 4~6 个字符，添加描述"航班编号"
# - 接口2：酒店星级查询 `/hotel/{level}`，星级范围 1~5，添加描述"酒店星级"
# 请使用 `Path` + `Annotated` 实现类型注解和校验。
'''
from fastapi import FastAPI, Path
from typing import Annotated

app = FastAPI()


# Path方式
@app.get("/flight/{flight_no}")
async def check_flight_no(flight_no: str = Path(..., min_length=4, max_length=6, description="航班编号")):
    return {"航班号为": flight_no, "msg": "航班号查询成功..."}


@app.get("/hotel/{level}")
async def check_flight_no(level: int = Path(..., ge=1, le=5, description="酒店星级")):
    return {"酒店星级为": level, "msg": "酒店星级查询成功..."}


# Annotated方式校验
@app.get("/flight/{flight_no}")
async def check_flight_no(flight_no: Annotated[str, Path(min_length=4, max_length=6, description="航班编号")]):
    return {"航班号为": flight_no, "msg": "航班号查询成功..."}


@app.get("/hotel/{level}")
async def check_flight_no(level: Annotated[int, Path(ge=1, le=5, description="酒店星级")]):
    return {"酒店星级为": level, "msg": "酒店星级查询成功..."}
'''

# ## 第8题：查询参数（编程）
# 某天气服务提供 `/weather` 接口，携带两个查询参数：
# - 城市 `city`：字符串类型，默认值 `北京`
# - 温度单位 `unit`：字符串类型，默认值 `celsius`
# 返回两个参数的值，如 `{"city": "上海", "unit": "fahrenheit"}`。
'''
from fastapi import FastAPI

app = FastAPI()


# Path方式
@app.get("/weather")
async def weather(city: str = "北京", unit: str = "celsius"):
    return {"city": city, "unit": unit}
'''

# ## 第9题：查询参数 Query 校验（编程）
# 某电商平台商品搜索接口 `/product/search`，使用 `Query` + `Annotated` 实现校验：
# - 搜索关键词 `keyword`：默认值 `手机`，长度限制 1~50，添加描述"搜索关键词"
# - 最低价格 `min_price`：必填，范围 0~9999，添加描述"最低价格"
from fastapi import FastAPI, Query
from typing import Annotated
from pydantic import BaseModel, Field

app = FastAPI()

'''
# Query方式
@app.get("/product/search")
async def product_search(
        keyword: str = Query("手机", min_length=1, max_length=50, description="搜索关键词"),
        min_price: int = Query(..., ge=0, le=9999, description="最低价格")
):
    return {"keyword为": keyword, "min_price为": min_price}

# Annotated方式
@app.get("/product/search")
async def product_search(
        keyword: Annotated[
            str,
            Query(min_length=1, max_length=50, description="搜索关键词")
        ] = "手机",

        # min_price：Query 里面只放验证规则，外面加上 = ... 表示必填
        min_price: Annotated[
            int,
            Query(ge=0, le=9999, description="最低价格")
        ] = ...
):
    return {"keyword为": keyword, "min_price为": min_price}
'''

# ## 第10题：请求体参数（编程）
# 某博客系统需要发布文章接口 `POST /article`，文章信息包含：标题（title）、内容（content）、作者（author）、分类（category）。
# 使用 Pydantic 的 BaseModel 定义请求体模型，接收并返回文章信息。
'''
@app.post("/article")
async def publish_article(
        title: str = Query("标题", min_length=1, max_length=50, description="标题"),
        content: str = Query("内容", min_length=1, max_length=50, description="内容"),
        author: str = Query("作者", min_length=1, max_length=50, description="作者"),
        category: int = Query(..., ge=0, le=9999, description="分类")
):
    return {"title为": title, "content为": content, "author为": author, "category为": category}
'''

# ## 第11题：请求体参数 Field 校验（编程）
# 某 HR 系统的员工入职接口 `POST /employee`，使用 `Field` 为字段添加校验：
# - 姓名 `name`：必填，长度 2~20
# - 工号 `employee_id`：必填，长度 3~10
# - 部门 `department`：默认值"技术部"
# - 薪资 `salary`：必填，必须大于 0
@app.post("/employee")
async def employee(
        name: Annotated[str, Field(..., min_length=2, max_length=20, description="姓名")],
        employee_id: Annotated[str, Field(..., min_length=3, max_length=10, description="工号")],
        department: Annotated[str, Field("技术部", description="部门")],
        salary: Annotated[int, Field(..., gt=0, description="薪资")]
):
    return {"name为": name, "employee_id为": employee_id, "department为": department, "salary为": salary}

# ## 第12题：响应类型 - HTML（编程）
# 某系统的维护公告接口 `/notice`，在装饰器中设置响应类为 `HTMLResponse`，返回一段 HTML 内容：包含一个 `<h1>`
# 标题（如"系统公告"）和一个 `<p>` 段落（如维护时间说明）。

# ## 第13题：响应类型 - 文件（编程）
# 某数据平台提供月报下载接口 `/report`，使用 `FileResponse` 返回一个 PDF 文件（文件名 `monthly_report.pdf`）供客户端下载。

# ## 第14题：自定义响应格式 response_model（编程）
# 某商品详情接口 `/product/{id}`，使用 `response_model` 约束响应输出格式。定义 Pydantic 模型 `ProductResponse`，
# 包含字段：`id`（整数）、`name`（字符串）、`price`（浮点数）、`stock`（整数）。接口返回符合该模型的数据。

# ## 第15题：异常处理 HTTPException（编程）
# 某库存查询接口 `/stock/{id}`，当库存数量（假设固定为某值）小于等于 0 时，使用 `HTTPException` 抛出 400 异常，
# detail 为 `"库存不足"`；库存大于 0 时正常返回商品库存信息。
