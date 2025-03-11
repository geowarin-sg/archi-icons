import {dirname} from "jsr:@std/path";
import {Eta} from "jsr:@eta-dev/eta";
import {groupBy, map} from "@mary/async-iterator-fns";
import {IconFile} from "./IconFile.ts";
import { walk } from "@std/fs/walk";
import { WalkEntry } from "@std/fs";

const eta = new Eta({ views: Deno.cwd() + "/src/views/", cache: false });

function getFilesRecursively(dir: string): AsyncIterable<WalkEntry> {
  return walk(dir, {exts: ['.svg'], includeDirs: false})
}

export interface Icon {
  path: string;
  getContent: () => Promise<string>;
}

export function getIconsData(): Promise<Map<string, Icon[]>> {
  function mapper(entry: WalkEntry): Icon {
    return { path: entry.path, getContent: () => Deno.readTextFile(entry.path) };
  }
  return groupBy(
    map(getFilesRecursively("icons"), mapper),
    (i) => dirname(i.path),
  );
}

export async function getFromJson(path: string): Promise<Icon[]> {
  const json = await Deno.readTextFile(path);
  const iconFile = JSON.parse(json) as IconFile;
  return Object.entries(iconFile.icons).map(([name, icon]) => {
    return {
      path: name,
      getContent: () => Promise.resolve(icon.body),
    };
  });
}

export async function renderHtml(iconsData: Map<string, Icon[]>): Promise<string> {
  return await eta.renderAsync("gallery.eta", { iconsData });
}

export async function renderTemplate(iconsData: Map<string, Icon[]>): Promise<Response> {
  const html = await eta.renderAsync("gallery.eta", { iconsData });
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
