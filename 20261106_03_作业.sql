# MySQL数据库
# 实操题1
## 数据准备
# -- 创建数据库
create database db_hw3;
use db_hw3;
# -- 创建user表
create table USER
(
    id   INT primary key auto_increment, -- 用户id
    NAME VARCHAR(20),                    -- 用户姓名
    age  INT                             -- 用户年龄
);
# -- 添加数据
insert into USER
values (1, '张三', 23);
insert into USER
values (2, '李四', 24);
insert into USER
values (3, '王五', 25);
insert into USER
values (4, '赵六', 26);
# -- 订单表
create table orderlist
(
    id     INT primary key auto_increment, -- 订单id
    number VARCHAR(30),                    -- 订单编号
    uid    INT,                            -- 外键字段
    constraint ou_fk1 foreign key (uid) references USER (id)
);
# -- 添加数据
insert into orderlist
values (1, 'hm001', 1);
insert into orderlist
values (2, 'hm002', 1);
insert into orderlist
values (3, 'hm003', 2);
insert into orderlist
values (4, 'hm004', 2);
insert into orderlist
values (5, 'hm005', 3);
insert into orderlist
values (6, 'hm006', 3);
insert into orderlist
values (7, 'hm007', null);
# -- 商品分类表
create table category
(
    id   INT primary key auto_increment, -- 商品分类id
    NAME VARCHAR(10)                     -- 商品分类名称
);
# -- 添加数据
insert into category
values (1, '手机数码');
insert into category
values (2, '电脑办公');
insert into category
values (3, '烟酒茶糖');
insert into category
values (4, '鞋靴箱包');
# -- 商品表
create table product
(
    id   INT primary key auto_increment, -- 商品id
    NAME VARCHAR(30),                    -- 商品名称
    cid  INT,                            -- 外键字段
    constraint cp_fk1 foreign key (cid) references category (id)
);
# -- 添加数据
insert into product
values (1, '华为手机', 1);
insert into product
values (2, '小米手机', 1);
insert into product
values (3, '联想电脑', 2);
insert into product
values (4, '苹果电脑', 2);
insert into product
values (5, '中华香烟', 3);
insert into product
values (6, '玉溪香烟', 3);
insert into product
values (7, '计生用品', null);
# -- 中间表
create table us_pro
(
    upid INT primary key auto_increment, -- 中间表id
    uid  INT,                            -- 外键字段。需要和用户表的主键产生关联
    pid  INT,                            -- 外键字段。需要和商品表的主键产生关联
    constraint up_fk1 foreign key (uid) references USER (id),
    constraint up_fk2 foreign key (pid) references product (id)
);
# -- 添加数据
insert into us_pro
values (null, 1, 1);
insert into us_pro
values (null, 1, 2);
insert into us_pro
values (null, 1, 3);
insert into us_pro
values (null, 1, 4);
insert into us_pro
values (null, 1, 5);
insert into us_pro
values (null, 1, 6);
insert into us_pro
values (null, 1, 7);
insert into us_pro
values (null, 2, 1);
insert into us_pro
values (null, 2, 2);
insert into us_pro
values (null, 2, 3);
insert into us_pro
values (null, 2, 4);
insert into us_pro
values (null, 2, 5);
insert into us_pro
values (null, 2, 6);
insert into us_pro
values (null, 2, 7);
insert into us_pro
values (null, 3, 1);
insert into us_pro
values (null, 3, 2);
insert into us_pro
values (null, 3, 3);
insert into us_pro
values (null, 3, 4);
insert into us_pro
values (null, 3, 5);
insert into us_pro
values (null, 3, 6);
insert into us_pro
values (null, 3, 7);
insert into us_pro
values (null, 4, 1);
insert into us_pro
values (null, 4, 2);
insert into us_pro
values (null, 4, 3);
insert into us_pro
values (null, 4, 4);
insert into us_pro
values (null, 4, 5);
insert into us_pro
values (null, 4, 6);
insert into us_pro
values (null, 4, 7);

## 练习题目1
-- 1.查询用户的编号、姓名、年龄,订单编号,注意:查询有订单的用户
select u.id     用户编号,
       u.name   姓名,
       u.age    年龄,
       o.number 订单编号
from USER as u
         join orderlist as o on u.id = o.uid;

