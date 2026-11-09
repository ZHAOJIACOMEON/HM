# 作业题
## 选择题
# 1. 关于 PyMySQL 连接数据库，正确的连接参数是？
# A. `pymysql.connect(host='localhost', user='root', pass='123', db='test')`
# B. `pymysql.connect(host='localhost', user='root', password='123', database='test')`
# C. `pymysql.connect(localhost, 'root', '123', 'test')`
# D. `pymysql.Connect(host='localhost', uid='root', pwd='123', db='test')`
# B

# 2. 执行查询后，获取一条记录的正确方法是？
# A. `cursor.fetch()`
# B. `cursor.fetchone()`
# C. `cursor.fetch_row()`
# D. `cursor.getone()`
# B

# 3. 下列哪个方法用于提交事务？
# A. `connection.commit()`
# B. `connection.rollback()`
# C. `cursor.commit()`
# D. `connection.submit()`
# A

# 4. 执行以下代码后，查询结果的数据类型是？
# ```python
# cursor.execute("SELECT name, age FROM users")
# data = cursor.fetchall()
# ```
# A. 列表，每个元素是元组
# B. 字典
# C. 元组，每个元素是列表
# D. 列表，每个元素是字典
# 无，应该是元组，每个元素也是元组      如：(('aLice', 1), ('bOB', 2))

# 5. 使用 `connection.cursor()` 返回的对象默认行为是？
# A. 返回普通元组 cursor
# B. 返回字典 cursor
# C. 返回列表 cursor
# D. 返回 NamedTuple cursor
# A

# 6. 安装 RedisPy 的正确命令是？
# A. `pip install pyredis`
# B. `pip install redis-py`
# C. `pip install redis`
# D. `pip install python-redis`
# C

# 7. 连接 Redis 服务器的代码是？
# A. `redis.connect(host='localhost', port=6379)`
# B. `Redis(host='localhost', port=6379)`
# C. `redis.Redis(host='localhost', port=6379)`
# D. `redis.Client(host='localhost', port=6379)`
# C

# 8. 如何设置一个键值对并指定过期时间为10秒？
# A. `r.set('key', 'value')`
# B. `r.set('key', 'value', ex=10)`
# C. `r.setex('key', 10, 'value')`
# D. B 和 C
# D

# 9. 以下哪个方法用于获取 Redis 中所有键？
# A. `r.get_keys()`
# B. `r.keys()`
# C. `r.scan()`
# D. `r.getall()`
# B

# 10. 向列表（List）左侧插入元素的方法是？
# A. `r.lpush('list_key', 'value')`
# B. `r.rpush('list_key', 'value')`
# C. `r.left_push('list_key', 'value')`
# D. `r.linsert('list_key', 'value')`
# A

## 基础题
# 请简述python操作数据库的步骤 ?
# 1.导包
# import pymysql
#
# # 2.连接对象
# conn = pymysql.connect(
#     host='localhost',
#     port=3306,
#     user='root',
#     password='',
#     database='my_db'
# )
#
# # 3.创建游标对象
# cur = conn.cursor()
#
# # 4.执行SQL
# res = cur.execute('select * from products')
# print(res) # sql执行影响的行数
#
# # 5. 关闭：游标对象和连接对象
# cur.close()
# conn.close()

## 进阶题
# 利用所学python知识,编写一个操作mysql的工具类,
# 功能如下:
# 1. 在工具类的init魔法方法中初始化连接对象
# 2. 定义选择数据库的方法
# 3. 定义查询所有数据的方法
# 4. 定义增删改方法,设置直接提交
# 5. 定义关闭连接对象的方法
# 6. 额外定义一个方法,用于执行不自动提交的sql
# 7. 额外定义一个方法,用于检查指标表师范在指定库中存在
# 8. 额外定义一个方法,用于检查表如果不存在的话直接创建表

## 面试题
# 已知需求:  自己创建一个数据库,里面有user表,用于存储用户名密码(咱们直接写固定  用户名root 密码123456   )
# 需要完成的功能是用户键盘录入用户名和密码,使用python代码连接数据库判断是否登录成功
# 分析:  现实生活中如果要登录,必须先注册,用户注册完后,对应的信息就存储到对应网站后台数据库中
# 用户登录:  用户新输入的用户名密码和数据库中的用户名和密码比较,都相同就登录成功,否则失败
# 问题: 上述登录案例中会存在数据注入问题,如何解决?
# 在Python操作数据库时，为了避免数据注入，应该使用参数化查询（也称为预处理语句）。这通常是通过使用数据库API提供的占位符功能来实现的。

# 具体代码示例:
# 建库
'''
create TABLE user(
    id int PRIMARY KEY AUTO_INCREMENT,
    user varchar(30),
    pwd varchar(30)
);
insert into user(user,pwd) VALUE ('root','123456');
'''

# 演示注入问题:
'''
import pymysql
conn = pymysql.connect(
    host='localhost',
    port=3306,
    user='root',
    password='',
    database='my_db'
)
cur = conn.cursor()

username = input('请输入用户名: ')
password = input('请输入密码: ')
res = cur.execute(f"select * from user where user='{username}' and pwd='{password}'")

if res:
    print('登录成功');
else:
    print('登录失败');

cur.close()
conn.close()
'''
# 解决注入问题:
import pymysql
conn = pymysql.connect(
    host='localhost',
    port=3306,
    user='root',
    password='',
    database='my_db'
)
cur = conn.cursor()

username = input('请输入用户名: ')
password = input('请输入密码: ')
res = cur.execute("select * from user where user=%s and pwd=%s", [username, password])

if res:
    print('登录成功');
else:
    print('登录失败');

cur.close()
conn.close()