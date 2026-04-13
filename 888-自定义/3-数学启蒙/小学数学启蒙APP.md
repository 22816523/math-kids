\# 小学数学启蒙APP · Claude开发文档合集



\## 使用说明

本文件包含全部8个模块的完整PRD，每个模块都有独立摘要，适合分块发给Claude。

建议按顺序开发：模块1 → 模块3 → 模块4 → 模块5 → 模块2 → 模块6 → 模块7 → 模块8



\---



\# 【先发内容】项目上下文



我要开发一个iPad竖屏儿童数学启蒙APP，3-8岁，离线可用。



【全局原则】（所有模块必须遵守）：

1\. 无文字阅读压力：全图标+语音引导，不识字也能独立操作

2\. 零挫败感：答错无负面反馈，只有引导和鼓励

3\. 操作适龄：拖拽容差≥80px，按钮尺寸≥120px

4\. 离线可用：核心功能全量本地化，无需网络

5\. 激励体系：分四层（即时反馈/进度激励/成长激励/元激励）



项目共8大模块，我会依次发给你。每次只实现当前模块，不需要考虑其他模块的细节。



先确认你理解以上原则。



\---



\# 【模块1】百数板



\## 独立摘要

功能：1-100数字网格，四种学习模式

核心难点：拖拽填空的吸附逻辑、跳数高亮的计算

数据需要本地存储：用户进度、模式偏好



\## 1.1 数据模型

interface BaisuBoard {

&#x20; currentMode: 'order' | 'fill' | 'skipCount' | 'placeValue'

&#x20; skipCountDirection: 'forward' | 'backward'

&#x20; skipCountStep: 2 | 5 | 10

&#x20; highlightedNumbers: number\[]

&#x20; fillBlanks: {position: number, value: number | null}\[]

}



\## 1.2 交互逻辑



\### 模式1：数字顺序

\- 网格10×10，显示1-100

\- 点击数字：播放该数字的标准读音

\- 长按数字（>300ms）：可拖动（预留）



\### 模式2：缺数填空

\- 随机生成5-8个空缺位置

\- 空缺处显示空白格子（浅色背景+问号）

\- 底部随机顺序显示空缺数字气泡

\- 孩子拖动数字到空白格子

\- 判定规则：

&#x20; - 正确：数字吸附进格子，播放✅音效，气泡消失

&#x20; - 错误：气泡弹回原位，播放“再试试看”语音

&#x20; - 吸附容差：80px

\- 所有空缺填满后：播放庆祝动画



\### 模式3：跳数

\- 点击“2个一数”：高亮2,4,6,8...（闪烁动画）

\- 点击“5个一数”：高亮5,10,15...

\- 点击“10个一数”：高亮10,20,30...

\- 点击顺数/倒数切换：高亮方向反转



\### 模式4：数位认识

\- 点击任意数字（如37）

\- 顶部弹出数位拆分卡片：

&#x20; - 十位：3捆小棒 + 数字“3”

&#x20; - 个位：7根单根小棒 + 数字“7”



\## 1.3 激励集成

\- 正确填空：星星碎片飞出+语音鼓励

\- 完成所有填空：小动物出场庆祝



\## 1.4 测试用例

输入：空缺位置\[5, 17, 32]，数字气泡\[17, 5, 32]随机顺序

期望：无论先拖哪个，只能拖入正确位置，错误拖拽弹回



\---



\# 【模块2】加减法（核心难点）



\## 独立摘要

功能：三级难度加减法（10/20/100以内）

核心难点：进退位的可视化呈现、拆捆动画、数字同步更新

重点：20以内进位用十格阵，100以内退位用小棒拆捆



\## 2.1 数据模型

interface MathQuestion {

&#x20; type: 'addition' | 'subtraction'

&#x20; difficulty: 'level1' | 'level2' | 'level3'  // 10/20/100以内

&#x20; operands: \[number, number]

&#x20; carryNeeded?: boolean

&#x20; borrowNeeded?: boolean

&#x20; visualType: 'objects' | 'tenFrame' | 'rods' | 'abacus'

}



\## 2.2 难度可视化规则



