# numpy_pandas_matplotlib
## 一、简答题（共5题）
### 1. 简述Python数据分析“三剑客”分别是什么，以及各自的核心功能。
"""
NumPy是数值计算基础库，提供高性能的多维数组对象ndarray，用于快速高效的数组运算、数学函数、线性代数运算、傅里叶变换以及随机数生成。
Pandas是数据处理和分析库，基于NumPy构建，提供Series一维带标签数组和DataFrame二维表格型数据结构，用于数据清洗、整理、转换、分析和建模。
Matplotlib是数据可视化库，提供丰富的绘图功能，支持折线图、散点图、柱状图、饼图等图表类型，高度可定制，支持多种输出格式如PNG、PDF、SVG等。
"""

### 2. NumPy的数据结构是什么？以及它的应用场景？
"""
NumPy的核心数据结构是ndarray，即多维数组对象。
ndarray的主要特点是快速高效、支持元素级计算和数学运算、内存占用少、计算效率高，比纯Python代码快10到100倍。
NumPy的应用场景包括数值计算和科学计算、线性代数运算如矩阵乘法和转置、傅里叶变换、随机数生成。同时NumPy作为Pandas和Matplotlib的底层数据支撑，也广泛应用于图像处理和信号处理领域。
"""

### 3. Pandas中的Series和DataFrame有什么区别？
"""
Series和DataFrame是Pandas中的两种核心数据结构，它们的区别主要体现在以下几个方面：
从维度上看，Series是一维数据结构，而DataFrame是二维表格型数据结构。
从组成上看，Series由一组索引和一组值构成，而DataFrame由多个Series作为列集合而成。
从形状上看，Series的形状是n行1列，而DataFrame的形状是n行m列。
从类比对象来看，Series类似于带标签的数组或Excel工作表中的一列，而DataFrame类似于整个Excel工作表或SQL数据表。
从创建方式来看，Series可以通过pd.Series()传入列表或字典创建，DataFrame可以通过pd.DataFrame()传入字典或列表嵌套列表创建。
从应用场景来看，Series适合处理一维带标签数据，DataFrame适合处理表格型结构化数据。
"""

### 4. 在Matplotlib中，常见的图表类型有哪些？

### 5. 请说明NumPy、Pandas和Matplotlib三者之间的依赖关系。

# ## 二、单选题（共10题）
# 1. 下列哪个库是Python数据分析中最基础的数值计算库？
# A. Pandas
# B. Matplotlib
# C. NumPy
# D. SciPy
# C

# 2. 在NumPy中，用于生成全0数组的函数是？
# A. np.ones()
# B. np.zeros()
# C. np.empty()
# D. np.full()
# B

# 3. 下列哪个Pandas数据结构是带标签的一维数组？
# A. DataFrame
# B. Series
# C. Array
# D. List
# B

# 4. 在Matplotlib中，用于显示图表的函数是？
# A. plt.plot()
# B. plt.show()
# C. plt.display()
# D. plt.figure()
# B

# 5. 下列哪个函数用于查看DataFrame的基本统计信息？
# A. df.info()
# B. df.sum()
# C. df.describe()
# D. df.shape()
# C

# 6. 在NumPy中，arr.shape的含义是？
# A. 数组的维度数
# B. 数组的元素总数
# C. 数组的形状（行数，列数）
# D. 数组的数据类型
# C

# 7. Pandas中用于删除缺失值的函数是？
# A. dropna()
# B. fillna()
# C. remove()
# D. delete()
# A

# 8. 下列哪个Matplotlib图形最适合展示两个连续变量之间的关系？
# A. 柱状图
# B. 饼图
# C. 折线图
# D. 散点图
#

# 9. 在NumPy中，np.random.randn(3,3)生成的是？
# A. 均匀分布随机数
# B. 标准正态分布随机数
# C. 全0数组
# D. 全1数组
# B

# 10. 下列哪个Pandas方法用于按某列的值进行排序？
# A. df.sort_index()
# B. df.sort_values()
# C. df.order_by()
# D. df.groupby()
# B

