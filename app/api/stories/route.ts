import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readJson, errorResponse } from "@/lib/api";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().max(300).optional().nullable(),
  icon: z.string().trim().max(8).optional().nullable(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().nullable(),
  visibleWords: z.number().int().min(1).max(5).default(1),
  targetWords: z.number().int().min(2).max(500).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await readJson(req, schema);
    const story = await prisma.story.create({
      data: {
        title: body.title,
        description: body.description?.trim() || null,
        icon: body.icon?.trim() || null,
        difficulty: body.difficulty ?? null,
        visibleWords: body.visibleWords,
        targetWords: body.targetWords ?? null,
      },
    });
    return Response.json({ id: story.id }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
