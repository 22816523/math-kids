import { access, readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ALLOWED_EXTENSIONS = new Set(['.jsonl', '.json', '.txt', '.md']);

function isAllowedFile(name) {
  const lower = String(name || '').toLowerCase();
  return [...ALLOWED_EXTENSIONS].some((ext) => lower.endsWith(ext));
}

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function walkDirectory(root, current, entries) {
  const list = await readdir(current, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) {
      await walkDirectory(root, fullPath, entries);
      continue;
    }
    if (!entry.isFile() || !isAllowedFile(entry.name)) continue;
    const content = await readFile(fullPath, 'utf8');
    entries.push({
      path: fullPath.slice(root.length + 1),
      fullPath,
      content,
    });
  }
}

export function resolveDefaultCodexRoot() {
  const candidates = [
    process.env.CODEX_ROOT,
    join(process.env.USERPROFILE || '', '.codex'),
    join(process.cwd(), '.codex'),
  ].filter(Boolean);

  return candidates.find(Boolean) || join(process.cwd(), '.codex');
}

export async function collectCodexEntries(rootPath = resolveDefaultCodexRoot()) {
  const root = resolve(rootPath);
  if (!(await pathExists(root))) return [];
  const entries = [];
  await walkDirectory(root, root, entries);
  return entries;
}

