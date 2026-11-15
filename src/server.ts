import { createDatabase } from './db.js';
import { createProfessorServer } from './professor-server.js';

const db = createDatabase();
await db.$connect();
const server = createProfessorServer(db);
const port = Number(process.env.PORT ?? 8000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT.');
server.listen(port, '127.0.0.1', () => console.log(`Professor profile demo: http://127.0.0.1:${port}/#/professor-login`));
async function shutdown() { server.close(); await db.$disconnect(); }
process.on('SIGTERM', () => { void shutdown(); });
process.on('SIGINT', () => { void shutdown(); });
