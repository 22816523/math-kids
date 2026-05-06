import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectCodexEntries } from './codex-source.js';

const created = [];

afterEach(() => {
  while (created.length) {
    const dir = created.pop();
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('collectCodexEntries', () => {
  it('reads codex-like files recursively from a root directory', async () => {
    const root = mkdtempSync(join(tmpdir(), 'codex-root-'));
    created.push(root);

    writeFileSync(join(root, 'session_index.jsonl'), JSON.stringify({
      session_id: 'idx-1',
      title: '索引',
      cwd: 'D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱',
      created_at: '2026-04-30T08:00:00+08:00',
    }) + '\n', 'utf8');

    const nested = join(root, 'sessions', '2026', '04');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(nested, { recursive: true }));
    writeFileSync(join(nested, 'sample.jsonl'), JSON.stringify({
      session_id: 's-1',
      role: 'user',
      content: 'hello',
      timestamp: '2026-04-30T09:00:00+08:00',
      cwd: 'D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱',
    }) + '\n', 'utf8');

    const entries = await collectCodexEntries(root);
    expect(entries.length).toBe(2);
    expect(entries.map((item) => item.path)).toEqual(expect.arrayContaining([
      expect.stringContaining('session_index.jsonl'),
      expect.stringContaining('sample.jsonl'),
    ]));
  });
});