\### 难度1（10以内）：实物化

\- 加法：3+2，左右各显示🍎，点击“合并”按钮，合并后显示5个🍎+数字5

\- 减法：5-2，显示5个🍎，点击苹果“吃掉”，剩余3个高亮+数字3



\### 难度2（20以内进位）：十格阵

\- 8+5：

&#x20; - 上方十格阵：8个红格

&#x20; - 下方十格阵：5个灰格

&#x20; - 拖动下方格子到上方：

&#x20;   - 上方满10后自动“满十进一”

&#x20;   - 上方清空，进位区出现1个十格阵（代表10）

&#x20;   - 剩余3格在下方个位区

&#x20; - 最终显示：十位1 + 个位3 = 13



\### 难度3（100以内退位）：小棒

\- 23-8：

&#x20; - 初始：2捆（每捆10根）+ 3根单根

&#x20; - 孩子尝试拿8根，但单根只有3根

&#x20; - 系统提示：长按一捆可拆开

&#x20; - 长按拆捆：1捆变10根单根（动画）

&#x20; - 现在：1捆 + 13根单根

&#x20; - 拿走8根单根，剩下1捆 + 5根 = 15

\- 数字同步更新：

&#x20; - 拆捆时：十位2→1，个位3→13

&#x20; - 拿走时：个位13→5



\## 2.3 激励集成

\- 每一步操作都有正向反馈

\- 完成拆捆：小动画庆祝“你会拆捆啦！”

\- 连续正确3题：动物伙伴出场



\## 2.4 测试用例

输入：8+5，按规则操作

期望：十格阵满十后自动进位，最终显示十位1个十格+个位3格



\---



\# 【模块3】图形与几何



\## 独立摘要

功能：平面图形+立体图形辨认、分类、生活寻找

核心难点：立体图形360度旋转、生活场景图的热区点击



\## 3.1 数据模型

interface ShapeGame {

&#x20; shapeType: '2d' | '3d'

&#x20; shapes: string\[]  // \['circle', 'square', 'triangle'] 等

&#x20; difficulty: 'basic' | 'mixed' | 'life'

}



\## 3.2 交互逻辑



\### 平面图形

\- 辨认：语音说“请找出所有的圆形”，孩子点击图形，选中的有高亮框

\- 分类：图形混在一起，拖入对应形状的“家”（正确有吸附效果）

\- 找一找：生活场景图（客厅/卧室），点击隐藏的图形（钟表是圆形、窗户是方形）



\### 立体图形

\- 球、圆柱、正方体可360度拖拽旋转

\- 点击显示真实物体照片对照（足球、易拉罐）

\- 配对游戏：立体图形拖到对应的实物照片上



\## 3.3 激励集成

\- 分类正确：图形跳进家门，门后发出音乐

\- 找到隐藏图形：图形闪烁+“你发现我啦！”



\## 3.4 测试用例

输入：圆形、正方形混在一起，指令“找圆形”

期望：点击圆形高亮，点击正方形无负面反馈，只说“再试试”



\---



\# 【模块4】常见的量



\## 独立摘要

功能：钟表（整点/半点）、人民币（1元/5元/10元/1角）、比较（长短/高矮等）

核心难点：钟表指针联动、人民币组合等价



\## 4.1 认识钟表

\- 可拨动指针：拖动分针，时针联动

\- 整点练习：显示钟面，3个时间选项（图标+数字）

\- 半点练习：强调“分针指向6，时针在两个数字中间”

\- 拨动时电子钟数字同步变化

\- 正确：钟表变笑脸+“3点整，小熊该起床啦”



\## 4.2 认识人民币

\- 虚拟钱币：1元、5元、10元、1角（可拖拽）

\- 购物场景：货架上有1元、2元、5元商品

\- 付钱练习：“需要付3元”，孩子拖入对应钱币组合

\- 反馈：

&#x20; - 钱币入收银台：清脆硬币声

&#x20; - 付多了：“钱给多了，能拿回一些吗？”

&#x20; - 付对了：“刚刚好，谢谢你！”



\## 4.3 比较类

\- 比长短：两根铅笔可拖动对齐

