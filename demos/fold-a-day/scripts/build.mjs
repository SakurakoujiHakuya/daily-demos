import { cp, rm, writeFile } from 'node:fs/promises';
import { sourceArchive } from './archive.mjs';
await rm('dist', { recursive: true, force: true });
await cp('src', 'dist', { recursive: true });
await writeFile('dist/fold-a-day-source.zip', await sourceArchive());
console.log('Built fold-a-day → dist/ (with clean MIT source ZIP)');
