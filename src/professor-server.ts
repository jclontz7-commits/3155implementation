import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';
import sharp from 'sharp';
import { ZodError } from 'zod';
import type { PrismaClient } from './generated/prisma/client.js';
import { createDataAccess, DataAccessError } from './data/index.js';

class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const PUBLIC_FILES = new Set(['index.html', 'styles.css', 'app.js', 'profile.js', 'professor.js',
  'assets/avatar.png', 'assets/menu.svg', 'assets/briefcase.svg', 'assets/resume-button.svg', 'assets/upload.png',
  'assets/professor-avatar.png', 'assets/professor-menu.svg']);
const MIME: Record<string, string> = { html: 'text/html', css: 'text/css', js: 'text/javascript', png: 'image/png', svg: 'image/svg+xml' };

function body(request: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((accept, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => { size += chunk.length; if (size <= limit) chunks.push(chunk); });
    request.on('end', () => size > limit ? reject(new HttpError(413, 'The selected file or request is too large.')) : accept(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}
function json(response: ServerResponse, status: number, value: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}
function profileDto(profile: Awaited<ReturnType<ReturnType<typeof createDataAccess>['getProfessorProfile']>>) {
  if (!profile) throw new HttpError(404, 'Profile not found. Run the development seed first.');
  const { photo, ...fields } = profile;
  return { ...fields, photo: photo ? { id: photo.id, url: `/api/professor/photo/${photo.id}` } : null };
}

/** Local demo only. The single sample identity is chosen by the server, never the browser. */
export function createProfessorServer(db: PrismaClient, options: { professorId?: string; root?: string; uploads?: string } = {}) {
  if (process.env.NODE_ENV === 'production') throw new Error('The sample-professor server is development-only.');
  const professorId = options.professorId ?? '11111111-1111-4111-8111-111111111111';
  const root = resolve(options.root ?? process.cwd());
  const uploads = resolve(options.uploads ?? join(root, '.dev/uploads'));
  const sessions = new Map<string, number>();
  const data = createDataAccess(db);
  function authenticated(request: IncomingMessage) {
    const token = request.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('professor_session='))?.slice('professor_session='.length);
    if (!token || (sessions.get(token) ?? 0) <= Date.now()) { if (token) sessions.delete(token); throw new HttpError(401, 'Sign in to view your professor profile.'); }
    return token;
  }
  async function handle(request: IncomingMessage, response: ServerResponse) {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'same-origin');
    response.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' blob:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const address = server.address();
    const port = address && typeof address === 'object' ? address.port : 8000;
    const allowedHosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    if (!allowedHosts.includes(request.headers.host ?? '')) throw new HttpError(403, 'Invalid development host.');
    const path = new URL(request.url ?? '/', `http://${request.headers.host}`).pathname;
    if (!['GET', 'HEAD'].includes(request.method ?? '')) {
      if (request.headers.origin !== `http://${request.headers.host}`) throw new HttpError(403, 'Request origin is not allowed.');
    }
    if (path === '/api/dev-professor-session' && request.method === 'POST') {
      if (request.headers['content-type']?.split(';')[0] !== 'application/json') throw new HttpError(415, 'Use JSON.');
      const payload = await body(request, 1024);
      if (payload.toString().trim() !== '{}') throw new HttpError(422, 'The sample identity cannot be selected by the browser.');
      await data.getProfessorProfile(professorId).then(profileDto);
      for (const [token, expires] of sessions) if (expires <= Date.now()) sessions.delete(token);
      if (sessions.size >= 100) throw new HttpError(429, 'Too many active demo sessions.');
      const token = randomBytes(32).toString('hex');
      sessions.set(token, Date.now() + 8 * 3600000);
      response.setHeader('Set-Cookie', `professor_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);
      json(response, 200, { developmentSession: true }); return;
    }
    if (path.startsWith('/api/')) {
      const token = authenticated(request);
      if (path === '/api/professor/logout' && request.method === 'POST') {
        sessions.delete(token);
        response.setHeader('Set-Cookie', 'professor_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
        json(response, 200, { signedOut: true }); return;
      }
      if (path === '/api/professor/profile' && request.method === 'GET') {
        const [profile, posts] = await Promise.all([data.getProfessorProfile(professorId), data.listProfessorPosts(professorId, true)]);
        json(response, 200, { profile: profileDto(profile), posts }); return;
      }
      if (path === '/api/professor/profile' && request.method === 'PATCH') {
        if (request.headers['content-type']?.split(';')[0] !== 'application/json') throw new HttpError(415, 'Use JSON.');
        let input: unknown;
        try { input = JSON.parse((await body(request, 65536)).toString()); } catch (error) {
          if (error instanceof HttpError) throw error;
          throw new HttpError(400, 'Invalid JSON request.');
        }
        json(response, 200, { profile: profileDto(await data.updateProfessorProfile(professorId, input)) }); return;
      }
      if (path === '/api/professor/photo' && request.method === 'POST') {
        const bytes = await body(request, 2 * 1024 * 1024);
        if (!bytes.length) throw new HttpError(422, 'Choose a nonempty picture.');
        const expectedVersion = Number(request.headers['x-profile-version']);
        if (!Number.isInteger(expectedVersion) || expectedVersion < 1) throw new HttpError(422, 'Invalid profile version.');
        const mediaType = request.headers['content-type']?.split(';')[0];
        let info;
        try { info = await sharp(bytes, { limitInputPixels: 20000000 }).metadata(); }
        catch { throw new HttpError(422, 'This picture could not be decoded.'); }
        const formats: Record<string, string> = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
        if (!info.format || !formats[info.format] || formats[info.format] !== mediaType || info.pages && info.pages > 1) throw new HttpError(422, 'Choose a valid PNG, JPEG, or WebP picture.');
        // Decode the complete image before accepting it (metadata alone is insufficient).
        try { await sharp(bytes, { limitInputPixels: 20000000 }).stats(); }
        catch { throw new HttpError(422, 'This picture is damaged or unsupported.'); }
        let name: string;
        try { name = basename(decodeURIComponent(String(request.headers['x-file-name'] ?? 'profile-picture'))).slice(0, 255); }
        catch { throw new HttpError(422, 'Invalid picture filename.'); }
        const storageKey = `${randomUUID()}.${info.format}`;
        await mkdir(uploads, { recursive: true, mode: 0o700 });
        await writeFile(join(uploads, storageKey), bytes, { flag: 'wx', mode: 0o600 });
        try {
          const profile = await data.replaceProfessorPhoto(professorId, { storageKey, originalName: name, mediaType, sizeBytes: bytes.length, purpose: 'PHOTO' }, expectedVersion);
          json(response, 200, { profile: profileDto(profile) });
        } catch (error) { await unlink(join(uploads, storageKey)).catch(() => undefined); throw error; }
        return;
      }
      if (path.startsWith('/api/professor/photo/') && request.method === 'GET') {
        const profile = await data.getProfessorProfile(professorId);
        if (!profile?.photo || profile.photo.id !== path.slice('/api/professor/photo/'.length)) throw new HttpError(404, 'Picture not found.');
        const key = profile.photo.storageKey;
        if (basename(key) !== key) throw new HttpError(404, 'Picture not found.');
        let bytes;
        try { bytes = await readFile(join(uploads, key)); } catch { throw new HttpError(404, 'Picture file is unavailable.'); }
        response.writeHead(200, { 'Content-Type': profile.photo.mediaType, 'Cache-Control': 'private, no-store' }); response.end(bytes); return;
      }
      throw new HttpError(404, 'Endpoint not found.');
    }
    if (!['GET', 'HEAD'].includes(request.method ?? '')) throw new HttpError(405, 'Method not allowed.');
    const file = path === '/' ? 'index.html' : path.slice(1);
    if (!PUBLIC_FILES.has(file)) throw new HttpError(404, 'Page not found.');
    const content = await readFile(join(root, file));
    response.writeHead(200, { 'Content-Type': `${MIME[file.split('.').pop() ?? ''] ?? 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : content);
  }
  const server = createServer((request, response) => {
    handle(request, response).catch(error => {
      if (response.headersSent) { response.end(); return; }
      if (error instanceof HttpError) json(response, error.status, { message: error.message });
      else if (error instanceof DataAccessError) json(response, { FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, INVALID: 422 }[error.code], { message: error.message });
      else if (error instanceof ZodError) json(response, 422, { message: 'Please check the highlighted fields.', issues: error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })) });
      else json(response, 503, { message: 'The profile service is unavailable. Check the database and try again.' });
    });
  });
  server.requestTimeout = 10000;
  return server;
}
