import { z } from "zod";
import { readJson, errorResponse } from "@/lib/api";
import { createGame } from "@/lib/game/state";

export const runtime = "nodejs";

const schema = z.object({ quizId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { quizId } = await readJson(req, schema);
    const result = await createGame(quizId);
    return Response.json(result, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
