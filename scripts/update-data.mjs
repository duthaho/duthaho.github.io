#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

const USER = process.env.GITHUB_USER || 'duthaho';
const BLOG_URL = process.env.BLOG_URL || 'https://duthaho.dev/';
const TOKEN = process.env.GITHUB_TOKEN;
const DATA_PATH = new URL('../data.json', import.meta.url);

const PROJECT_COUNT = 4;
const ARTICLE_COUNT = 5;
const EXCLUDE_REPOS = new Set(['duthaho.github.io', 'duthaho.dev']);

async function fetchProjects() {
  const headers = { 'User-Agent': 'duthaho-about-updater', Accept: 'application/vnd.github+json' };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const res = await fetch(
    `https://api.github.com/users/${USER}/repos?per_page=100&type=owner`,
    { headers }
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);

  const repos = await res.json();
  const ranked = repos
    .filter(r => !r.fork && !r.archived && !r.private && !EXCLUDE_REPOS.has(r.name))
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, PROJECT_COUNT);

  return ranked.map((r, i) => {
    const item = {
      name: r.name,
      description: (r.description || '').trim(),
      url: r.html_url,
      stars: r.stargazers_count,
    };
    if (r.forks_count > 0) item.forks = r.forks_count;
    if (i === 0) item.featured = true;
    return item;
  });
}

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };
const decode = s => s.replace(/&(amp|lt|gt|quot|#39|apos);/g, m => ENTITIES[m]);
const stripTags = s => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

async function fetchArticles() {
  const res = await fetch(BLOG_URL, { headers: { 'User-Agent': 'duthaho-about-updater' } });
  if (!res.ok) throw new Error(`Blog fetch ${res.status}`);
  const html = await res.text();

  const cardRe = /<a\s+class="[^"]*\bpost-card\b[^"]*"\s+href="([^"]+)"[\s\S]*?<div class="post-title">([\s\S]*?)<\/div>[\s\S]*?<p class="post-excerpt">([\s\S]*?)<\/p>/g;
  const out = [];
  for (const m of html.matchAll(cardRe)) {
    out.push({
      title: stripTags(m[2]),
      excerpt: stripTags(m[3]),
      url: new URL(m[1], BLOG_URL).href,
    });
    if (out.length >= ARTICLE_COUNT) break;
  }
  if (out.length === 0) throw new Error('No post cards parsed — blog template may have changed');
  return out;
}

function findArrayRange(src, key) {
  const m = src.match(new RegExp(`"${key}"\\s*:\\s*\\[`));
  if (!m) throw new Error(`Key "${key}" not found in data.json`);
  const open = m.index + m[0].length - 1;
  let i = open + 1, depth = 1, inStr = false, esc = false;
  while (i < src.length && depth > 0) {
    const c = src[i];
    if (esc) esc = false;
    else if (inStr) {
      if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === '[') depth++;
      else if (c === ']') depth--;
    }
    i++;
  }
  if (depth !== 0) throw new Error(`Unterminated array for "${key}"`);
  return [open, i];
}

function formatArray(arr) {
  if (arr.length === 0) return '[]';
  const inner = arr
    .map(item => JSON.stringify(item, null, 2).split('\n').map(l => '    ' + l).join('\n'))
    .join(',\n');
  return '[\n' + inner + '\n  ]';
}

function spliceArray(src, key, arr) {
  const [open, close] = findArrayRange(src, key);
  return src.slice(0, open) + formatArray(arr) + src.slice(close);
}

const [projects, articles] = await Promise.all([fetchProjects(), fetchArticles()]);
let src = await readFile(DATA_PATH, 'utf8');
src = spliceArray(src, 'projects', projects);
src = spliceArray(src, 'articles', articles);
await writeFile(DATA_PATH, src);

console.log(`Updated ${projects.length} projects and ${articles.length} articles.`);
