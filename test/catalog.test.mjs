import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { checkCatalog, isPublicHttpsUrl, validateCatalog, validateCatalogFiles } from '../scripts/validate-catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const valid = () => ({
  slug: 'sample-demo', path: 'demos/sample-demo', title: '作品', description: '一个可交互实验',
  date: '2026-10-23', stack: ['HTML', 'JavaScript'], readme: 'demos/sample-demo/README.md',
  license: 'MIT', deployment: { url: 'https://demo.chatgpt.site', access: 'public' },
});
const rejected = (entry, pattern) => assert.ok(validateCatalog([entry]).some((error) => pattern.test(error)));

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'demo-catalog-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, 'demos/sample-demo'), { recursive: true });
  await writeFile(path.join(directory, 'demos/sample-demo/README.md'), '# Sample');
  await writeFile(path.join(directory, 'demos/sample-demo/LICENSE'), 'MIT License');
  await writeFile(path.join(directory, 'demos.json'), JSON.stringify([valid()]));
  return directory;
}

test('current repository catalog and source files satisfy the contract', async () => {
  const { catalog, errors } = await checkCatalog(path.join(root, 'demos.json'));
  assert.ok(catalog.length > 0);
  assert.deepEqual(errors, []);
});

test('legacy entries remain valid without gallery fields; additive fields are allowed', () => {
  assert.deepEqual(validateCatalog([valid()]), []);
  assert.deepEqual(validateCatalog([{ ...valid(), futureField: { enabled: true } }]), []);
  assert.deepEqual(validateCatalog([]), []);
});

test('all existing fields are required', async (t) => {
  for (const field of Object.keys(valid())) {
    await t.test(field, () => {
      const demo = valid();
      delete demo[field];
      assert.ok(validateCatalog([demo]).length > 0);
    });
  }
});

test('invalid root/entry types and malformed text/stack fields are rejected', () => {
  for (const value of [null, {}, 'catalog']) assert.ok(validateCatalog(value).length > 0);
  for (const value of [null, [], 1, 'demo']) assert.ok(validateCatalog([value]).length > 0);
  for (const title of ['', '  ', 23, null]) rejected({ ...valid(), title }, /title/);
  for (const description of ['', '  ', {}, null]) rejected({ ...valid(), description }, /description/);
  for (const stack of [[], [''], ['HTML', null], 'HTML']) rejected({ ...valid(), stack }, /stack/);
});

test('slugs are unique and cannot inject paths', () => {
  assert.match(validateCatalog([valid(), valid()]).join('\n'), /duplicate slug/);
  for (const slug of ['Sample', '../sample', 'a/b', 'a\\b', 'a--b', '-a', 'a-', '', '%2e%2e']) {
    rejected({ ...valid(), slug }, /slug/);
  }
});

test('paths and README must match the slug without traversal', () => {
  for (const value of ['../demos/sample-demo', '/demos/sample-demo', 'demos/other', 'demos/sample-demo/..', 'demos\\sample-demo']) {
    rejected({ ...valid(), path: value }, /path/);
  }
  for (const readme of ['README.md', 'demos/sample-demo/../README.md', 'https://demo.chatgpt.site/README.md']) {
    rejected({ ...valid(), readme }, /readme/);
  }
});

test('dates must be real calendar dates, including leap-year boundaries', () => {
  for (const date of ['2024-02-29', '2000-02-29', '2026-12-31']) assert.deepEqual(validateCatalog([{ ...valid(), date }]), []);
  for (const date of ['2026-02-29', '1900-02-29', '2026-02-30', '2026-13-01', '2026-04-31', '2026-1-01', '0000-01-01', '2026-10-23T00:00:00Z', null]) {
    rejected({ ...valid(), date }, /date/);
  }
});

test('MIT license and public deployment are required', () => {
  for (const license of ['Apache-2.0', 'mit', '', null]) rejected({ ...valid(), license }, /license/);
  for (const deployment of [null, [], {}, { url: valid().deployment.url, access: 'private' }]) {
    rejected({ ...valid(), deployment }, /deployment/);
  }
});