-- 2.用户的编号、姓名、年龄,订单编号.注意: 查询所有的用户包括没有订单的
select u.id     用户编号,
       u.name   姓名,
       u.age    年龄,
       o.number 订单编号
from USER as u
         left join orderlist as o on u.id = o.uid;

-- 3.查询所有的订单。用户的编号、姓名、年龄。订单编号
select o.number as 订单编号,
       U.id     as 用户编号,
       U.NAME   as 姓名,
       U.age    as 年龄
from orderlist as o
         join USER U on U.id = o.uid;

-- 4.查询用户年龄大于23岁的信息。显示用户的编号、姓名、年龄。订单编号
select o.number as 订单编号,
       U.id     as 用户编号,
       U.NAME   as 姓名,
       U.age    as 年龄
from orderlist as o
         join USER U on U.id = o.uid
where U.age > 23;

-- 5.查询张三和李四用户的信息。显示用户的编号、姓名、年龄。订单编号
select o.number as 订单编号,
       U.id     as 用户编号,
       U.NAME   as 姓名,
       U.age    as 年龄
from orderlist as o
         join USER U on U.id = o.uid
where U.NAME in ('张三', '李四');

## 练习题目2
-- 6.查询商品分类的编号、分类名称。分类下的商品名称
select cid    as 商品分类编号,
       c.NAME as 分类名称,
       p.NAME as 商品名称
from product as p
         join category as c on c.id = p.cid;

-- 7.查询所有的商品分类。商品分类的编号、分类名称。分类下的商品名称
select c.id   as 商品分类编号,
       c.NAME as 分类名称,
       p.NAME as 商品名称
from product as p
         right join category as c on p.cid = c.id;

-- 8.查询所有的商品信息。商品分类的编号、分类名称。分类下的商品名称
select p.NAME as 商品名称,
       c.id   as 商品分类编号,
       c.NAME as 分类名称
from product as p
         left join category as c on p.cid = c.id;

-- 9.查询所有的用户和该用户能查看的所有的商品。
-- 显示用户的编号、姓名、年龄。商品名称
select U.id   as 用户编号,
       U.NAME as 姓名,
       U.age  as 年龄,
       p.NAME as 商品名称
from USER as U
         join us_pro up on U.id = up.uid
         join product p on p.id = up.pid;

-- 10.查询张三和李四这两个用户可以看到的商品。
-- 显示用户的编号、姓名、年龄。商品名称
select U.id   as 用户编号,
       U.NAME as 姓名,
       U.age  as 年龄,
       p.NAME as 商品名称
from USER as U
         join us_pro up on U.id = up.uid
         join product p on p.id = up.pid
where U.NAME in ('张三', '李四');

# 实操题2
## 数据准备
# -- 部门表
create table dept
(
    deptno int primary key, -- 部门编号  主键：唯一，非空
    dname  varchar(14),     -- 部门名称
    loc    varchar(13)      -- 部门地址
);

insert into dept
values (10, 'accounting', 'new york');
insert into dept
values (20, 'research', 'dallas');
insert into dept
values (30, 'sales', 'chicago');
insert into dept
values (40, 'operations', 'boston');
# -- 员工表
create table emp
(
    empno    int primary key, -- 员工编号
    ename    varchar(10),     -- 员工姓名
    job      varchar(9),      -- 员工工作
    mgr      int,             -- 员工直属领导编号
    hiredate date,            -- 入职时间
    sal      double,          -- 工资
    comm     double,          -- 奖金
    deptno   int              -- 所在部门
);
insert into emp
values (7369, 'smith', '职员', 7566, '1980-12-17', 800, null, 20);
insert into emp
values (7499, 'allen', '销售员', 7698, '1981-02-20', 1600, 300, 30);
insert into emp
values (7521, 'ward', '销售员', 7698, '1981-02-22', 1250, 500, 30);
insert into emp
values (7566, 'jones', '经理', 7839, '1981-04-02', 2975, null, 20);
insert into emp
values (7654, 'martin', '销售员', 7698, '1981-09-28', 1250, 1400, 30);
insert into emp
values (7698, 'blake', '经理', 7839, '1981-05-01', 2850, null, 30);
insert into emp
values (7782, 'clark', '经理', 7839, '1981-06-09', 2450, null, 10);
insert into emp
values (7788, 'scott', '职员', 7566, '1987-07-03', 3000, 2000, 20);
insert into emp
values (7839, 'king', '董事长', null, '1981-11-17', 5000, null, 10);
insert into emp
values (7844, 'turners', '销售员', 7698, '1981-09-08', 1500, 50, 30);
insert into emp
values (7876, 'adams', '职员', 7566, '1987-07-13', 1100, null, 20);
insert into emp
values (7900, 'james', '职员', 7698, '1981-12-03', 1250, null, 30);
insert into emp
values (7902, 'ford', '销售员', 7566, '1981-12-03', 3000, null, 20);
insert into emp
values (7934, 'miller', '职员', 7782, '1981-01-23', 1300, null, 10);
# -- 工资等级表
create table salgrade
(
    grade int,-- 等级
    losal double, -- 最低工资
    hisal double
); -- 最高工资
insert into salgrade
values (1, 500, 1000);
insert into salgrade
values (2, 1001, 1500);
insert into salgrade
values (3, 1501, 2000);
insert into salgrade
values (4, 2001, 3000);
insert into salgrade
values (5, 3001, 9999);


