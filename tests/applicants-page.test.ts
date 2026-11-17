import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import type { PrismaClient } from '../src/generated/prisma/client.js';
import { createMessagingServer } from '../src/messaging-server.js';

let root: string;
let base: string;
let server: ReturnType<typeof createMessagingServer>;

before(async () => {
  root = await mkdtemp(join(tmpdir(), 'applicants-page-'));
  await mkdir(join(root, 'dist', 'applicant-assets'), { recursive: true });
  await writeFile(join(root, 'index.html'), '<title>Messages | Campus Research</title>');
  await writeFile(join(root, 'dist', 'applicants.html'), '<script type="module" src="/applicant-assets/applicants-test.js"></script><link rel="stylesheet" href="/applicant-assets/applicants-test.css">');
  await writeFile(join(root, 'dist', 'applicant-assets', 'applicants-test.js'), 'export {};');
  await writeFile(join(root, 'dist', 'applicant-assets', 'applicants-test.css'), 'body { color: black; }');
  await writeFile(join(root, 'dist', 'applicant-assets', 'applicant-test.png'), Buffer.from([137, 80, 78, 71]));
  server = createMessagingServer({} as PrismaClient, { root });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  base = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
  if (root) await rm(root, { recursive: true, force: true });
});

test('serves the messaging home and allowlisted built applicant assets', async () => {
  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Messages \| Campus Research/);

  const page = await fetch(`${base}/applicants.html`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /applicant-assets\/applicants-test\.js/);

  for (const [path, contentType] of [
    ['/applicant-assets/applicants-test.js', /javascript/],
    ['/applicant-assets/applicants-test.css', /text\/css/],
    ['/applicant-assets/applicant-test.png', /image\/png/],
  ] as const) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', contentType);
  }

  assert.equal((await fetch(`${base}/applicant-assets/unlisted.txt`)).status, 404);
});
