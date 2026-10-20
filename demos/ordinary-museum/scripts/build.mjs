import {cp,rm,writeFile} from 'node:fs/promises';
import {sourceArchive} from './archive.mjs';
await rm('dist',{recursive:true,force:true});await cp('src','dist',{recursive:true});
await writeFile('dist/ordinary-museum-source.zip',await sourceArchive());
console.log('Built ordinary-museum → dist/ with clean MIT source ZIP');
