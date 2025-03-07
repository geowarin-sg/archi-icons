
const icons: Record<string, { body: string, width: number, height: number }> = {};

for await (const file of Deno.readDir("icons/azure/networking")) {
  if (file.isFile) {
    const filePath = `icons/azure/networking/${file.name}`;
    const body = await Deno.readTextFile(filePath);
    const iconName = file.name
      .replace(".svg", "")
      .replace(/^\d{0,5}-icon-service-/g, "")
      .toLowerCase();
    icons[iconName] = {body, width: 18, height: 18};
    console.log(`Processed ${iconName}`);
  }
}

await Deno.writeTextFile("static/icons.json", JSON.stringify({ prefix: "archi", icons }, null, 2));