# ## 三、多选题（共15题）
# 1. 下列哪些是NumPy的特点？
# A. 高效的数组运算
# B. 支持广播功能
# C. 提供DataFrame结构
# D. 核心代码用C语言实现
# ABD

# 2. 下列哪些是Pandas的核心数据结构？
#   A. Series
#   B. DataFrame
#   C. ndarray
#   D. List
# AB

# 3. 下列哪些是Matplotlib支持的图表类型？
# A. 折线图
# B. 散点图
# C. 柱状图
# D. 饼图
#

# 4. 下列哪些方法可以创建NumPy数组？
# A. np.array()
# B. np.arange()
# C. np.linspace()
# D. pd.Series()
# ABC

# 5. 下列哪些是Pandas中查看数据的方法？
# A. head()
# B. tail()
# C. describe()
# D. plot()
# ABC

# 6. 下列哪些是缺失值处理方法？
# A. dropna()
# B. fillna()
# C. isnull()
# D. sum()
# ABC

# 7. 下列哪些是Matplotlib中常用的绘图函数？
# A. plot()
# B. scatter()
# C. bar()
# D. hist()
#

# 8. 下列哪些是NumPy中常用的统计函数？
# A. np.mean()
# B. np.std()
# C. np.sum()
# D. np.rename()
# ABC

# 9. 下列哪些是Pandas中数据选择的方法？
# A. loc
# B. iloc
# C. ix
# D. query
# ABD

# 10. 下列哪些是Pandas中数据分组聚合的方法？
# A. groupby()
# B. pivot_table()
# C. agg()
# D. merge()
# ABC

# 11. 下列哪些是Matplotlib中用于设置图表元素的函数？
# A. title()
# B. xlabel()
# C. legend()
# D. show()
#

# 12. 下列哪些是NumPy中用于改变数组形状的方法？
# A. reshape()
# B. flatten()
# C. T
# D. append()
# ABC

# 13. 下列哪些是Pandas中数据透视表的功能？
# A. 聚合
# B. 分组
# C. 重塑
# D. 排序
# ABC

# 14. 下列哪些是Matplotlib中解决中文乱码的方法？
# A. 设置字体为SimHei
# B. 设置axes.unicode_minus为False
# C. 安装中文字体包
# D. 使用英文标签
#

# 15. 下列哪些是python数据分析三剑客的典型工作流程？
# A. NumPy生成数据
# B. Pandas进行数据处理
# C. Matplotlib进行可视化
# D. SQL进行数据存储
# ABC

# ## 四、编程题（共2题）
# ### 编程题1：使用NumPy和Pandas完成以下操作
# 已知某公司员工数据如下：
# ```python
# data = {
#     '姓名': ['张三', '李四', '王五', '赵六', '钱七'],
#     '部门': ['技术部', '销售部', '技术部', '人事部', '销售部'],
#     '工资': [5000, 7000, 6000, 5500, 7500]
# }
# ```
# **要求：**
# 1. 使用Pandas创建DataFrame。
# 2. 计算每个部门的平均工资。
# 3. 使用Matplotlib绘制部门平均工资的柱状图。
import pandas as pd
data = {
    '姓名': ['张三', '李四', '王五', '赵六', '钱七'],
    '部门': ['技术部', '销售部', '技术部', '人事部', '销售部'],
    '工资': [5000, 7000, 6000, 5500, 7500]
}
# 使用Pandas创建DataFrame。
df = pd.DataFrame(data)
print(df)
"""
   姓名   部门    工资
0  张三  技术部  5000
1  李四  销售部  7000
2  王五  技术部  6000
3  赵六  人事部  5500
4  钱七  销售部  7500
"""
# 计算每个部门的平均工资


# ### 编程题2：基于全球GDP数据分析（综合案例）
# 基于上课的CSV文件（1960-2019全球GDP数据.csv）完成以下需求
# **要求：**
# 1. 读取数据（可模拟或从真实数据中提取）。
# 2. 筛选出中国、美国、日本三国的GDP数据。
# 3. 绘制三国的GDP折线图。
# **模拟数据参考答案：**
