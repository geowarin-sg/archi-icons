import {serveDir} from "jsr:@std/http/file-server";
import {dirname} from "jsr:@std/path";
import {Eta} from "jsr:@eta-dev/eta";

const eta = new Eta({ views: Deno.cwd() + "/views/", cache: false });

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

type Icon = { path: string; content: string };

type IconData = {
  dir: string;
  icons: Icon[];
};

async function* getIconsData(): AsyncIterable<IconData> {
  let currentDir = "";
  let currentIcons: Icon[] = [];

  for await (const icon of getFilesRecursively("icons")) {
    const parent = dirname(icon);

    if (parent !== currentDir) {
      if (currentDir !== "") {
        yield { dir: currentDir, icons: currentIcons };
      }
      currentDir = parent;
      currentIcons = [];
    }
    const svgContent = await Deno.readTextFile(icon);
    currentIcons.push({ path: icon, content: svgContent });
  }
  if (currentDir !== "") {
    yield { dir: currentDir, icons: currentIcons };
  }
}

Deno.serve(async (req: Request) => {
  const pathname = new URL(req.url).pathname;

  if (pathname === "/gallery") {
    const iconsData = getIconsData();

    const html = await eta.renderAsync("gallery.eta", { iconsData });
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