test('HTTPS URL guard accepts public hostnames and rejects dangerous/local destinations', () => {
  for (const url of ['https://demo.chatgpt.site', 'https://github.com/owner/repo?tab=readme#start', 'https://demo.chatgpt.site:443/']) {
    assert.equal(isPublicHttpsUrl(url), true, url);
  }
  for (const url of [
    'http://demo.chatgpt.site', 'https:demo.chatgpt.site', 'https:/demo.chatgpt.site', 'javascript:alert(1)', 'data:image/png;base64,a', '//demo.chatgpt.site',
    'https://user:secret@demo.chatgpt.site', 'https://demo.chatgpt.site:8443', ' https://demo.chatgpt.site',
    'https://demo.chatgpt.site/\n', 'https://demo.chatgpt.site\\evil', 'https://localhost', 'https://x.localhost',
    'https://router.local', 'https://service.internal', 'https://device.lan', 'https://host.test', 'https://example.com',
    'https://127.0.0.1', 'https://10.0.0.1', 'https://192.168.1.1', 'https://169.254.169.254',
    'https://2130706433', 'https://0x7f000001', 'https://[::1]', 'https://[fd00::1]', 'https://8.8.8.8',
    'https://singlelabel', 'https://bad-.chatgpt.site', null,
  ]) {
    assert.equal(isPublicHttpsUrl(url), false, String(url));
    rejected({ ...valid(), deployment: { access: 'public', url } }, /deployment.url/);
  }
});

test('optional gallery metadata is bounded, while screenshot omission is valid', () => {
  for (const category of ['文学', '生活', '策略', '创作']) {
    assert.deepEqual(validateCatalog([{ ...valid(), category, interaction: '点击试一试。', accent: '#A1b2C3', preview: 'https://demo.chatgpt.site/preview.png' }]), []);
  }
  rejected({ ...valid(), category: '其他' }, /category/);
  for (const interaction of ['', 'x'.repeat(61), '两行\n提示', null]) rejected({ ...valid(), interaction }, /interaction/);
  for (const accent of ['red', '#abc', '#12345678', '#123456; color:red', null]) rejected({ ...valid(), accent }, /accent/);
  for (const preview of ['', '/preview.png', 'https://localhost/image.png', null]) rejected({ ...valid(), preview }, /preview/);
});

test('filesystem validation finds absent files, wrong types, and escaped symlinks', async (t) => {
  const directory = await fixture(t);
  assert.deepEqual(await validateCatalogFiles([valid()], directory), []);
  await rm(path.join(directory, 'demos/sample-demo/README.md'));
  assert.match((await validateCatalogFiles([valid()], directory)).join('\n'), /README.md must exist/);
  await mkdir(path.join(directory, 'demos/sample-demo/README.md'));
  assert.match((await validateCatalogFiles([valid()], directory)).join('\n'), /README.md must be a file/);
  await rm(path.join(directory, 'demos/sample-demo/README.md'), { recursive: true });
  const outside = await mkdtemp(path.join(os.tmpdir(), 'catalog-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(path.join(outside, 'README.md'), '# Outside');
  await symlink(path.join(outside, 'README.md'), path.join(directory, 'demos/sample-demo/README.md'));
  assert.match((await validateCatalogFiles([valid()], directory)).join('\n'), /must stay within the repository/);
});

test('CLI works without installation, reports errors, and exits nonzero for bad JSON', async (t) => {
  const directory = await fixture(t);
  const filename = path.join(directory, 'demos.json');
  const run = (args) => spawnSync(process.execPath, [path.join(root, 'scripts/validate-catalog.mjs'), ...args], { encoding: 'utf8', cwd: os.tmpdir() });
  const repository = run([]);
  assert.equal(repository.status, 0, repository.stderr);
  assert.match(repository.stdout, /Metadata and local source paths checked/);
  assert.equal(run([filename]).status, 0);
  await writeFile(filename, JSON.stringify([{ ...valid(), license: 'unknown' }]));
  const invalid = run([filename]);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /license must be MIT/);
  await writeFile(filename, '{');
  const malformed = run([filename]);
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /Catalog validation failed/);
});
