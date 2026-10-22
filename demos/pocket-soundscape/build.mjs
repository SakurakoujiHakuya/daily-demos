import {cp,mkdir,rm} from 'node:fs/promises';
await rm(new URL('./dist/',import.meta.url),{recursive:true,force:true});await mkdir(new URL('./dist/',import.meta.url));await cp(new URL('./src/',import.meta.url),new URL('./dist/',import.meta.url),{recursive:true});console.log('Built static files into dist/');
