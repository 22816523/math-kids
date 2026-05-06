export const tabs = [
  { id: 'home', label: '首页驾驶舱' },
  { id: 'search', label: '对话检索' },
  { id: 'projects', label: '项目详情' },
  { id: 'reports', label: '月报生成' },
  { id: 'settings', label: '设置' },
];

export const focusProject = {
  name: '3-纸张管理扫码出入库',
  stage: '内部评审',
  progress: 78,
  metrics: [
    { label: '会话', value: 62 },
    { label: '风险', value: 2 },
    { label: '方法论', value: 5 },
    { label: '下一步', value: 1 },
  ],
  flow: [
    { name: '需求收集', state: '完成' },
    { name: '需求分析', state: '完成' },
    { name: '方案设计', state: '收敛中', active: true },
    { name: '内部评审', state: '当前' },
  ],
  judgment: [
    { label: '问题', value: '边界未清' },
    { label: '判断', value: '先收口', active: true },
    { label: '动作', value: '补齐确认' },
    { label: '结果', value: '进入协同' },
  ],
  blockers: [
    { name: '业务确认未闭环', rank: 1 },
    { name: '异常策略未定', rank: 2 },
    { name: '范围容易外扩', rank: 3 },
  ],
  evidence: [
    { tag: '原文', text: '需求边界需要再确认' },
    { tag: '材料', text: '内部评审问题清单' },
    { tag: '结论', text: '先收口，再协同' },
  ],
  cycle: [
    { name: '需求收集', active: false },
    { name: '方案设计', active: true },
    { name: '内部评审', active: true },
    { name: '开发协同', active: false },
  ],
  methods: ['先对齐边界', '风险前置', '先收口再扩展', '评审问题单独闭环', '异常策略先定'],
};

export const searchResults = [
  {
    title: '纸张管理迭代需求文档',
    project: '3-纸张管理扫码出入库',
    date: '2026-03-18',
    tags: ['原文折叠', '展开'],
  },
  {
    title: '自动刷新与本机常驻',
    project: '设置',
    date: '2026-03-20',
    tags: ['17:00', '23:00', '高亮'],
  },
];

export const projects = [
  {
    name: '3-纸张管理扫码出入库',
    stage: '内部评审',
    progress: 74,
    work: ['梳理 / 调整 / 确认'],
    stats: '会话 62 / 提问 128 / 工具 74',
    value: '收口',
    method: '先对齐边界',
    issue: '接口联调',
  },
  {
    name: '4-自动转单升级',
    stage: '方案设计',
    progress: 52,
    work: ['链路 / 校验点'],
    stats: '会话 41 / 提问 83 / 工具 44',
    value: '减少返工',
    method: '逐层验证',
    issue: '异常策略',
  },
];

export const reportText = `项目名称：3-纸张管理扫码出入库
统计周期：2026-04

1. 项目概述
- 目标：收口
- 范围：梳理 / 修改 / 闭环
- 状态：评审

2. 项目周期
- 起始时间：2026-03-18
- 当前阶段：内部评审
- 已持续时长：13 天
- 里程碑：确认 / 初稿 / 修改

3. 本期工作
- 梳理库存流转异常
- 调整扫码入库步骤
- 完成确认

4. 数据支撑
- 会话数：62
- 提问数：128
- 工具调用数：74
- 活跃天数：18
- 关联子事项数：9

5. 工作价值
- 推进结果：收口
- 解决问题：卡点
- 降低成本：沟通
- 形成沉淀：方法论

6. 方法论沉淀
- 做法：对齐目标
- 沟通：问题-动作-结果
- 排查：逐层验证
- 风险：看边界

7. 遗留问题
- 未闭环：接口联调
- 风险：异常流程
- 下月：开发协同`;

export const settings = [
  ['主数据源', 'C:\\Users\\zbb09\\.codex'],
  ['项目目录', 'D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱'],
  ['自动刷新', '17:00 / 23:00'],
  ['字段', '结果 / 影响 / 方法论标签'],
];
