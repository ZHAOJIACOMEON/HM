## 简答题
### 题目1
# 请说一说数据库语言有哪几个分类，并阐述下该分类下常用的SQL关键字。
# - 4个分类语言: （关系型数据库、非关系型数据库）
# - SQL关键字:
# 数据库语言可分为四类:
# 	DDL:数据定义语言,主要用于定义数据库、数据表等,关键字:create、alter、drop等;
# 	DML:数据操作语言,主要用于操作数据表字段的命令,关键字:insert、update、delete等;
# 	DQL:数据查询语言,主要用于查询数据操作,关键字:select、from、where等;
# 	DCL:数据控制语言,用来定义数据库的访问权限和安全级别，及创建用户,咱们不常用.

### 题目2
# 请简单介绍下约束的作用以及常见的约束
# - 约束作用
# - 约束分类
# 约束作用:约束实际上就是表中数据的限制条件
# 常见的约束有：
#     主键约束:(primary key)  特点: 修饰的字段值非空唯一
#     非空约束:(not null)  特点: 修饰的字段值不能为空
#     唯一约束:(unique)	 特点: 修饰的字段值不能重复
#     默认约束:(default)	 特点: 修饰的字段值可以设置默认值
#     外键约束:(foreign key) 特点: 约束多表中数据的一致性和完整性

### 题目3
# 数据表中<null>是什么意思？请说说你的理解。
# - <null>的含义
# - is null
# - is not null
# 1:<null>是在数据库中表示空值,一般用于SQL的非空约束,即not null;
# 2:<null>(空)这个值表示unknown(未知)：它不表示""(空字符串)。不能把任何值与一个 unknown值进行比较，因为他们都会生产一个null值，而必须使用IS null操作符来进行比较。

### 题目4
# 请简述where和having的区别
# 书写顺序: where在group by 前,having在group by 之后
# 执行顺序: where在分组前过滤,having在分组之后过滤数据
# 条件类型: where只能跟非聚合条件,having可以跟聚合条件,也可以跟非聚合条件(效率低)
# 聚合函数: where条件不能使用聚合函数,having条件可以使用聚合函数

## 实操题
### 题目1
# 数据准备
create table student
(
    id      int primary key auto_increment not null,
    stuno   varchar(20),
    name    varchar(20),
    chinese double,
    english double,
    math    double
);

insert into student(id, stuno, name, chinese, english, math)
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

# 按照下列要求编写sql语句：
# （1）查询表中所有学生的信息；
select *
from student;

# （2）查询表中所有学生的姓名和对应的英语成绩；
select name    as 学生姓名,
       english as 英语成绩
from student;

# （3）过滤数据表中，语文成绩值的重复数据；
select distinct chinese
from student;

# （4）统计每个学生的总分；
select *,
       chinese + english + math as 总分
from student;

# （5）在所有学生总分数上加10分特长分；
select *,
       chinese + english + math + 10 as '总分+特长分'
from student;

# （6）查询英语成绩大于90分的同学；
select *
from student
where english > 90;

# （7）查询总分大于200分的所有同学；
select *,
       chinese + english + math as '总分'
from student
where chinese + english + math > 200;

# （8）查询英语分数在 80－90之间的同学；
select *
from student
where english between 80 and 90;

# （9）查询英语分数不在 80－90之间的同学；
select *
from student
where english not between 80 and 90;

# （10）查询数学分数为89,90,91的同学；
select *
from student
where math in (89, 90, 91);

# （11）查询所有姓李的学生英语成绩；
select name,
       english
from student
where name like ('李%');

# （12）查询数学分80并且语文分80的同学；
select *
from student
where math = 80
  and chinese = 80;

# （13）查询英语80或者总分200的同学。
select *
from student
where english = 80
   or (chinese + english + math) = 200;

### 题目2
#### 数据准备
# >创建数据库
create database db_hw2;
use db_hw2;

