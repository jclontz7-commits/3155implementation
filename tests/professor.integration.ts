import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { before, after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';
import { createDatabase } from '../src/db.js';
import { developmentDatabaseUrl } from '../src/config.js';
import { createDataAccess } from '../src/data/index.js';
import { createProfessorServer } from '../src/professor-server.js';

developmentDatabaseUrl(process.env.DATABASE_URL, true);
const db = createDatabase();
const data = createDataAccess(db);
const professorId = randomUUID(), otherId = randomUUID(), areaId = randomUUID();
const fields = { displayName: 'HTTP Test Professor', degree: 'Ph.D.', department: 'Computing', education: 'Test education', about: 'Test biography', researchAreas: ['Computing'], contactEmail: 'faculty@example.test', virtualOfficeUrl: 'https://example.test/office', officeHours: 'Monday' };
let uploads: string, base: string, cookie = '';
let server: ReturnType<typeof createProfessorServer>;
async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(base + path, { ...options, headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}), ...options.headers } });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  return response;
}
async function login() { const response = await request('/api/dev-professor-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); assert.equal(response.status, 200); return response; }
before(async () => {
  uploads = await mkdtemp(join(tmpdir(), 'professor-profile-tests-'));
  for (const id of [professorId, otherId]) {
    await db.user.create({ data: { id, email: `${id}@example.test`, role: 'PROFESSOR' } });
    await data.createProfessorProfile(id, fields);
  }
  await db.researchArea.create({ data: { id: areaId, name: `HTTP test ${areaId}` } });
  for (const [actor, title, publish] of [[professorId, 'My published post', true], [professorId, 'My private draft', false], [otherId, 'Someone else post', true]] as const) {
    const post = await data.createOpportunity(actor, { title, description: 'Test opportunity description', responsibilities: ['Research'], goals: ['Learn'], prerequisites: ['Programming'], duration: 'One semester', hoursMin: 4, hoursMax: 8, deadline: new Date(Date.now() + 86400000), researchAreaIds: [areaId] });
    if (publish) await data.publishOpportunity(actor, post.id);
  }
  server = createProfessorServer(db, { professorId, uploads });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  if (server) { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
  try {
    await db.opportunity.deleteMany({ where: { professorId: { in: [professorId, otherId] } } });
    await db.professorProfile.deleteMany({ where: { userId: { in: [professorId, otherId] } } });
    await db.fileAsset.deleteMany({ where: { ownerId: { in: [professorId, otherId] } } });
    await db.user.deleteMany({ where: { id: { in: [professorId, otherId] } } });
    await db.researchArea.deleteMany({ where: { id: areaId } });
    if (uploads) await rm(uploads, { recursive: true, force: true });
  } finally { await db.$disconnect(); }
});
test('local session is required; secret files are never served; origin and actor spoofing are rejected', async () => {
  assert.equal((await request('/api/professor/profile')).status, 401);
  assert.equal((await request('/.env')).status, 404);
  assert.equal((await request('/.dev/postgres/postgresql.conf')).status, 404);
  const badOrigin = await request('/api/dev-professor-session', { method: 'POST', headers: { Origin: 'https://attacker.test', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(badOrigin.status, 403);
  assert.equal((await request('/api/dev-professor-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: otherId }) })).status, 422);
  const response = await login();
  assert.match(response.headers.get('set-cookie') ?? '', /HttpOnly/);
  assert.match(response.headers.get('set-cookie') ?? '', /SameSite=Strict/);
});
test('profile API shows only own published posts and persists versioned updates', async () => {
  const result = await (await request('/api/professor/profile')).json();
  assert.equal(result.profile.userId, professorId);
  assert.deepEqual(result.posts.map((p: { title: string }) => p.title), ['My published post']);
  const saved = await request('/api/professor/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, displayName: 'Saved over HTTP', expectedVersion: 1 }) });
  assert.equal(saved.status, 200);
  assert.equal((await db.professorProfile.findUniqueOrThrow({ where: { userId: professorId } })).displayName, 'Saved over HTTP');
  assert.equal((await request('/api/professor/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, expectedVersion: 1 }) })).status, 409);
  assert.equal((await request('/api/professor/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, userId: otherId, expectedVersion: 2 }) })).status, 422);
  assert.equal((await request('/api/professor/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
});
test('photo upload verifies image bytes, serves private content, and rolls back stale replacements', async () => {
  const image = await sharp({ create: { width: 2, height: 2, channels: 4, background: '#2e5d34' } }).png().toBuffer();
  const headers = { 'Content-Type': 'image/png', 'X-Profile-Version': '2', 'X-File-Name': 'picture.png' };
  const response = await request('/api/professor/photo', { method: 'POST', headers, body: new Uint8Array(image) });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.profile.version, 3);
  assert.equal(result.profile.photo.storageKey, undefined);
  const retrieved = await request(result.profile.photo.url);
  assert.equal(retrieved.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await retrieved.arrayBuffer()), image);
  assert.equal((await request('/api/professor/photo', { method: 'POST', headers, body: new Uint8Array(image) })).status, 409);
  assert.equal((await readdir(uploads)).length, 1);
  assert.equal(await db.fileAsset.count({ where: { ownerId: professorId } }), 1);
  assert.equal((await request('/api/professor/photo', { method: 'POST', headers: { ...headers, 'X-Profile-Version': '3' }, body: 'invalid png bytes' })).status, 422);
  assert.equal((await request('/api/professor/photo', { method: 'POST', headers: { ...headers, 'X-Profile-Version': '3' }, body: new Uint8Array(2097153) })).status, 413);
});
async function waitFor(check: () => boolean) {
  for (let n = 0; n < 200; n += 1) { if (check()) return; await new Promise(resolve => setTimeout(resolve, 10)); }
  assert.fail('The expected UI update did not arrive.');
}
test('actual professor DOM renders, cancels edits, saves escaped content, and keeps conflicting edits', async () => {
  const dom = new JSDOM('<div id="app"></div>', { url: `${base}/#/professor-profile`, runScripts: 'outside-only' });
  const w = dom.window;
  Object.assign(w, { app: w.document.querySelector('#app'), fetch: (path: string, options: RequestInit) => request(path, options) });
  w.HTMLElement.prototype.scrollIntoView = () => undefined;
  w.eval(await readFile('professor.js', 'utf8'));
  const views = w as unknown as { renderProfessorProfile: () => Promise<void> };
  try {
    await views.renderProfessorProfile();
    const doc = w.document;
    assert.equal(doc.querySelector('h1')?.textContent, 'Saved over HTTP');
    assert.match(doc.querySelector('#professor-posts')?.textContent ?? '', /My published post/);
    assert.doesNotMatch(doc.querySelector('#professor-posts')?.textContent ?? '', /private draft|Someone else/);
    (doc.querySelector('#edit-professor') as HTMLButtonElement).click();
    (doc.querySelector('[name="displayName"]') as HTMLInputElement).value = 'Discard this';
    (doc.querySelector('#cancel-professor-edit') as HTMLButtonElement).click();
    assert.equal(doc.querySelector('h1')?.textContent, 'Saved over HTTP');
    (doc.querySelector('#edit-professor') as HTMLButtonElement).click();
    (doc.querySelector('[name="displayName"]') as HTMLInputElement).value = '<b>Saved & safe</b>';
    doc.querySelector('form')!.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => doc.querySelector('#professor-status')?.textContent === 'Profile changes saved.');
    assert.equal(doc.querySelector('h1')?.textContent, '<b>Saved & safe</b>');
    assert.equal(doc.querySelector('h1 b'), null);
    (doc.querySelector('#edit-professor') as HTMLButtonElement).click();
    (doc.querySelector('[name="displayName"]') as HTMLInputElement).value = 'Keep my conflicting edit';
    const profile = await data.getProfessorProfile(professorId); assert.ok(profile);
    await data.updateProfessorProfile(professorId, { ...fields, expectedVersion: profile.version });
    doc.querySelector('form')!.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => doc.querySelector('#professor-status')?.textContent?.includes('Your edits are still here.') ?? false);
    assert.equal((doc.querySelector('[name="displayName"]') as HTMLInputElement).value, 'Keep my conflicting edit');
  } finally { w.close(); }
});
test('empty posted list and unauthenticated direct profile navigation have useful states', async () => {
  await db.opportunity.deleteMany({ where: { professorId } });
  const dom = new JSDOM('<div id="app"></div>', { url: `${base}/#/professor-profile`, runScripts: 'outside-only' });
  const w = dom.window;
  Object.assign(w, { app: w.document.querySelector('#app'), fetch: (path: string, options: RequestInit) => request(path, options) });
  w.eval(await readFile('professor.js', 'utf8'));
  const views = w as unknown as { renderProfessorProfile: () => Promise<void> };
  try {
    await views.renderProfessorProfile();
    assert.match(w.document.querySelector('.professor-empty')?.textContent ?? '', /haven’t published/);
    Object.assign(w, { fetch: (path: string) => fetch(base + path) });
    await views.renderProfessorProfile();
    await waitFor(() => w.location.hash === '#/professor-login');
  } finally { w.close(); }
});
test('logout invalidates session and a fresh session reads persisted profile', async () => {
  assert.equal((await request('/api/professor/logout', { method: 'POST' })).status, 200);
  assert.equal((await request('/api/professor/profile')).status, 401);
  await login();
  assert.equal((await (await request('/api/professor/profile')).json()).profile.displayName, fields.displayName);
});
