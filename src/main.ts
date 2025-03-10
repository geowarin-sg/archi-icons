import {IconFile, IconJson} from "./IconFile.ts";

function cleanName(file: Deno.DirEntry) {
  return file.name
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
      const iconName = cleanName(file);
      icons[iconName] = { body, width: 18, height: 18 };
      console.log(`Processed ${filePath}`);
    }
  }
  return icons;
}

async function makeFile(fromDirs: string[], toFile: string) {
  const iconsPromises = fromDirs
    .map(async (fromDir) => await generateFromDir(fromDir));
  const icons = (await Promise.all(iconsPromises)).reduce((
    previousValue,
    currentValue,
  ) => ({ ...currentValue, ...previousValue }));
  const iconFile: IconFile = { prefix: "TODO", icons };
  await Deno.writeTextFile(toFile, JSON.stringify(iconFile, null, 2));
}

await makeFile(["icons/azure/networking"], "static/azure.json");
await makeFile(
  [
    "icons/kube/infrastructure_components/labeled",
    "icons/kube/resources/labeled",
  ],
  "static/kube.json",
);