## 练习题目
-- 注意：员工如果没有特殊指明，指的就是所有人。
-- 1、返回部门号及其本部门的最低工资。
select deptno,
       min(sal)
from emp
group by deptno;

-- 2、计算出员工的年薪，并且以年薪降序排序。
select *, emp.sal * 12 + coalesce(comm, 0) as 年薪
from emp
order by emp.sal * 12 + coalesce(comm, 0) desc;

-- 3、返回所有员工各个job工作的最低工资。
select job,
       min(sal) as 最低工资
from emp
group by job;
-- 4、查找和scott从事相同工作的员工信息
select *
from emp
where job = (select job
             from emp
             where ename = 'scott');

-- 5、工资水平多于james的员工信息。
select *
from emp
where sal > (select sal
             from emp
             where ename = 'james');

-- 6、返回工资大于平均工资的员工信息。
select *
from emp
where sal > (select avg(sal)
             from emp);

-- 7、返回销售部(sales)所有员工的姓名。
select *
from emp
where emp.deptno = (select deptno
                    from dept
                    where dname = 'sales');

-- 8、返回工资高于30部门所有员工工资水平的员工信息。
select *
from emp
where emp.sal > (select max(sal)
                 from emp
                 where deptno = 30);

-- 9、返回查找最高工资和最低工资的职员信息

with temp1 as (select *
               from emp
               where job = '职员')
select *
from temp1
where sal = (select max(sal) from temp1)
   or sal = (select min(sal) from temp1);

-- 10、返回拥有员工的部门名、部门号。
select distinct d.deptno as 部门号,
                d.dname  as 部门名
from emp
         join dept d on emp.deptno = d.deptno
order by 部门号;

-- 11、返回员工的姓名、所在部门名及其工资。
select ename   as 员工姓名,
       d.dname as 所在部门名,
       sal     as 工资
from emp
         join dept d on emp.deptno = d.deptno;

-- 12、返回从事职员工作的员工姓名和所在部门名称。
select ename   as 员工姓名,
       d.dname as 所在部门名称
from emp
         join dept d on emp.deptno = d.deptno
where job = '职员';

-- 13、返回部门号、部门名、部门所在位置及其每个部门的员工总数。
with temp1 as (select deptno,
                      count(*) as count
               from emp
               group by deptno)
select dept.deptno        as 部门号,
       dname              as 部门名,
       coalesce(count, 0) as 每个部门的员工总数,
       loc                as 部门所在位置
from dept
         left join temp1 on dept.deptno = temp1.deptno;

-- 14、返回所有员工(职员或者销售员)和所属经理的姓名。
select e.job   as job,
       e.ename as ename,
       m.ename as 所属经理姓名,
       e.empno as empno,
       e.mgr   as mgr
from emp as e
         join emp as m on e.mgr = m.empno
where e.job in ('职员', '销售员');

-- 15、查询所有员工姓名、职位、薪水、薪资等级
select e.ename as 员工姓名,
       e.job   as 职位,
       e.sal   as 薪水,
       s.grade as 薪资等级
from emp as e
         join salgrade as s
where e.sal between s.losal and s.hisal;