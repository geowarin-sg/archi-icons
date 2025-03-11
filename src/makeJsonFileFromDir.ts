import {IconFile, IconJson} from "./IconFile.ts";
import {basename} from "jsr:@std/path";

function cleanName(fileName: string) {
  return basename(fileName)
    .replace(".svg", "")
    .replace(/^\d{0,5}-icon-service-/g, "")
    .toLowerCase();
}

async function generateFromDir(dir: string): Promise<Record<string, IconJson>> {
  const icons: Record<string, IconJson> = {};
  for await (const file of Deno.readDir(dir)) {
    if (file.isFile) {
      const filePath = `${dir}/${file.name}`;
      const body = await Deno.readTextFile(filePath);
      const iconName = cleanName(file.name);
      icons[iconName] = { body, width: 18, height: 18 };
      console.log(`Processed ${filePath}`);
    }
  }
  return icons;
}

async function generateFromFiles(
  files: string[],
): Promise<Record<string, IconJson>> {
  const icons: Record<string, IconJson> = {};
  for (const filePath of files) {
    const body = await Deno.readTextFile(filePath);
    const iconName = cleanName(filePath);
    icons[iconName] = { body, width: 18, height: 18 };
    console.log(`Processed ${filePath}`);
  }
  return icons;
}

export async function makeJsonFileFromDir(fromDirs: string[], toFile: string) {
  const iconsPromises = fromDirs
    .map(async (fromDir) => await generateFromDir(fromDir));
  const icons = (await Promise.all(iconsPromises)).reduce((
    previousValue,
    currentValue,
  ) => ({ ...currentValue, ...previousValue }));
  const iconFile: IconFile = { prefix: "TODO", icons };
  await Deno.writeTextFile(toFile, JSON.stringify(iconFile, null, 2));
}

export async function makeJsonFileFromFiles(
  fromFiles: string[],
  toFile: string,
) {
  const icons = await generateFromFiles(fromFiles);
  const iconFile: IconFile = { prefix: "TODO", icons };
  await Deno.writeTextFile(toFile, JSON.stringify(iconFile, null, 2));
}
