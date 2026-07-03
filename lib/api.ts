import type { z } from "zod";
import { GameError } from "@/lib/game/state";

export async function readJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new GameError("Invalid JSON body", 400);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new GameError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }
  return parsed.data;
}

export function errorResponse(e: unknown): Response {
  if (e instanceof GameError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  console.error(e);
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}
