import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { ageBandLabel } from "@/lib/labels";
import { fail, ok, parseBody, requireChildWorkspace } from "@/lib/api";

const generateSchema = z.object({ categoryId: z.string().min(1) });

const generatedChallengeSchema = z.object({
  title: z.string().trim().min(5).max(120),
  summary: z.string().trim().min(10).max(300),
  question: z.string().trim().min(10).max(2000),
  instructions: z.string().trim().min(20).max(4000),
  deliverable: z.string().trim().min(5).max(500),
  checklist: z.array(z.string().trim().min(3).max(300)).min(3).max(8),
  testCases: z.array(z.string().trim().min(3).max(300)).min(2).max(8),
  estimatedMinutes: z.number().int().min(10).max(180),
});

type Ctx = { params: { childId: string } };

export async function POST(req: Request, { params }: Ctx) {
  const workspace = await requireChildWorkspace(params.childId);
  if ("error" in workspace) return workspace.error;

  const parsed = await parseBody(req, generateSchema);
  if (parsed.error) return parsed.error;

  const child = await db.child.findFirst({
    where: {
      id: workspace.child.id,
      categories: { some: { id: parsed.data.categoryId, isActive: true } },
    },
    select: {
      id: true,
      ageBand: true,
      categories: {
        where: { id: parsed.data.categoryId, isActive: true },
        select: { id: true, name: true, description: true },
      },
      categoryProgress: {
        where: { categoryId: parsed.data.categoryId },
        select: { solvedCount: true, level: true },
      },
    },
  });
  if (!child) return fail("Child or selected category not found.", 404);

  const existingToday = await db.task.count({
    where: {
      generatedForChildId: child.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (existingToday >= 10) {
    return fail("This child has reached today's challenge generation limit. Try again tomorrow.", 429);
  }

  const category = child.categories[0];
  const progress = child.categoryProgress[0];
  const solvedCount = progress?.solvedCount ?? 0;
  const level = Math.floor(solvedCount / 2) + 1;
  const challengeLevel = Math.min(level, 8);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fail("AI challenge generation is not configured. Ask an administrator to add the Groq API key.", 503);
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const systemPrompt = [
    "You create safe, age-appropriate programming challenges for a supervised learning app.",
    "Return only a JSON object with keys: title, summary, question, instructions, deliverable, checklist, testCases, estimatedMinutes.",
    "question must clearly state the specific challenge the student should solve.",
    "checklist must contain 3 to 6 concrete, testable completion items.",
    "testCases must contain 2 to 6 plain-language input/output or behavior checks appropriate to the category; do not claim unexecuted checks have passed.",
    "Do not ask for personal information, account creation, external contact, purchases, or public sharing.",
    "Use clear, encouraging language. Keep the work achievable in the time estimate.",
  ].join(" ");
  const userPrompt = [
    `Create one new ${category.name} programming challenge.`,
    `Category description: ${category.description || "No additional description."}`,
    `Age group: ${ageBandLabel[child.ageBand]}. Do not infer or request exact age.`,
    `Category level: ${level}; calibrate challenge difficulty to level ${challengeLevel}. The level advances by one after every two parent-approved solved challenges.`,
    `Previously solved challenges in this category: ${solvedCount}.`,
    level === 1
      ? "Keep the task introductory and provide a useful starter."
      : level > 8
        ? "This category is beyond the level 8 difficulty cap. Keep the work age-appropriate and vary or deepen concepts instead of making it harder or longer."
        : `Increase the challenge slightly for level ${level}; use concepts introduced in earlier levels and add one new reasoning step. Do not make it significantly longer.`,
    "Do not include a student's name or any identifying details.",
  ].join("\n");

  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_completion_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  } catch (error) {
    console.error("Groq challenge request failed.", error);
    return fail(
      error instanceof Error && error.name === "TimeoutError"
        ? "The challenge generator took too long. Please try again."
        : "The challenge generator could not connect. Please try again.",
      502
    );
  }

  if (!response.ok) {
    console.error("Groq challenge request returned an error.", {
      status: response.status,
      model,
    });
    return fail(
      response.status === 429
        ? "The challenge generator is busy. Please wait a moment and try again."
        : "The challenge generator could not create a challenge. Please try again.",
      response.status === 429 ? 429 : 502
    );
  }

  let content: string | undefined;
  try {
    const completion: unknown = await response.json();
    const completionSchema = z.object({
      choices: z.array(z.object({
        message: z.object({ content: z.string().nullable() }),
      })).min(1),
    });
    const parsedCompletion = completionSchema.safeParse(completion);
    if (!parsedCompletion.success) {
      console.error("Groq returned an unexpected challenge response.");
      return fail("The challenge generator returned an invalid response. Please try again.", 502);
    }
    content = parsedCompletion.data.choices[0].message.content ?? undefined;
  } catch (error) {
    console.error("Could not read Groq challenge response.", error);
    return fail("The challenge generator returned an unreadable response. Please try again.", 502);
  }

  let generated: z.infer<typeof generatedChallengeSchema>;
  try {
    const decoded: unknown = JSON.parse(content ?? "");
    const validated = generatedChallengeSchema.safeParse(decoded);
    if (!validated.success) {
      console.error("Groq challenge did not match the required challenge format.", validated.error.issues);
      return fail("The generated challenge was incomplete. Please try again.", 502);
    }
    generated = validated.data;
  } catch (error) {
    console.error("Groq challenge was not valid JSON.", error);
    return fail("The generated challenge was not readable. Please try again.", 502);
  }

  const task = await db.task.create({
    data: {
      slug: `ai-${randomUUID()}`,
      ageBand: child.ageBand,
      title: generated.title,
      summary: generated.summary,
      question: generated.question,
      instructions: generated.instructions,
      deliverable: generated.deliverable,
      rubric: generated.checklist,
      testCases: generated.testCases,
      difficulty: level < 3 ? "BEGINNER" : level < 6 ? "INTERMEDIATE" : "ADVANCED",
      points: Math.min(100, 10 + (level - 1) * 5),
      estimatedMinutes: generated.estimatedMinutes,
      order: (await db.task.count()) + 1,
      isPublished: true,
      generatedForChildId: child.id,
      categories: { connect: [{ id: category.id }] },
    },
    select: { id: true },
  });

  return ok({ taskId: task.id, categoryLevel: level }, { status: 201 });
}
