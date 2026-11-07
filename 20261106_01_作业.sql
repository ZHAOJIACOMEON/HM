# MySQL基础
## 总结
# 建议使用xmind思维导图对今天知识自己做个总结。
# https://app.xmind.cn/share/0tao4WvV?xid=1jDz6ZZw

### 题目1
# 说说数据库的作用，以及常见的数据库有哪些？
# 数据库作用:数据库的作用就是存储和管理数据的,例如可以存储大量的商品信息、用户信息、用户浏览信息等,当然也可以对这些数据进行管理处理,例如新增数据、修改数据、删除数据、查看数据等;
# 数据库可分为:关系型数据库、非关系型数据库.
# 	关系型数据库:遵循SQL标准的数据库,有结构、安全性高,例如MySQL、Oracle、SQL Server等;
# 	非关系型数据库:NoSQL,没结构、通常查询效率高,但不是很安全,例如HBase、Redis等.

### 题目2
# 请说一说数据库语言有哪几个分类，并阐述下该分类下常用的SQL关键字。
# 数据库语言可分为四类:
# 	DDL:数据定义语言,主要用于定义数据库、数据表等,关键字:create、alter、drop等;
# 	DML:数据操作语言,主要用于操作数据表字段的命令,关键字:insert、update、delete等;
# 	DQL:数据查询语言,主要用于查询数据操作,关键字:select、from、where等;

### 题目3
# 请简单介绍下约束的作用以及常见的约束
# 约束作用:约束实际上就是表中数据的限制条件
# 常见的约束有：
#     主键约束:(primary key)  特点: 修饰的字段值非空唯一
#     非空约束:(not null)     特点: 修饰的字段值不能为空
#     唯一约束:(unique)	    特点: 修饰的字段值不能重复
#     默认约束:(default)	    特点: 修饰的字段值可以设置默认值
#     外键约束:(foreign key)  特点: 约束多表中数据的一致性和完整性

## 实操题
### 题目1
# 使用命令行来完成相关的数据库操作，如下：
# (1)创建数据库名称为db_student1
create database if not exists db_student1;

# (2)创建数据库名称为db_hw1
create database if not exists db_hw1;

# (3)切换数据库为db_student1
use db_student1;

# (4)查看当前使用的是哪个数据库；
select database();

# (5)查看所有数据库
show databases;

# (6)删除数据库db_student1；
drop database db_student1;

# (7)查看当前使用的是哪个数据库；
select database();

# (8)切换数据库到db_hw1。
use db_hw1;

### 题目2
# 使用命令行来完成相关的数据表操作，如下：
# (1)在数据库db_hw1中创建一个数据student表，
# 有用户sid、姓名name、性别sex、生日birthday；
create database if not exists db_hw1;
use db_hw1;
create table student
(
    sid      int,
    name     varchar(20),
    sex      varchar(5),
    birthday date
);

# (2)查看数据表中的字段信息
desc student;

# (3)查看创建数据表语句；
show create table student;

# (4)再次创建一个数据little_student表,只有name一个字段
create table little_student
(
    name varchar(20)
);

# (5)查看所有表
show tables;

# (6)删除little_student表
drop table little_student;

# (7)修改student数据表名为tb_student。
rename table student to tb_student;

# (8)再次查看所有表
show tables;

### 题目3
# 使用命令行来完成相关的数据表操作，如下：
# (0)创建数据库db_hw1
create database if not exists db_hw1;

# (1)在数据库db_hw1中创建一个数据tb_student表，有用户sid、姓名name、性别sex、生日birthday；注意如果表存在就使用已存在的哦!
create table if not exists tb_student
(
    sid      int,
    name     varchar(20),
    sex      varchar(5),
    birthday date
);

# (2)添加一个字段名称为age 类型为int添加一个字段
alter table tb_student
    add age int;

# (3)添加一个字段名称为desc 类型为varchar(200)
alter table tb_student
    add `desc` varchar(200);

# (4)查看所有字段信息
desc tb_student;

# (5)修改birthday字段,名称为birth  类型为datetime,修改完后再次查看字段信息查看是否变化
alter table tb_student
    change birthday birth datetime;

# (6)删除desc字段,删除完后再次查看字段信息查看是否变化
alter table tb_student
    drop `desc`;
desc tb_student;

### 题目4
# 按照下列要求完成DML操作：
# （1）使用数据库db_hw1
use db_hw1;
# （2）在该库中创建一个student表，字段有编号、学号、姓名、语文成绩、英语成绩、数学成绩等；
# （3）对于这些字段，要求：编号是整型，学号是字符串；
create table student
(
    id      int primary key auto_increment not null,
    number  varchar(20),
    name    varchar(20),
    chinese double,
    english double,
    math    double
);

