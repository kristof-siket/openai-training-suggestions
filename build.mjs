// Assembles the build output (dist/): the server, its service declaration
// and contract, and the files the server serves at run time. Compute deploys
// exactly this tree plus the packages the entry imports.
import { cp, mkdir, rm } from 'node:fs/promises';

const dist = new URL('./dist/', import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(new URL('./src/prisma/', dist), { recursive: true });

for (const file of ['server.mjs', 'service.mjs', 'db.mjs', 'index.html', 'script.js']) {
  await cp(new URL(`./${file}`, import.meta.url), new URL(`./${file}`, dist));
}
await cp(
  new URL('./src/prisma/contract.json', import.meta.url),
  new URL('./src/prisma/contract.json', dist),
);

console.log('Built dist/');
