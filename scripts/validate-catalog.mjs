#!/usr/bin/env node
/** Validate navigation metadata only; never install, run, or build a demo. */
import { readFile, realpath, stat } from 'node:fs/promises';
import { isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CATEGORIES = Object.freeze(['文学', '生活', '策略', '创作']);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SUFFIXES = ['localhost', 'local', 'internal', 'home', 'lan', 'test', 'invalid', 'example', 'onion'];
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.trim().length > 0;

/** Syntactic public-link guard, not DNS resolution or an availability check. */
export function isPublicHttpsUrl(value) {
  if (typeof value !== 'string' || !/^https:\/\//i.test(value) || /[\u0000-\u0020\u007f\\]/u.test(value)) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    const host = url.hostname;
    if (isIP(host.replace(/^\[|\]$/g, '')) || host.length > 253) return false;
    const labels = host.split('.');
    if (labels.length < 2 || labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) return false;
    if (!/^[a-z][a-z0-9-]+$/i.test(labels.at(-1))) return false;
    if (RESERVED_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) return false;
    if (['example.com', 'example.net', 'example.org'].some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) return false;
    return true;
  } catch {
    return false;
  }
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

/** Additive fields are allowed so independent consumers can evolve safely. */
export function validateCatalog(catalog) {
  const errors = [];
  if (!Array.isArray(catalog)) return ['catalog must be an array'];
  const slugs = new Set();
  catalog.forEach((demo, index) => {
    const label = `demos[${index}]`;
    const error = (message) => errors.push(`${label}: ${message}`);
    if (!isObject(demo)) return error('entry must be an object');
    if (typeof demo.slug !== 'string' || !SLUG.test(demo.slug)) {
      error('slug must use lowercase words/numbers separated by single hyphens');
    } else {
      if (slugs.has(demo.slug)) error(`duplicate slug "${demo.slug}"`);
      slugs.add(demo.slug);
    }
    for (const field of ['title', 'description']) {
      if (!isText(demo[field])) error(`${field} must be a nonempty string`);
    }
    if (!isDate(demo.date)) error('date must be a real YYYY-MM-DD date');
    if (!Array.isArray(demo.stack) || demo.stack.length === 0 || demo.stack.some((item) => !isText(item))) {
      error('stack must be a nonempty array of nonempty strings');
    }
    if (typeof demo.slug !== 'string' || !SLUG.test(demo.slug) || demo.path !== `demos/${demo.slug}`) {
      error('path must be the exact repository-relative demos/<slug> directory');
    }
    if (demo.readme !== `${demo.path}/README.md`) error('readme must be <path>/README.md');
    if (demo.license !== 'MIT') error('license must be MIT');
    if (!isObject(demo.deployment)) {
      error('deployment must contain a public HTTPS url and access');
    } else {
      if (demo.deployment.access !== 'public') error('deployment.access must be public');
      if (!isPublicHttpsUrl(demo.deployment.url)) error('deployment.url must be a public HTTPS URL without credentials or a custom port');
    }
    if (demo.category !== undefined && !CATEGORIES.includes(demo.category)) error(`category must be one of ${CATEGORIES.join('/')}`);
    if (demo.interaction !== undefined && (!isText(demo.interaction) || [...demo.interaction].length > 60 || /[\r\n]/.test(demo.interaction))) {
      error('interaction must be a nonempty, single-line hint of at most 60 characters');
    }
    if (demo.accent !== undefined && (typeof demo.accent !== 'string' || !/^#[0-9a-f]{6}$/i.test(demo.accent))) {
      error('accent must be a six-digit hex color (#RRGGBB)');
    }
    if (demo.preview !== undefined && !isPublicHttpsUrl(demo.preview)) error('preview must be a public HTTPS screenshot URL');
  });
  return errors;
}

/** Check real repository files, including symlink boundaries, without executing them. */
export async function validateCatalogFiles(catalog, root) {
  const errors = [];
  const base = await realpath(root);
  for (const demo of catalog) {
    const required = [
      [demo.path, 'directory'],
      [demo.readme, 'file'],
      [`${demo.path}/LICENSE`, 'file'],
    ];
    for (const [relative, kind] of required) {
      const label = `${demo.slug}: ${relative}`;
      try {
        const resolved = await realpath(path.resolve(base, relative));
        const within = path.relative(base, resolved);
        if (within === '..' || within.startsWith(`..${path.sep}`) || path.isAbsolute(within)) {
          errors.push(`${label} must stay within the repository`);
          continue;
        }
        const info = await stat(resolved);
        if (kind === 'directory' ? !info.isDirectory() : !info.isFile()) errors.push(`${label} must be a ${kind}`);
      } catch {
        errors.push(`${label} must exist and be readable`);
      }
    }
  }
  return errors;
}

export async function checkCatalog(filename) {
  const catalog = JSON.parse(await readFile(filename, 'utf8'));
  const errors = validateCatalog(catalog);
  // Do not resolve filesystem paths from malformed metadata.
  if (errors.length === 0) errors.push(...await validateCatalogFiles(catalog, path.dirname(filename)));
  return { catalog, errors };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const filename = path.resolve(process.argv[2] ?? fileURLToPath(new URL('../demos.json', import.meta.url)));
  try {
    const { catalog, errors } = await checkCatalog(filename);
    if (errors.length) {
      console.error(`Catalog validation failed (${errors.length}):\n${errors.map((error) => `- ${error}`).join('\n')}`);
      process.exitCode = 1;
    } else {
      console.log(`Catalog valid: ${catalog.length} demos. Metadata and local source paths checked; live availability was not checked.`);
    }
  } catch (error) {
    console.error(`Catalog validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