# 已知以下建表语句
create table students
(
    studentNo int primary key auto_increment,
    name      varchar(100),
    sex       varchar(100),
    hometown  varchar(100),
    age       int,
    class_id  int,
    card      varchar(100)
);
# 要求建表后,编写一条sql语句插入一次性插入以下所有数据
# ('王昭君', '女', '北京', 20, 1, '340322199001247654')
# ('诸葛亮', '男', '上海', 18, 2, '340322199002242354')
# ('张飞', '男', '南京', 24, 3, '340322199003247654')
# ('白起', '男', '安徽', 22, 4, '340322199005247654')
# ('大乔', '女', '天津', 19, 3, '340322199004247654')
# ('孙尚香', '女', '河北', 18, 1, '340322199006247654')
# ('百里玄策', '男', '山西', 20, 2, '340322199007247654')
# ('小乔', '女', '河南', 15, 3, null)
# ('百里守约', '男', '湖南', 21, 1, '')
# ('妲己', '女', '广东', 26, 2, '340322199607247654')
# ('李白', '男', '北京', 30, 4, '340322199005267754')
# ('孙膑', '男', '新疆', 26, 3, '340322199000297655')
insert into students(name, sex, hometown, age, class_id, card)
values ('王昭君', '女', '北京', 20, 1, '340322199001247654'),
       ('诸葛亮', '男', '上海', 18, 2, '340322199002242354'),
       ('张飞', '男', '南京', 24, 3, '340322199003247654'),
       ('白起', '男', '安徽', 22, 4, '340322199005247654'),
       ('大乔', '女', '天津', 19, 3, '340322199004247654'),
       ('孙尚香', '女', '河北', 18, 1, '340322199006247654'),
       ('百里玄策', '男', '山西', 20, 2, '340322199007247654'),
       ('小乔', '女', '河南', 15, 3, null),
       ('百里守约', '男', '湖南', 21, 1, ''),
       ('妲己', '女', '广东', 26, 2, '340322199607247654'),
       ('李白', '男', '北京', 30, 4, '340322199005267754'),
       ('孙膑', '男', '新疆', 26, 3, '340322199000297655')

#### 练习题目
# 1. 查询学生"百里守约"的基本信息
select *
from students
where name = '百里守约';

# 2. 查询学生"百里守约"或”百里玄策”的基本信息
select *
from students
where name = '百里守约'
   or name = '百里玄策';

# 3. 查询姓"张"学生的姓名，年龄，班级
select name,
       age,
       class_id
from students
where name like ('张%');

# 4. 查询姓名中含有"约"字的学生的基本信息
select *
from students
where name like ('%约%');

# 5. 查询姓名长度为三个字，姓“孙”的学生的学号，姓名，年龄，班级，身份证号
select name,
       age,
       class_id,
       card
from students
where name like ('孙__')
# 6. 查询姓"百"或者姓”孙”的学生的基本信息
select *
from students
where name like ('百%')
   or name like ('孙%');

# 7. 查询姓"百"并且家乡是"山西"的学生信息
select *
from students
where name like ('百%')
  and hometown = '山西';

# 8. 查询家乡是"北京"、"新疆"、"山东"、"上海"的学生的信息
select *
from students
where hometown in ('北京', '新疆', '山东', '上海');

# 9. 查询姓"孙"，但是家乡不是"河北"的学生信息
select *
from students
where name like ('孙%')
  and hometown not in ('河北');

# 10. 查询家乡不是"北京"、"新疆"、"山东"、"上海"的学生的信息
select *
from students
where hometown not in ('北京', '新疆', '山东', '上海');

# 11. 查询全部学生信息，并按照“性别”排序
select *
from students
order by sex;

# 12. 查询所有男生，并按年龄升序排序
select *
from students
where sex = '男'
order by age;

# 13. 统计共有多少个学生
select count(*)
from students;

