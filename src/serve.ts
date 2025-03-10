import {serveDir} from "jsr:@std/http/file-server";
import {dirname} from "jsr:@std/path";
import {Eta} from "jsr:@eta-dev/eta";
import {groupBy, map} from "@mary/async-iterator-fns";
import {IconFile} from "./IconFile.ts";

const eta = new Eta({ views: Deno.cwd() + "/src/views/", cache: false });

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

interface Icon {
  path: string;
  getContent: () => Promise<string>;
}

function getIconsData(): Promise<Map<string, Icon[]>> {
  function mapper(path: string): Icon {
    return { path, getContent: () => Deno.readTextFile(path) };
  }
  return groupBy(
    map(getFilesRecursively("icons"), mapper),
    (i) => dirname(i.path),
  );
}

async function getFromJson(path: string): Promise<Icon[]> {
  const json = await Deno.readTextFile(path);
  const iconFile = JSON.parse(json) as IconFile;
  return Object.entries(iconFile.icons).map(([name, icon]) => {
    return {
      path: name,
      getContent: () => Promise.resolve(icon.body),
    };
  });
}

async function renderTemplate(iconsData: Map<string, Icon[]>) {
  const html = await eta.renderAsync("gallery.eta", {iconsData});
  return new Response(html, {
    headers: {"Content-Type": "text/html"},
  });
}

Deno.serve(async (req: Request) => {
  const pathname = new URL(req.url).pathname;

  if (pathname === "/") {
    const iconsData = new Map<string, Icon[]>;
    for await (const file of Deno.readDir("static")) {
      iconsData.set(file.name, await getFromJson(`static/${file.name}`))
    }

    return await renderTemplate(iconsData);
  }

  if (pathname === "/gallery") {
    const iconsData = await getIconsData();

    return await renderTemplate(iconsData);
  }

  const response = await serveDir(req, {
    fsRoot: "./static",
  });
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
});
