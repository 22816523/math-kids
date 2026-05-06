const DEFAULT_PROJECT = '未归类';

const PROJECT_BOUNDARIES = new Set(['app', 'src', 'dist', 'node_modules', 'sessions', 'archived_sessions', 'logs']);

const STAGE_RULES = [
  ['收口', '收口阶段'],
  ['验收', '验收阶段'],
  ['开发', '开发协同'],
  ['联调', '开发协同'],
  ['评审', '内部评审'],
  ['方案', '方案设计'],
  ['需求', '需求分析'],
];

const METHOD_RULES = [
  ['先收口', '先收口'],
  ['先确认', '先确认'],
  ['边界', '边界收口'],
  ['风险', '风险前置'],
  ['评审', '评审闭环'],
  ['协同', '协同推进'],
  ['复盘', '复盘沉淀'],
];

const RISK_RULES = [
  ['边界', '边界未清'],
  ['确认', '确认待定'],
  ['异常', '异常策略'],
  ['返工', '返工风险'],
  ['延期', '进度风险'],
  ['阻塞', '依赖阻塞'],
];

function normalizePath(value) {
  return String(value ?? '').replace(/\//g, '\\');
}

function splitPathSegments(value) {
  return normalizePath(value)
    .split(/[\\/]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function pickProjectFromSegments(segments) {
  if (!segments.length || segments.includes('.codex')) {
    return DEFAULT_PROJECT;
  }

  const aiIndex = segments.findIndex((segment) => segment === 'AI项目文档' || segment === 'AI项目');
  if (aiIndex >= 0) {
    const segment = segments[aiIndex + 1];
    if (segment && !PROJECT_BOUNDARIES.has(segment)) return segment;
  }

  const tail = segments.filter((segment) => !PROJECT_BOUNDARIES.has(segment));
  if (tail.length >= 2) {
    return tail[tail.length - 2];
  }

  return tail[0] || DEFAULT_PROJECT;
}

export function extractProjectName(pathOrCwd = '', fallback = '') {
  const project = pickProjectFromSegments(splitPathSegments(pathOrCwd));
  if (project !== DEFAULT_PROJECT) return project;
  return pickProjectFromSegments(splitPathSegments(fallback));
}

function parseDateValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function inferSessionDate(entry = {}) {
  const fields = [
    'timestamp',
    'created_at',
    'createdAt',
    'updated_at',
    'updatedAt',
    'last_message_at',
    'lastMessageAt',
    'date',
    'time',
  ];

  for (const field of fields) {
    const date = parseDateValue(entry[field]);
    if (date) return date;
  }

  return '';
}

function collectText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.map(collectText).filter(Boolean).join('\n');
  }
  if (typeof value === 'object') {
    const keys = ['content', 'text', 'message', 'title', 'prompt', 'response', 'name', 'query', 'answer', 'result', 'output'];
    const fields = keys.map((key) => collectText(value[key])).filter(Boolean);
    if (fields.length) return fields.join('\n');
    return Object.values(value).map(collectText).filter(Boolean).join('\n');
  }
  return '';
}

function detectStage(text) {
  for (const [keyword, stage] of STAGE_RULES) {
    if (text.includes(keyword)) return stage;
  }
  return '推进中';
}

function detectTags(text) {
  const tags = [];
  for (const [keyword, tag] of METHOD_RULES) {
    if (text.includes(keyword) && !tags.includes(tag)) tags.push(tag);
  }
  return tags.slice(0, 5);
}

function detectRisks(text) {
  const risks = [];
  for (const [keyword, risk] of RISK_RULES) {
    if (text.includes(keyword) && !risks.includes(risk)) risks.push(risk);
  }
  return risks.slice(0, 3);
}

function extractSessionKey(item, path) {
  return (
    item.session_id ||
    item.sessionId ||
    item.conversation_id ||
    item.conversationId ||
    item.id ||
    item.message_id ||
    item.messageId ||
    path
  );
}

function extractLooseSessionKey(item) {
  return (
    item.session_id ||
    item.sessionId ||
    item.conversation_id ||
    item.conversationId ||
    item.id ||
    item.message_id ||
    item.messageId ||
    ''
  );
}

function extractRole(item) {
  return String(item.role || item.author_role || item.speaker || item.type || '').toLowerCase();
}

function extractText(item) {
  const keys = ['content', 'text', 'message', 'title', 'prompt', 'response', 'result', 'output'];
  const text = keys.map((key) => collectText(item[key])).filter(Boolean).join('\n');
  if (text) return text;
  return collectText(item).trim();
}

function parseJsonLines(content) {
  const lines = String(content || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items = [];
  for (const line of lines) {
    try {
      items.push(JSON.parse(line));
    } catch {
      items.push({ type: 'text', content: line });
    }
  }

  if (!items.length && String(content || '').trim()) {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [{ type: 'text', content }];
    }
  }

  return items;
}

function getFileSessionKey(items, path) {
  const first = items.find((item) => extractLooseSessionKey(item));
  return first ? extractLooseSessionKey(first) : path;
}

function buildSession(group, path) {
  const sorted = [...group].sort((a, b) => {
    const left = new Date(a.timestamp || a.created_at || a.createdAt || 0).getTime();
    const right = new Date(b.timestamp || b.created_at || b.createdAt || 0).getTime();
    return left - right;
  });

  const first = sorted[0] || {};
  const sourceText = sorted.map(extractText).filter(Boolean).join('\n');
  const project = extractProjectName(first.cwd || first.path || path, first.project || path);
  const date = inferSessionDate(first) || inferSessionDate(sorted.find((item) => inferSessionDate(item))) || '';
  const title = first.title || first.summary || first.topic || first.name || sourceText.split('\n').find(Boolean)?.slice(0, 24) || '未命名';
  const sessionId = first.session_id || first.sessionId || first.conversation_id || first.conversationId || path;
  const questionCount = sorted.filter((item) => extractRole(item).includes('user') || extractText(item).includes('？') || extractText(item).includes('?')).length;
  const toolCalls = sorted.filter((item) => extractRole(item).includes('tool') || item.type === 'tool' || item.tool || item.tool_name || item.toolName).length;
  const tags = Array.from(new Set([
    ...detectTags(sourceText),
    project === DEFAULT_PROJECT ? '未归类' : '项目',
  ])).slice(0, 5);

  return {
    sessionId,
    title,
    project,
    date,
    questionCount,
    toolCalls,
    messageCount: sorted.length,
    tags,
    stage: detectStage(sourceText),
    risks: detectRisks(sourceText),
    rawText: sourceText,
    sourcePath: path,
    cwd: first.cwd || '',
  };
}

export function parseCodexFiles(files = []) {
  const records = [];
  const groups = new Map();

  files.forEach((file) => {
    const path = file.path || file.webkitRelativePath || file.name || '';
    const items = parseJsonLines(file.content || '');
    const fileSessionKey = getFileSessionKey(items, path);
    items.forEach((item, index) => {
      const sessionKey = extractLooseSessionKey(item) || fileSessionKey;
      const text = extractText(item);
      const record = {
        id: `${path}:${index}`,
        sessionId: sessionKey,
        role: extractRole(item) || 'text',
        type: item.type || item.event || 'message',
        title: item.title || '',
        date: inferSessionDate(item),
        project: extractProjectName(item.cwd || path, item.project || ''),
        text,
        sourcePath: path,
        raw: item,
      };
      records.push(record);
      if (!groups.has(sessionKey)) groups.set(sessionKey, []);
      groups.get(sessionKey).push({ ...item, path });
    });
  });

  const sessions = Array.from(groups.entries())
    .map(([sessionKey, group]) => buildSession(group, group[0]?.path || sessionKey))
    .sort((left, right) => {
      const leftTime = new Date(left.date || 0).getTime();
      const rightTime = new Date(right.date || 0).getTime();
      return rightTime - leftTime;
    });

  return { records, sessions };
}

function countActiveDays(sessions) {
  return new Set(sessions.map((session) => session.date).filter(Boolean)).size;
}

function buildProjectSummary(name, sessions) {
  const sessionCount = sessions.length;
  const toolCalls = sessions.reduce((sum, session) => sum + session.toolCalls, 0);
  const questionCount = sessions.reduce((sum, session) => sum + session.questionCount, 0);
  const risks = Array.from(new Set(sessions.flatMap((session) => session.risks))).slice(0, 3);
  const issue = risks[0] || '待确认';
  const stage = sessions[0]?.stage || '推进中';
  const lastDate = sessions[0]?.date || '';
  const keywords = Array.from(
    new Set(
      sessions
        .flatMap((session) => session.tags)
        .filter(Boolean)
        .slice(0, 6)
    )
  );

  return {
    name,
    stage,
    progress: Math.min(96, 32 + sessionCount * 7 + toolCalls),
    sessionCount,
    toolCalls,
    questionCount,
    lastDate,
    keywords,
    issue,
    risks,
    work: sessions.slice(0, 3).map((session) => session.title),
    value: sessionCount > 1 ? '推进中枢' : '单点收口',
    method: keywords.slice(0, 2).join(' / ') || '边界收口',
  };
}

function buildSearchIndex(sessions) {
  return sessions.map((session) => ({
    id: session.sessionId,
    title: session.title,
    project: session.project,
    date: session.date,
    tags: session.tags,
    text: [session.title, session.rawText, session.project, session.tags.join(' ')].join(' '),
    rawText: session.rawText,
    stage: session.stage,
    risks: session.risks,
    toolCalls: session.toolCalls,
  }));
}

export function buildDashboard({ sessions = [], records = [] } = {}) {
  const projectMap = new Map();
  sessions.forEach((session) => {
    const key = session.project || DEFAULT_PROJECT;
    if (!projectMap.has(key)) projectMap.set(key, []);
    projectMap.get(key).push(session);
  });

  const projects = Array.from(projectMap.entries())
    .map(([name, list]) => buildProjectSummary(name, list.sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))))
    .sort((left, right) => right.sessionCount - left.sessionCount);

  const summary = {
    sessionCount: sessions.length,
    recordCount: records.length,
    projectCount: projects.length,
    toolCount: sessions.reduce((sum, session) => sum + session.toolCalls, 0),
    activeDays: countActiveDays(sessions),
  };

  const focusProject = projects[0] || {
    name: '未导入',
    stage: '待导入',
    progress: 0,
    sessionCount: 0,
    toolCalls: 0,
    questionCount: 0,
    lastDate: '',
    keywords: [],
    issue: '等待导入目录',
    work: [],
    value: '等待数据',
    method: '等待数据',
  };

  const searchIndex = buildSearchIndex(sessions);

  return {
    summary,
    focusProject,
    projects,
    sessions,
    records,
    searchIndex,
  };
}

export function filterSearchResults(searchIndex = [], keyword = '') {
  const query = String(keyword || '').trim().toLowerCase();
  if (!query) return searchIndex;
  return searchIndex.filter((item) =>
    [item.title, item.project, item.date, item.text, ...(item.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query)
  );
}
