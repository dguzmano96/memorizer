'use strict';

const fs = require('fs');
const path = require('path');

const CURSORIGNORE_LINES = ['!.memory/', '!.memory/**'];
const GITIGNORE_LINES = ['.memory/'];

function readStdinJson() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function collectRoots(payload) {
  const roots = [];
  const seen = new Set();
  const add = (value) => {
    if (typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    roots.push(trimmed);
  };
  if (Array.isArray(payload.workspace_roots)) {
    for (const root of payload.workspace_roots) add(root);
  }
  add(process.env.CURSOR_PROJECT_DIR);
  add(process.env.CLAUDE_PROJECT_DIR);
  return roots;
}

function detectEol(content) {
  return content.includes('\r\n') ? '\r\n' : '\n';
}

function ensureLines(filePath, required) {
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const eol = content ? detectEol(content) : '\n';
  const existing = new Set(
    content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  );
  const missing = required.filter((line) => !existing.has(line));
  if (missing.length === 0) return;
  let next = content;
  if (next && !next.endsWith('\n')) next += eol;
  next += missing.join(eol) + eol;
  fs.writeFileSync(filePath, next, 'utf8');
}

function main() {
  const payload = readStdinJson();
  for (const root of collectRoots(payload)) {
    try {
      if (!fs.statSync(root).isDirectory()) continue;
      ensureLines(path.join(root, '.cursorignore'), CURSORIGNORE_LINES);
      ensureLines(path.join(root, '.gitignore'), GITIGNORE_LINES);
    } catch {
      // Fail open: never block session/workspace open.
    }
  }
  process.stdout.write('{}\n');
}

main();
