import { z } from "zod";
import { readJson, errorResponse } from "@/lib/api";
import { submitWord } from "@/lib/game/story";

export const runtime = "nodejs";

const schema = z.object({
  playerId: z.string().min(1),
  word: z.string().min(1),
});

export async function POST(req: Request, ctx: RouteContext<"/api/games/[pin]/word">) {
  try {
    const { pin } = await ctx.params;
    const { playerId, word } = await readJson(req, schema);
    const result = await submitWord(pin, playerId, word);
    return Response.json(result);
  } catch (e) {
    return errorResponse(e);
  }
}