# （4）给student表添加如下10条数据；
#
# >​		(1, '20210908001','张王明', 89, 78, 90),
# >​       (2, '20210908002', '李进', 67, 53, 95),
# >​       (3, '20210908003', '王俊', 87, 78, 77),
# >​       (4, '20210908004', '李云云', 80, 98, 92),
# >​       (5, '20210908005', '谢来财', 82, 84, 67),
# >​       (6, '20210908006', '张进宝', 55, 85, 89),
# >​       (7, '20210908007', '黄蓉儿', 79, 86, 90),
# >​       (8, '20210908008', '刘小雪', 71, 90, 91),
# >​       (9, '20210908009', '夏金章', 89, 91, 96),
# >​       (10, '20210908010', '杨洋', 83, 65, 90)
insert into student(id, number, name, chinese, english, math)
values (1, '20210908001', '张王明', 89, 78, 90),
       (2, '20210908002', '李进', 67, 53, 95),
       (3, '20210908003', '王俊', 87, 78, 77),
       (4, '20210908004', '李云云', 80, 98, 92),
       (5, '20210908005', '谢来财', 82, 84, 67),
       (6, '20210908006', '张进宝', 55, 85, 89),
       (7, '20210908007', '黄蓉儿', 79, 86, 90),
       (8, '20210908008', '刘小雪', 71, 90, 91),
       (9, '20210908009', '夏金章', 89, 91, 96),
       (10, '20210908010', '杨洋', 83, 65, 90);

# （5）修改id为4的这条数据的语文成绩为88，删除id为10的这条数据内容；
update student set chinese = 88 where id = 4;
delete from student where id = 10;

### 题目5
# 可以自己去任意购物网站上找对应商品
# 任务1: 根据商品参数创建一张表
create table cosmetics(
    id int primary key auto_increment,
    name varchar(100) not null comment '商品名称',
    brand varchar(50) comment '品牌',
    category varchar(50) comment '分类',
    price decimal(10,2) comment '价格',
    stock int default 0 comment '库存',
    score decimal(3,1) NULL comment '评分',
    is_self varchar(10) comment '是否自营',
    description varchar(255) comment '描述'
);

# 任务2: 插入同类型商品至少10条数据
-- 插入数据
insert into cosmetics
(name, brand, category, price, stock, score, is_self, description)
VALUES
('小黑瓶精华肌底液 50ml', '兰蔻', '精华', 1080.00, 120, 4.8, '自营', '修护维稳，提升肌肤光泽'),
('小棕瓶修护精华 50ml', '雅诗兰黛', '精华', 950.00, 90, 4.7, '自营', '夜间修护，改善细纹'),
('神仙水护肤精华露 230ml', 'SK-II', '爽肤水', 1540.00, 60, 4.6, '自营', '调节水油平衡，提升透亮感'),
('红腰子精华 50ml', '资生堂', '精华', 860.00, 75, 4.7, '自营', '增强肌肤抵御力，维稳修护'),
('紫熨斗眼霜 30ml', '欧莱雅', '眼霜', 329.00, 200, 4.4, '自营', '淡化细纹，滋润眼周'),
('小白瓶精华 30ml', '玉兰油', '精华', 249.00, 180, 4.3, '自营', '提亮肤色，改善暗沉'),
('红宝石面霜 50g', '珀莱雅', '面霜', 289.00, 150, 4.5, '自营', '紧致抗皱，滋润保湿'),
('特护霜 50g', '薇诺娜', '面霜', 268.00, 160, 4.6, '自营', '舒缓修护，适合敏感肌'),
('空气散粉 8.5g', '花西子', '彩妆', 169.00, 220, 4.2, '非自营', '定妆控油，轻薄透气'),
('名片唇釉 2g', '完美日记', '彩妆', 79.00, 300, 4.1, '非自营', '显色滋润，日常通勤'),
('空气唇釉 1.7g', '珂拉琪', '彩妆', 69.00, 280, 4.0, '非自营', '丝绒哑光，轻盈不拔干'),
('小金瓶防晒霜 60ml', '安热沙', '防晒', 238.00, 140, 4.6, '自营', '高倍防晒，防水防汗'),
('B5多效修复霜 40ml', '理肤泉', '面霜', 168.00, 110, 4.5, '自营', '修护屏障，舒缓泛红'),
('高保湿面霜 50ml', '科颜氏', '面霜', 315.00, 95, 4.6, '自营', '长效保湿，缓解干燥'),
('精华面霜 30ml', '海蓝之谜', '面霜', 1680.00, 40, 4.7, '自营', '滋润修护，改善干燥粗糙'),
('清透防晒乳 50ml', '蜜丝婷', '防晒', 89.00, 260, 4.2, '非自营', '清爽不油腻，日常防晒');

select * from cosmetics;
