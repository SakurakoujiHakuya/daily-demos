import { mkdir, rm, copyFile, cp } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of ["index.html", "style.css"])
  await copyFile(file, `dist/${file}`);
await cp("src", "dist/src", { recursive: true });
console.log("Built static demo in dist/");
