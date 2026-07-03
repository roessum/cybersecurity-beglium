import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readJson, errorResponse } from "@/lib/api";
import { GameError } from "@/lib/game/state";

export const runtime = "nodejs";

const choiceSchema = z.object({
  text: z.string().trim().min(1, "Answer text is required").max(120),
  correct: z.boolean(),
});

const questionSchema = z.object({
  text: z.string().trim().min(1, "Question text is required").max(240),
  timeLimitSec: z.number().int().min(5).max(120).default(20),
  choices: z
    .array(choiceSchema)
    .min(2, "Add at least two answers")
    .max(4)
    .refine(
      (cs) => cs.filter((c) => c.correct).length === 1,
      "Mark exactly one answer as correct"
    ),
});

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  department: z.string().trim().max(60).optional().nullable(),
  description: z.string().trim().max(300).optional().nullable(),
  icon: z.string().trim().max(8).optional().nullable(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().nullable(),
  questions: z.array(questionSchema).min(1, "Add at least one question").max(50),
});

export async function POST(req: Request) {
  try {
    const body = await readJson(req, schema);
    const department = body.department?.trim() || null;

    if (department) {
      const clash = await prisma.quiz.findUnique({ where: { department } });
      if (clash) {
        throw new GameError("A session for that department already exists", 409);
      }
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: body.title,
        department,
        description: body.description?.trim() || null,
        icon: body.icon?.trim() || null,
        difficulty: body.difficulty ?? null,
        questions: {
          create: body.questions.map((q, qi) => ({
            order: qi,
            text: q.text,
            timeLimitSec: q.timeLimitSec,
            choices: {
              create: q.choices.map((c, ci) => ({
                order: ci,
                text: c.text,
                isCorrect: c.correct,
              })),
            },
          })),
        },
      },
    });

    return Response.json({ id: quiz.id }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
