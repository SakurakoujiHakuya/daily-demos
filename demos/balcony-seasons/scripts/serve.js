import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
http
  .createServer(async (req, res) => {
    try {
      const p = decodeURIComponent(req.url.split("?")[0]);
      const file = path.resolve(root, "." + (p === "/" ? "/index.html" : p));
      if (!file.startsWith(root + path.sep)) throw Error();
      const body = await readFile(file);
      res.setHeader(
        "Content-Type",
        {
          html: "text/html; charset=utf-8",
          js: "text/javascript",
          css: "text/css",
        }[file.split(".").pop()] || "application/octet-stream",
      );
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end("Not found");
    }
  })
  .listen(process.env.PORT || 4173, () =>
    console.log("http://localhost:" + (process.env.PORT || 4173)),
  );
