import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("./", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const p = decodeURIComponent(url.pathname);
      const name = p === "/" ? "index.html" : p.replace(/^\//, "");
      const target = path.resolve(root, name);
      if (
        !target.startsWith(root) ||
        !["index.html", "style.css", "app.js", "engine.js"].includes(name)
      ) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type":
          types[path.extname(target)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(await readFile(target));
    } catch {
      res.writeHead(400);
      res.end("Bad request");
    }
  })
  .listen(Number(process.env.PORT || 4173), "0.0.0.0", () =>
    console.log(`Rainy Letters: http://localhost:${process.env.PORT || 4173}`),
  );
