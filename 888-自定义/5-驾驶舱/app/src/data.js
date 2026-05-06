export const tabs = [
  { id: 'home', label: '首页' },
  { id: 'search', label: '对话检索' },
  { id: 'projects', label: '项目详情' },
  { id: 'reports', label: '月报生成' },
  { id: 'settings', label: '设置' },
];

export const demoFiles = [
  {
    path: 'sessions/2026/04/2026-04-30.jsonl',
    content: [
      JSON.stringify({
        session_id: 'demo-001',
        role: 'user',
        content: '纸张管理项目首页改成聚焦项目。',
        timestamp: '2026-04-30T09:00:00+08:00',
        cwd: 'D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱',
      }),
      JSON.stringify({
        role: 'assistant',
        content: '已收紧首页层级，移除解释文案。',
        timestamp: '2026-04-30T09:01:00+08:00',
      }),
      JSON.stringify({
        type: 'tool',
        name: 'shell_command',
        content: 'Get-ChildItem',
        timestamp: '2026-04-30T09:02:00+08:00',
      }),
    ].join('\n'),
  },
  {
    path: 'sessions/2026/04/2026-04-29.jsonl',
    content: [
      JSON.stringify({
        session_id: 'demo-002',
        title: '月报结构',
        role: 'user',
        content: '按项目输出月报，保留原文，支持搜索。',
        timestamp: '2026-04-29T18:10:00+08:00',
        cwd: 'D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱',
      }),
      JSON.stringify({
        role: 'assistant',
        content: '月报保留项目、数据、价值、方法。',
        timestamp: '2026-04-29T18:11:00+08:00',
      }),
    ].join('\n'),
  },
  {
    path: 'session_index.jsonl',
    content: [
      JSON.stringify({
        session_id: 'demo-idx',
        title: '驾驶舱原型',
        cwd: 'D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱',
        created_at: '2026-04-28T08:30:00+08:00',
        project: '888-自定义/5-驾驶舱',
      }),
    ].join('\n'),
  },
];

export const settings = [
  ['主数据源', '本机文件导入'],
  ['项目目录', '888-自定义'],
  ['自动刷新', '17:00 / 23:00'],
  ['原文', '默认折叠'],
];
