import { z } from "zod";
import { readJson, errorResponse } from "@/lib/api";
import { joinGame } from "@/lib/game/state";

export const runtime = "nodejs";

const schema = z.object({
  nickname: z.string().trim().min(1, "Enter a nickname").max(20, "Nickname too long"),
  emoji: z.string().min(1, "Pick an emoji").max(8),
});

export async function POST(req: Request, ctx: RouteContext<"/api/games/[pin]/join">) {
  try {
    const { pin } = await ctx.params;
    const { nickname, emoji } = await readJson(req, schema);
    const result = await joinGame(pin, nickname, emoji);
    return Response.json(result, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