\- 比高矮：两个动物站立对比

\- 比轻重：天平两边放物品，点击添加

\- 全部图标化，无需数字



\---



\# 【模块5】综合与实践



\## 独立摘要

功能：分类、找规律、生活问题解决

核心难点：多维度分类（颜色/形状切换）、规律生成的随机算法



\## 5.1 分类

\- 一堆玩具（颜色不同、类型不同）

\- 可先按颜色分，再按类型分（切换分类维度）

\- 分类正确：玩具跳进对应篮子



\## 5.2 找规律

\- 颜色规律：红蓝红蓝？下一个选什么

\- 图形规律：○△□○△□？下一个选什么

\- 数字规律：2,4,6,? 选择正确数字

\- 完成时：图案按规律滚动动画



\## 5.3 生活问题解决

\- 超市购物：给10元买2样，够不够？

\- 整理书包：物品按“课本”“文具”分类归位

\- 摆餐具：家里3人，需要几个碗几双筷子？



\---



\# 【模块6】学习闭环



\## 独立摘要

功能：入门测评、每日闯关、错题记录

核心难点：难度判定算法、错题归因分析



\## 6.1 入门小测评（5题固定）

const assessmentQuestions = \[

&#x20; { type: 'count', content: '数一数有几个🍎？', options: \[3,4,5], answer: 4 },

&#x20; { type: 'compare', content: '哪边多？', left: 3🐟, right: 5🐟, answer: 'right' },

&#x20; { type: 'add', content: '2+3=?', visual: true, answer: 5 },

&#x20; { type: 'addNoCarry', content: '13+4=?', visual: true, answer: 17 },

&#x20; { type: 'addTen', content: '30+20=?', visual: false, answer: 50 }

]



function determineDifficulty(correctCount: number, lastCorrect: boolean): 'easy'|'medium'|'hard' {

&#x20; if (correctCount <= 3) return 'easy'        // 10以内

&#x20; if (correctCount === 4 \&\& !lastCorrect) return 'medium'  // 20以内

&#x20; if (correctCount === 5) return 'hard'       // 100以内

&#x20; return 'medium'

}



\## 6.2 每日闯关

\- 每天1关，每关5-8题

\- 混合题型：2计算+1图形+1钟表/人民币+1规律+1生活应用

\- 每答对一题点亮一颗星星

\- 全部完成：解锁通关动画（动物伙伴）



\## 6.3 错题记录

interface MistakeRecord {

&#x20; questionId: string

&#x20; questionType: string

&#x20; wrongAnswer: any

&#x20; correctAnswer: any

&#x20; timestamp: number

&#x20; context: { module: string, subSkill: string }

}



\---



\# 【模块7】家长中心



\## 独立摘要

功能：难度切换、学习数据、开关控制、新课标完成度

核心难点：数据可视化（雷达图/进度条）、多孩子支持（预留）



\## 7.1 数据接口

interface ParentDashboardData {

&#x20; today: {

&#x20;   duration: number  // 分钟

&#x20;   completedLevels: number

&#x20;   stars: number

&#x20; }

&#x20; mastery: {

&#x20;   numberAndOperation: number  // 数与运算

&#x20;   measurement: number         // 常见的量

&#x20;   geometry: number            // 图形与几何

&#x20;   comprehensive: number       // 综合与实践

&#x20; }

&#x20; skillMastery: {

&#x20;   count1to100: number

&#x20;   compare: number

&#x20;   addWithin10: number

&#x20;   // ...

&#x20; }

&#x20; weeklyActivity: number\[]

&#x20; topMistakes: {skill: string, count: number}\[]

}



\## 7.2 功能列表

\- 难度切换：10/20/100以内滑动开关

\- 今日数据：学习时长、完成关卡、星星数

\- 掌握情况：四大领域进度条（点击展开）

\- 设置：声音开关、时长限制（5/10/15/20分钟）

\- 新课标完成度展示：已覆盖知识点清单



\---



\# 【模块8】激励体系（完整版）



\## 独立摘要

功能：四层激励（即时/进度/成长/元激励）

核心难点：反馈随机算法、花园成长逻辑、动物伙伴收集



