import { connection } from "next/server";

import { buildSnapshot } from "@/lib/snapshot";

// Sem parâmetros e sem registrar IP ou identificador: o servidor não fica
// sabendo quem baixou o conteúdo nem de que região.
export async function GET(request: Request) {
  await connection();

  const snapshot = await buildSnapshot();
  const etag = `"${snapshot.version}"`;
  const headers = { ETag: etag, "Cache-Control": "no-cache" };

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  return Response.json(snapshot, { headers });
}
