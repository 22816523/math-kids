import { describe, expect, it } from 'vitest';
import {
  buildDashboard,
  extractProjectName,
  inferSessionDate,
  parseCodexFiles,
} from './codex';

const sampleFiles = [
  {
    path: 'sessions/2026/04/sample.jsonl',
    content: [
      JSON.stringify({
        session_id: 's-1',
        role: 'user',
        content: '需求收敛到项目看板',
        timestamp: '2026-04-30T09:00:00+08:00',
        cwd: 'D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱',
      }),
      JSON.stringify({
        role: 'assistant',
        content: '已确认首页聚焦项目。',
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
    path: 'session_index.jsonl',
    content: [
      JSON.stringify({
        session_id: 's-2',
        title: '月报提炼',
        cwd: 'D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱',
        created_at: '2026-04-29T18:00:00+08:00',
        project: '888-自定义/5-驾驶舱',
      }),
    ].join('\n'),
  },
];

describe('codex parser', () => {
  it('extracts project name from path', () => {
    expect(extractProjectName('D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱\\app')).toBe('888-自定义');
  });

  it('infers session date from different timestamp fields', () => {
    expect(inferSessionDate({
      timestamp: '2026-04-30T09:00:00+08:00',
    })).toBe('2026-04-30');
    expect(inferSessionDate({
      created_at: '2026-04-29T18:00:00+08:00',
    })).toBe('2026-04-29');
  });

  it('parses codex files into sessions and records', () => {
    const result = parseCodexFiles(sampleFiles);
    expect(result.sessions).toHaveLength(2);
    expect(result.records.length).toBeGreaterThanOrEqual(3);
    expect(result.sessions[0].project).toBe('888-自定义');
    expect(result.sessions[0].toolCalls).toBe(1);
  });

  it('builds a project summary and searchable text', () => {
    const dashboard = buildDashboard(parseCodexFiles(sampleFiles));
    expect(dashboard.projects[0].name).toBe('888-自定义');
    expect(dashboard.summary.sessionCount).toBe(2);
    expect(dashboard.searchIndex[0].text).toContain('需求收敛到项目看板');
  });
});
