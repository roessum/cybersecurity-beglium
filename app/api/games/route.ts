import { z } from "zod";
import { readJson, errorResponse } from "@/lib/api";
import { createGame } from "@/lib/game/state";
import { createStoryGame } from "@/lib/game/story";

export const runtime = "nodejs";

const schema = z.union([
  z.object({ quizId: z.string().min(1) }),
  z.object({ storyId: z.string().min(1) }),
]);

export async function POST(req: Request) {
  try {
    const body = await readJson(req, schema);
    const result =
      "storyId" in body
        ? await createStoryGame(body.storyId)
        : await createGame(body.quizId);
    return Response.json(result, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
