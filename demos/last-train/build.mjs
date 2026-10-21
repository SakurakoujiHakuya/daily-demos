import { mkdir, copyFile, rm } from "node:fs/promises";
await rm(new URL("./dist/", import.meta.url), { recursive: true, force: true });
await mkdir(new URL("./dist/", import.meta.url));
for (const file of ["index.html", "style.css", "app.js", "engine.js"])
  await copyFile(
    new URL(file, import.meta.url),
    new URL(`dist/${file}`, import.meta.url),
  );
console.log("Built static app → dist/");
