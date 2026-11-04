import { images } from "@/lib/db";

/** Serves product photos from Cloudflare R2: /img/products/metrosecure.jpg */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const path = key.map(decodeURIComponent).join("/");
  if (path.includes("..")) return new Response("Bad request", { status: 400 });

  const obj = await (await images()).get(path);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body as ReadableStream, { headers });
}
