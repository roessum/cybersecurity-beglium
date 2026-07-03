import { prisma } from "@/lib/prisma";
import { sseResponse } from "@/lib/sse";
import { getStateVersion, buildHostSnapshot, buildPlayerSnapshot } from "@/lib/game/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request, ctx: RouteContext<"/api/games/[pin]/stream">) {
  const { pin } = await ctx.params;
  const url = new URL(req.url);
  const role = url.searchParams.get("role");

  const game = await prisma.game.findUnique({
    where: { pin },
    select: { hostToken: true },
  });
  if (!game) return Response.json({ error: "Game not found" }, { status: 404 });

  if (role === "host") {
    if (url.searchParams.get("hostToken") !== game.hostToken) {
      return Response.json({ error: "Not authorized" }, { status: 403 });
    }
    return sseResponse({
      getVersion: () => getStateVersion(pin),
      buildSnapshot: () => buildHostSnapshot(pin),
      signal: req.signal,
    });
  }

  if (role === "player") {
    const playerId = url.searchParams.get("playerId");
    if (!playerId) return Response.json({ error: "Missing playerId" }, { status: 400 });
    return sseResponse({
      getVersion: () => getStateVersion(pin),
      buildSnapshot: () => buildPlayerSnapshot(pin, playerId),
      signal: req.signal,
    });
  }

  return Response.json({ error: "Missing or invalid role" }, { status: 400 });
}