\## 8.1 核心理念

// 三大原则

1\. 无惩罚：永远不扣星星、不降级、不出现“答错”提示

2\. 有惊喜：正确后的反馈要像“挖到宝藏”，不可预测但值得期待

3\. 重过程：鼓励尝试本身，而不仅是正确结果



\## 8.2 即时反馈（每次操作）



\### 正确操作反馈

const correctResponses = \[

&#x20; { visual: '✨星星闪', audio: '你真棒！', haptic: '轻震动' },

&#x20; { visual: '🌈彩虹光', audio: '太好啦！', haptic: '轻震动' },

&#x20; { visual: '🦊小狐狸跳', audio: '哇哦！', haptic: '轻震动' },

&#x20; { visual: '🌸花瓣飘', audio: '厉害！', haptic: '轻震动' }

]



// 规则：每次正确随机选，连续正确3次必出动物动画



\### 尝试反馈（答错时）

const encourageResponses = \[

&#x20; { visual: '🤔思考泡泡', audio: '我们再看看？' },

&#x20; { visual: '🔄轻轻晃动', audio: '差不多啦，再试一次\~' },

&#x20; { visual: '👆闪烁提示', audio: '要不要从这里想想？' }

]



// 规则：第一次错→思考泡泡，第二次错→闪烁区域，第三次错→具体引导



\## 8.3 进度激励（每日闯关）



\### 星星收集器

interface StarCollector {

&#x20; totalStars: number      // 今日可获得总数

&#x20; collectedStars: number  // 已获得

&#x20; specialStar?: {         // 隐藏星星

&#x20;   condition: string     // 如“连续答对3题”

&#x20;   collected: boolean

&#x20; }

}



\### 通关动画（可收集的伙伴）

const animalFriends = \[

&#x20; { id: 'fox', name: '小狐狸', unlocked: false, animation: 'fox\_dance.lottie' },

&#x20; { id: 'rabbit', name: '小兔子', unlocked: false, animation: 'rabbit\_jump.lottie' },

&#x20; { id: 'bear', name: '小熊', unlocked: false, animation: 'bear\_honey.lottie' },

&#x20; // 共12个

]



// 规则：每天通关解锁一个新伙伴



\## 8.4 成长激励（魔法花园）

interface MagicGarden {

&#x20; plants: {

&#x20;   numberPlant: { stage: 1-5, bloomed: boolean }      // 数与运算

&#x20;   measureTree: { stage: 1-5, fruits: number }        // 常见的量

&#x20;   shapeFlower: { stage: 1-5, petals: number }        // 图形

&#x20;   lifePath: { stage: 1-5, decorations: string\[] }    // 综合实践

&#x20; }

}



// 成长规则：每掌握一个知识点，对应植物生长一级



\## 8.5 元激励（明日预告）

interface TomorrowPreview {

&#x20; message: string  // “猜猜明天谁来陪你玩？”

&#x20; silhouette: string  // 下一个动物伙伴的剪影

&#x20; hint: string  // “它喜欢吃胡萝卜哦”

}



\## 8.6 反馈选择算法

function selectFeedback(

&#x20; isCorrect: boolean,

&#x20; session: { correctCount: number, tryCount: number },

&#x20; collection: any

): Feedback {

&#x20; if (isCorrect) {

&#x20;   if (session.correctCount >= 3 \&\& !collection.specialBonusUsed) {

&#x20;     return { type: 'SPECIAL', visual: 'animal\_surprise.lottie', audio: 'special\_cheer.mp3' }

&#x20;   }

&#x20;   return randomPick(correctResponses)

&#x20; } else {

&#x20;   if (session.tryCount === 1) return encourageResponses\[0]

&#x20;   if (session.tryCount === 2) return encourageResponses\[1]

&#x20;   return encourageResponses\[2]

&#x20; }

}



\## 8.7 测试用例

测试1：连续正确惊喜

输入：连续答对3题

期望：第3题正确时出现动物跳舞



测试2：错误引导渐进

输入：同一题连续错3次

期望：第1次轻鼓励，第2次闪烁区域，第3次具体引导



\---



\# 文档结束

