import {serveDir} from "jsr:@std/http/file-server";

Deno.serve(async (req: Request) => {
  const response = await serveDir(req, {
    fsRoot: "./build",
  });
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
});
