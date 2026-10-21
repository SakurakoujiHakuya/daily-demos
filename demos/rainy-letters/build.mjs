import { mkdir, copyFile, rm } from "node:fs/promises";
await rm(new URL("./dist/", import.meta.url), { recursive: true, force: true });
await mkdir(new URL("./dist/", import.meta.url), { recursive: true });
for (const name of ["index.html", "style.css", "app.js", "engine.js"])
  await copyFile(
    new URL(name, import.meta.url),
    new URL(`dist/${name}`, import.meta.url),
  );
console.log("Built static app in dist/");
