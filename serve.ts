import {serveDir} from "jsr:@std/http/file-server";
import {dirname} from "https://deno.land/std@0.114.0/path/mod.ts";

async function* getFilesRecursively(dir: string): AsyncIterable<string> {
  for await (const entry of Deno.readDir(dir)) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      yield* getFilesRecursively(fullPath);
    } else if (entry.isFile && entry.name.endsWith(".svg")) {
      yield fullPath;
    }
  }
}

Deno.serve(async (req: Request) => {
  const pathname = new URL(req.url).pathname;

  if (pathname === "/gallery") {
    let html = `<html><head>
<style>
svg {
  width: 100px;
  height: 100px;
}
</style></head><body>`;

    let currentDir = "";
    for await (const icon of getFilesRecursively("icons")) {
      const parent = dirname(icon);
      if (parent !== currentDir) {
        if (currentDir !== "") {
          html += `</div>`;
        }
        currentDir = parent;
        html += `<h1>${currentDir}</h1>`;
        html += `<div style="display: flex; flex-direction: row; flex-wrap: wrap;">`;
      }

      const svgContent = await Deno.readTextFile(icon);
      html +=
        `<div title="${icon}">${svgContent}</div>`;
    }

    html += "</body></html>";
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  const response = await serveDir(req, {
    fsRoot: "./static",
  });
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
});
