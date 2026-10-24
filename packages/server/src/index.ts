import { Authority } from './authority.js';
import { StateDB } from './db.js';
import { startHttpServer } from './httpServer.js';

export * from './storageAdapter.js';
export * from './db.js';
export * from './authority.js';
export * from './httpServer.js';

const port = Number(process.env.STUPUL_SERVER_PORT ?? 8787);
const dbPath = process.env.STUPUL_SERVER_DB ?? './runtime/stupul-city.sqlite';

const authority = new Authority(new StateDB(dbPath));
startHttpServer(authority, port).then(({ server, port: p }) => {
  console.log(`STUPUL authoritative server listening on http://127.0.0.1:${p} (db: ${dbPath})`);
  const stop = () => server.close(() => process.exit(0));
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
});
