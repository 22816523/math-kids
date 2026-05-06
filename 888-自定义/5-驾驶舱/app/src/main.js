import './styles.css';
import { buildDashboard, parseCodexFiles } from './codex';
import { demoFiles, settings, tabs } from './data';

const state = {
  activeTab: 'home',
  keyword: '',
  dashboard: buildDashboard(parseCodexFiles(demoFiles)),
  sourceRoot: 'C:\\Users\\zbb09\\.codex',
  status: '本机自动识别',
  lastRefresh: new Date(),
  reportProject: '',
  loading: false,
  searchResults: [],
};

const sessionCache = new Map();
let searchTimer = null;

const app = document.getElementById('app');

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatClock(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(value, keyword) {
  const text = escapeHtml(value);
  const query = String(keyword || '').trim();
  if (!query) return text;
  return text.replace(new RegExp(escapeRegExp(query), 'ig'), (match) => `<mark>${match}</mark>`);
}

function renderProgress(value) {
  return `<div class="progress"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></div>`;
}

function getProjectSessions(projectName) {
  return state.dashboard.sessions.filter((session) => session.project === projectName);
}

function getCurrentProject() {
  return state.dashboard.projects.find((item) => item.name === state.reportProject) || state.dashboard.projects[0] || null;
}

async function fetchDashboard() {
  try {
    const response = await fetch('/api/dashboard', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.dashboard = payload.dashboard;
    state.sourceRoot = payload.sourceRoot;
    state.status = payload.status;
    state.lastRefresh = new Date(payload.lastRefresh);
    if (!state.reportProject && state.dashboard.projects[0]) {
      state.reportProject = state.dashboard.projects[0].name;
    }
    if (!state.keyword) {
      state.searchResults = state.dashboard.sessions || [];
    } else {
      await fetchSearchResults(state.keyword);
    }
  } catch {
    state.status = '后端未启动，当前显示示例数据';
    state.dashboard = buildDashboard(parseCodexFiles(demoFiles));
    state.lastRefresh = new Date();
    if (!state.reportProject && state.dashboard.projects[0]) {
      state.reportProject = state.dashboard.projects[0].name;
    }
    state.searchResults = state.dashboard.sessions || [];
  }
  render();
}

async function refreshDashboard() {
  state.loading = true;
  render();
  try {
    await fetch('/api/refresh', { method: 'POST' });
    await fetchDashboard();
  } finally {
    state.loading = false;
  }
}

async function fetchSearchResults(keyword = '') {
  const query = String(keyword || '').trim();
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.searchResults = payload.results || [];
  } catch {
    state.searchResults = [];
  }
  render();
}

async function loadSessionDetail(sessionId) {
  if (sessionCache.has(sessionId)) return sessionCache.get(sessionId);
  const response = await fetch(`/api/session?id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
  if (!response.ok) return null;
  const payload = await response.json();
  const session = payload.session;
  if (session?.rawText) {
    sessionCache.set(sessionId, session);
  }
  return session;
}

function cycleSteps(stage) {
  const steps = ['需求', '方案', '评审', '协同', '收口'];
  const index = steps.findIndex((step) => String(stage).includes(step));
  return steps.map((label, position) => ({
    label,
    active: index >= 0 ? position <= index : position === 0,
  }));
}

function renderHome() {
  const project = state.dashboard.focusProject;
  const sessions = getProjectSessions(project.name).slice(0, 3);
  const steps = cycleSteps(project.stage);

  return `
    <section class="tab-panel home-shell">
      <div class="card section home-banner">
        <div class="decision-badges">
          <span class="tag hot">主项目 ${escapeHtml(project.name)}</span>
          <span class="tag blue">阶段 ${escapeHtml(project.stage)}</span>
          <span class="tag">自动刷新 ${formatClock(state.lastRefresh)}</span>
        </div>
      </div>

      <div class="home-grid-top">
        <div class="card section home-main">
          <div class="section-head">
            <h3>主项目</h3>
            <span class="meta">${escapeHtml(project.lastDate || '—')}</span>
          </div>
          <div class="project-name">${escapeHtml(project.name)}</div>
          <div class="project-stage">${escapeHtml(project.stage)}</div>
          <div class="project-flow">
            <div class="flow-step active"><strong>会话</strong><span>${project.sessionCount}</span></div>
            <div class="flow-step active"><strong>提问</strong><span>${project.questionCount}</span></div>
            <div class="flow-step active"><strong>工具</strong><span>${project.toolCalls}</span></div>
            <div class="flow-step active"><strong>进度</strong><span>${project.progress}%</span></div>
          </div>
          ${renderProgress(project.progress)}
          <div class="micro-kpis">
            <div class="micro-kpi"><div class="label">工作</div><div class="value">${project.work.length}</div></div>
            <div class="micro-kpi"><div class="label">方法</div><div class="value">${project.method ? 1 : 0}</div></div>
            <div class="micro-kpi"><div class="label">风险</div><div class="value">${project.risks?.length || 0}</div></div>
            <div class="micro-kpi"><div class="label">会话</div><div class="value">${state.dashboard.summary.sessionCount}</div></div>
          </div>
        </div>

        <div class="home-side">
          <div class="card section">
            <div class="section-head"><h3>判断</h3></div>
            <div class="decision-track grid-2">
              <div class="decision-step active"><strong>状态</strong><span>${escapeHtml(project.stage)}</span></div>
              <div class="decision-step"><strong>结果</strong><span>${escapeHtml(project.value)}</span></div>
              <div class="decision-step"><strong>方法</strong><span>${escapeHtml(project.method)}</span></div>
              <div class="decision-step"><strong>关键</strong><span>${escapeHtml(project.issue)}</span></div>
            </div>
          </div>
          <div class="card section">
            <div class="section-head"><h3>阻塞</h3></div>
            <div class="risk-list">
              ${(project.risks?.length ? project.risks : [project.issue]).map((risk, index) => `
                <div class="risk-item">
                  <span class="dot"></span>
                  <strong>${escapeHtml(risk)}</strong>
                  <span>${index + 1}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="home-grid-bottom">
        <div class="card section">
          <div class="section-head"><h3>证据</h3></div>
          <div class="evidence-path">
            ${sessions.map((session) => `
              <details class="evidence-node" data-session-id="${escapeHtml(session.sessionId)}">
                <summary>
                  <div class="badge">${escapeHtml(session.date || '—')}</div>
                  <div><strong>${escapeHtml(session.title)}</strong></div>
                </summary>
                <pre class="session-preview">${highlightText(session.preview || '', state.keyword)}</pre>
              </details>
            `).join('')}
          </div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>周期</h3></div>
          <div class="cycle-bar">
            ${steps.map((step) => `
              <div class="cycle ${step.active ? 'active' : ''}">
                <strong>${step.label}</strong>
                <span>${step.active ? '进行中' : '待命'}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>方法</h3></div>
          <div class="method-cloud">
            ${(project.tags || []).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSearch() {
  const results = state.searchResults;

  return `
    <section class="tab-panel page-grid search-layout">
      <div class="card section filters">
        <div class="section-head"><h3>筛选</h3></div>
        <label>关键词<input id="searchInput" value="${escapeHtml(state.keyword)}" placeholder="搜索项目 / 原文" /></label>
        <button class="primary" id="searchBtn">搜索</button>
      </div>
      <div class="search-list">
        ${results.map((item) => `
          <details class="card section search-card" data-session-id="${escapeHtml(item.sessionId)}">
            <summary>
              <div class="item-head">
                <strong>${highlightText(item.title, state.keyword)}</strong>
                <span class="tag blue">${escapeHtml(item.project)}</span>
              </div>
              <div class="tags">
                <span class="tag">${escapeHtml(item.date || '—')}</span>
                <span class="tag hot">工具 ${item.toolCalls || 0}</span>
                ${(item.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
              </div>
            </summary>
            <pre class="session-preview">${highlightText(item.preview || '', state.keyword)}</pre>
          </details>
        `).join('')}
      </div>
    </section>
  `;
}

function renderProjects() {
  return `
    <section class="tab-panel page-grid project-grid">
      ${state.dashboard.projects.map((project) => {
        const sessions = getProjectSessions(project.name);
        return `
          <div class="card section">
            <div class="project-head">
              <strong>${escapeHtml(project.name)}</strong>
              <span class="tag ${project.stage.includes('评审') ? 'hot' : 'blue'}">${escapeHtml(project.stage)}</span>
            </div>
            ${renderProgress(project.progress)}
            <div class="tags">
              <span class="tag hot">会话 ${project.sessionCount}</span>
              <span class="tag blue">提问 ${project.questionCount}</span>
              <span class="tag">工具 ${project.toolCalls}</span>
              <span class="tag">${escapeHtml(project.lastDate || '—')}</span>
            </div>
            <div class="list">
              <div class="item"><strong>工作</strong><div class="muted">${escapeHtml(project.work.join(' / ') || '—')}</div></div>
              <div class="item"><strong>价值</strong><div class="muted">${escapeHtml(project.value)}</div></div>
              <div class="item"><strong>方法</strong><div class="muted">${escapeHtml(project.method)}</div></div>
              <div class="item"><strong>阻塞</strong><div class="muted">${escapeHtml(project.issue)}</div></div>
            </div>
            <details class="search-card" data-session-id="${escapeHtml(sessions[0]?.sessionId || project.name)}">
              <summary>原文</summary>
              <div class="list">
                ${sessions.slice(0, 3).map((session) => `
                  <details class="mini-session" data-session-id="${escapeHtml(session.sessionId)}">
                    <summary>
                      <span>${escapeHtml(session.date || '—')}</span>
                      <strong>${escapeHtml(session.title)}</strong>
                    </summary>
                    <pre class="session-preview">${highlightText(session.preview || '', state.keyword)}</pre>
                  </details>
                `).join('')}
              </div>
            </details>
          </div>
        `;
      }).join('')}
    </section>
  `;
}

function renderReports() {
  const project = getCurrentProject();
  const sessions = project ? getProjectSessions(project.name) : [];
  const reportText = project ? [
    `项目名称：${project.name}`,
    `统计周期：${sessions.at(-1)?.date || '—'} - ${sessions[0]?.date || '—'}`,
    '',
    '1. 项目概述',
    `- 阶段：${project.stage}`,
    `- 当前状态：${project.value}`,
    '',
    '2. 本期工作',
    ...(project.work.length ? project.work : ['- 待补充']),
    '',
    '3. 数据支撑',
    `- 会话数：${project.sessionCount}`,
    `- 提问数：${project.questionCount}`,
    `- 工具调用数：${project.toolCalls}`,
    `- 原文条数：${sessions.length}`,
    '',
    '4. 工作价值',
    `- 推进结果：${project.value}`,
    `- 关键判断：${project.issue}`,
    '',
    '5. 方法论沉淀',
    `- 复用做法：${project.method}`,
    `- 风险识别：${(project.risks || ['待确认']).join(' / ')}`,
    '',
    '6. 遗留问题',
    `- 当前阻塞：${project.issue}`,
  ].join('\n') : '暂无数据';

  return `
    <section class="tab-panel page-grid reports-layout">
      <div class="card section">
        <div class="section-head"><h3>项目</h3><span class="meta">按项目输出</span></div>
        <div class="list">
          ${state.dashboard.projects.map((item) => `
            <button class="project-select ${item.name === project?.name ? 'active' : ''}" data-project="${escapeHtml(item.name)}">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.stage)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="card section report-area">
        <div class="section-head"><h3>月报</h3><span class="meta">${escapeHtml(project?.name || '—')}</span></div>
        <pre class="report-editor">${escapeHtml(reportText)}</pre>
      </div>
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="tab-panel page-grid settings-layout">
      <div class="card section">
        <div class="section-head"><h3>数据源</h3><span class="meta">本机自动识别</span></div>
        <div class="list">
          ${settings.map(([name, value]) => `
            <div class="item">
              <strong>${escapeHtml(name)}</strong>
              <div class="muted">${escapeHtml(value)}</div>
            </div>
          `).join('')}
          <div class="item"><strong>根目录</strong><div class="muted">${escapeHtml(state.sourceRoot)}</div></div>
          <div class="item"><strong>状态</strong><div class="muted">${escapeHtml(state.status)}</div></div>
        </div>
      </div>
      <div class="card section">
        <div class="section-head"><h3>统计</h3><span class="meta">当前状态</span></div>
        <div class="micro-kpis">
          <div class="micro-kpi"><div class="label">会话</div><div class="value">${state.dashboard.summary.sessionCount}</div></div>
          <div class="micro-kpi"><div class="label">原文</div><div class="value">${state.dashboard.summary.recordCount}</div></div>
          <div class="micro-kpi"><div class="label">项目</div><div class="value">${state.dashboard.summary.projectCount}</div></div>
          <div class="micro-kpi"><div class="label">活跃天</div><div class="value">${state.dashboard.summary.activeDays}</div></div>
        </div>
      </div>
    </section>
  `;
}

function renderTab() {
  switch (state.activeTab) {
    case 'home':
      return renderHome();
    case 'search':
      return renderSearch();
    case 'projects':
      return renderProjects();
    case 'reports':
      return renderReports();
    case 'settings':
      return renderSettings();
    default:
      return renderHome();
  }
}

function render() {
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h1>Codex 工作驾驶舱</h1>
        </div>
        <div class="nav">
          ${tabs.map((tab) => `
            <button class="${tab.id === state.activeTab ? 'active' : ''}" data-tab="${tab.id}">
              ${tab.label}
            </button>
          `).join('')}
        </div>
        <div class="sidebar-card">
          <div class="row"><span><span class="status-dot"></span>自动刷新</span><strong>17:00 / 23:00</strong></div>
          <div class="row"><span>数据源</span><strong>本机自动</strong></div>
          <div class="row"><span>刷新</span><strong>${formatClock(state.lastRefresh)}</strong></div>
        </div>
        <div class="sidebar-card">
          <strong>${escapeHtml(state.status)}</strong>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="title">
            <h2>${tabs.find((tab) => tab.id === state.activeTab)?.label || '首页'}</h2>
          </div>
          <div class="toolbar">
            <input id="globalSearch" type="text" value="${escapeHtml(state.keyword)}" placeholder="搜索项目 / 原文 / 标签" />
            <button class="ghost" id="refreshBtn">${state.loading ? '刷新中' : '刷新'}</button>
          </div>
        </div>
        <div class="content">${renderTab()}</div>
      </main>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('.nav button').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeTab = button.dataset.tab;
      render();
    });
  });

  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', (event) => {
      state.keyword = event.target.value.trim();
      render();
    });
  }

  document.querySelectorAll('[data-project]').forEach((button) => {
    button.addEventListener('click', () => {
      state.reportProject = button.dataset.project;
      render();
    });
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.keyword = event.target.value.trim();
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        void fetchSearchResults(state.keyword);
      }, 180);
      render();
    });
  }

  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => void fetchSearchResults(state.keyword));
  }

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => void refreshDashboard());
  }

  document.querySelectorAll('[data-session-id]').forEach((node) => {
    node.addEventListener('toggle', async (event) => {
      if (!event.target.open) return;
      const sessionId = event.target.dataset.sessionId;
      if (!sessionId) return;
      const session = sessionCache.get(sessionId) || await loadSessionDetail(sessionId);
      if (!session) return;
      const preview = event.target.querySelector('.session-preview');
      if (preview) {
        preview.innerHTML = highlightText(session.rawText || '', state.keyword);
      }
    });
  });
}

render();
void fetchDashboard();
setInterval(() => {
  void fetchDashboard();
}, 60000);
