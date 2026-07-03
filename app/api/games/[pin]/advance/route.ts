import { z } from "zod";
import { readJson, errorResponse } from "@/lib/api";
import { advanceGame, endGame } from "@/lib/game/state";

export const runtime = "nodejs";

const schema = z.object({
  hostToken: z.string().min(1),
  action: z.enum(["advance", "end"]).default("advance"),
});

export async function POST(req: Request, ctx: RouteContext<"/api/games/[pin]/advance">) {
  try {
    const { pin } = await ctx.params;
    const { hostToken, action } = await readJson(req, schema);
    if (action === "end") {
      await endGame(pin, hostToken);
    } else {
      await advanceGame(pin, hostToken);
    }
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
