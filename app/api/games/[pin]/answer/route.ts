import { z } from "zod";
import { readJson, errorResponse } from "@/lib/api";
import { submitAnswer } from "@/lib/game/state";

export const runtime = "nodejs";

const schema = z.object({
  playerId: z.string().min(1),
  choiceId: z.string().min(1),
});

export async function POST(req: Request, ctx: RouteContext<"/api/games/[pin]/answer">) {
  try {
    const { pin } = await ctx.params;
    const { playerId, choiceId } = await readJson(req, schema);
    const result = await submitAnswer(pin, playerId, choiceId);
    return Response.json(result);
  } catch (e) {
    return errorResponse(e);
  }
}