# 14. 统计年龄大于20岁的学生有多少个
select count(*)
from students
where age > 20;

# 15. 统计男生的平均年龄
select avg(age)
from students
where sex = '男';

# 16. 查询1班学生中的最大年龄是多少
select max(age)
from students
where class_id = 1;

# 17. 统计2班男女生各有多少人
select class_id, sex, count(*)
from students
where class_id = 2
group by sex;

# 18. 查询年龄最小的学生的全部信息
select *
from students
where age = (select min(age)
             from students);

### 题目3
# 已知员工表和数据如下,创建表并导入数据完成对应需求
# 创建数据库
create database db_hw2;
use db_hw2;
# 创建表
create table emp
(
    empno    INT,
    ename    VARCHAR(50),
    job      VARCHAR(50),
    mgr      INT, -- 上级领导编号
    hiredate DATE,-- 入职日期
    sal      INT,
    comm     INT, -- 奖金
    deptno   INT  --  部门编号
);
# 插入数据
insert into emp
values (7369, 'SMITH', 'CLERK', 7902, '1980-12-17', 800, null, 20),
       (7499, 'ALLEN', 'SALESMAN', 7698, '1981-02-20', 1600, 300, 30),
       (7521, 'WARD', 'SALESMAN', 7698, '1981-02-22', 1250, 500, 30),
       (7566, 'JONES', 'MANAGER', 7839, '1981-04-02', 2975, null, 20),
       (7654, 'MARTIN', 'SALESMAN', 7698, '1981-09-28', 1250, 1400, 30),
       (7698, 'BLAKE', 'MANAGER', 7839, '1981-05-01', 2850, null, 30),
       (7782, 'CLARK', 'MANAGER', 7839, '1981-06-09', 2450, null, 10),
       (7788, 'SCOTT', 'ANALYST', 7566, '1987-04-19', 3000, null, 20),
       (7839, 'KING', 'PRESIDENT', null, '1981-11-17', 5000, null, 10),
       (7844, 'TURNER', 'SALESMAN', 7698, '1981-09-08', 1500, 0, 30),
       (7876, 'ADAMS', 'CLERK', 7788, '1987-05-23', 1100, null, 20),
       (7900, 'JAMES', 'CLERK', 7698, '1981-12-03', 950, null, 30),
       (7902, 'FORD', 'ANALYST', 7566, '1981-12-03', 3000, null, 20),
       (7934, 'MILLER', 'CLERK', 7782, '1982-01-23', 1300, null, 10);

# -- 1、按员工编号升序排列不在10号部门工作的员工信息
select *
from emp
where deptno != 10
order by deptno;

# -- 2、查询姓名第二个字母不是”A”且薪水大于800元的员工信息，按年薪降序排列
# 注意: 此处需要将空值做判空处理 IFNULL(EXP1,EXP2) , exp1不为空就是 exp1，否则是exp2
select *
from emp
where ename not like ('_A%')
  and sal > 800
order by sal * 12 + coalesce(comm, 0) desc;

-- 3、求每个部门的平均薪水
select deptno,
       avg(sal) as 平均薪水
from emp
group by deptno
order by deptno;

-- 4、求各个部门的最高薪水
select deptno,
       max(sal) as 最高薪水
from emp
group by deptno
order by deptno;

-- 5、求每个部门每个岗位的最高薪水
select deptno,
       job,
       max(sal) as 最高薪水
from emp
group by deptno, job
order by deptno;

-- 6、求平均薪水大于2000的部门编号
with temp as (select deptno,
                     avg(sal) as 平均薪水
              from emp
              group by deptno
              order by deptno)
select *
from temp
where 平均薪水 > 2000;

-- 7、将部门平均薪水大于1500的部门编号列出来，按部门平均薪水降序排列
with temp as (select deptno,
                     avg(sal) as 平均薪水
              from emp
              group by deptno
              order by deptno)
select *
from temp
where 平均薪水 > 1500;