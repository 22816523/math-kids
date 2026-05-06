import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { buildDashboard, parseCodexFiles } from './src/codex.js';
import { collectCodexEntries, resolveDefaultCodexRoot } from './server/codex-source.js';

const rootDir = resolve('.');
const distDir = resolve(rootDir, 'dist');
const port = Number(process.env.PORT || 4173);

const state = {
  dashboard: buildDashboard(parseCodexFiles([])),
  sessionsById: new Map(),
  sourceRoot: resolveDefaultCodexRoot(),
  lastRefresh: new Date(0),
  status: '等待刷新',
};

function contentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!ext || filePath === '/' || filePath.endsWith('/')) {
    return 'text/html; charset=utf-8';
  }
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
    }[ext] || 'application/octet-stream'
  );
}

function sendJson(res, payload, statusCode = 200) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

async function readStaticFile(urlPath) {
  const safePath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = resolve(join(distDir, safePath.slice(1)));
  if (!filePath.startsWith(distDir)) return null;
  try {
    return await readFile(filePath);
  } catch {
    if (safePath !== '/index.html') {
      try {
        return await readFile(resolve(join(distDir, 'index.html')));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function refreshDashboard() {
  try {
    state.status = '扫描中';
    const entries = await collectCodexEntries(state.sourceRoot);
    state.dashboard = buildDashboard(parseCodexFiles(entries));
    state.sessionsById = new Map(state.dashboard.sessions.map((session) => [session.sessionId, session]));
    state.lastRefresh = new Date();
    state.status = entries.length ? '已刷新' : '未发现记录';
  } catch (error) {
    state.status = `刷新失败: ${error.message}`;
  }
}

function serializeSession(session) {
  if (!session) return null;
  return {
    sessionId: session.sessionId,
    title: session.title,
    project: session.project,
    date: session.date,
    questionCount: session.questionCount,
    toolCalls: session.toolCalls,
    messageCount: session.messageCount,
    tags: session.tags,
    stage: session.stage,
    risks: session.risks,
    preview: (session.rawText || '').slice(0, 260),
  };
}

function serializeDashboard() {
  return {
    summary: state.dashboard.summary,
    focusProject: {
      ...state.dashboard.focusProject,
      work: state.dashboard.focusProject.work.slice(0, 3),
      tags: state.dashboard.focusProject.tags?.slice(0, 6) || [],
      risks: state.dashboard.focusProject.risks?.slice(0, 3) || [],
    },
    projects: state.dashboard.projects.map((project) => ({
      ...project,
      work: project.work.slice(0, 3),
      keywords: project.keywords?.slice(0, 6) || [],
      risks: project.risks?.slice(0, 3) || [],
    })),
    sessions: state.dashboard.sessions.map(serializeSession),
  };
}

function scheduleAutoRefresh() {
  const runAt = (hour) => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    setTimeout(async () => {
      await refreshDashboard();
      scheduleAutoRefresh();
    }, next.getTime() - now.getTime());
  };

  runAt(17);
  runAt(23);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/dashboard' && req.method === 'GET') {
    sendJson(res, {
      ok: true,
      sourceRoot: state.sourceRoot,
      status: state.status,
      lastRefresh: state.lastRefresh.toISOString(),
      dashboard: serializeDashboard(),
    });
    return;
  }

  if (url.pathname === '/api/search' && req.method === 'GET') {
    const keyword = String(url.searchParams.get('q') || '').trim().toLowerCase();
    const sessions = state.dashboard.sessions.filter((session) => {
      if (!keyword) return true;
      return [
        session.title,
        session.project,
        session.date,
        session.rawText,
        ...(session.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
    sendJson(res, {
      ok: true,
      keyword,
      results: sessions.slice(0, 120).map(serializeSession),
    });
    return;
  }

  if (url.pathname === '/api/session' && req.method === 'GET') {
    const id = String(url.searchParams.get('id') || '');
    const session = state.sessionsById.get(id);
    sendJson(res, {
      ok: Boolean(session),
      session: session ? { ...serializeSession(session), rawText: session.rawText } : null,
    }, session ? 200 : 404);
    return;
  }

  if (url.pathname === '/api/refresh' && req.method === 'POST') {
    await refreshDashboard();
    sendJson(res, {
      ok: true,
      sourceRoot: state.sourceRoot,
      status: state.status,
      lastRefresh: state.lastRefresh.toISOString(),
      dashboard: serializeDashboard(),
    });
    return;
  }

  if (url.pathname === '/api/source' && req.method === 'GET') {
    sendJson(res, {
      ok: true,
      sourceRoot: state.sourceRoot,
      status: state.status,
      lastRefresh: state.lastRefresh.toISOString(),
    });
    return;
  }

  const file = await readStaticFile(url.pathname);
  if (file) {
    res.writeHead(200, {
      'content-type': contentType(url.pathname),
      'cache-control': 'no-store',
    });
    res.end(file);
    return;
  }

  const indexFile = await readStaticFile('/index.html');
  if (indexFile) {
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    });
    res.end(indexFile);
    return;
  }

  sendJson(res, { ok: false, error: 'dist not found' }, 404);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Codex dashboard server running at http://127.0.0.1:${port}`);
  void refreshDashboard();
  scheduleAutoRefresh();
});
