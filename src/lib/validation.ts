import { z } from "zod";

/** Shared zod schemas — single source of truth for API + client forms. */

export const ageBandSchema = z.enum(["AGE_8_10", "AGE_11_13", "AGE_14_17"]);

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(60),
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100),
  role: z.enum(["PARENT", "DONOR"]),
  inviteCode: z.string().trim().max(40).optional(),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const childCreateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(20)
    .regex(/^[a-zA-Z\u0600-\u06FF' -]+$/, "Letters, spaces and hyphens only."),
  age: z.number().int().min(8, "Age must be at least 8.").max(17, "Age must be 17 or younger."),
  categoryIds: z.array(z.string().min(1)).min(1, "Choose at least one challenge category.").max(20),
  avatarColor: z.enum(["emerald", "sky", "violet", "rose", "amber", "indigo"]).default("emerald"),
  pin: z.string().regex(/^\d{4,8}$/, "Use a 4 to 8 digit PIN."),
}).superRefine((value, ctx) => {
  if (new Set(value.categoryIds).size !== value.categoryIds.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["categoryIds"], message: "Remove duplicate categories." });
  }
});
export type ChildCreateInput = z.infer<typeof childCreateSchema>;

export const childSignInSchema = z.object({
  studioCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/, "Enter the 6-character Studio Code."),
  pin: z.string().regex(/^\d{4,8}$/, "Enter your 4 to 8 digit PIN."),
});
export type ChildSignInInput = z.infer<typeof childSignInSchema>;

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(50),
  description: z.string().trim().max(200).default(""),
});
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(200).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "Provide at least one category field to update.");

const taskFieldsSchema = z.object({
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  ageBand: ageBandSchema,
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(10).max(300),
  instructions: z.string().trim().min(20).max(8000),
  deliverable: z.string().trim().min(5).max(500),
  starter: z.string().trim().max(2000).default(""),
  question: z.string().trim().max(2000).default(""),
  rubric: z.array(z.string().trim().min(2).max(300)).min(1).max(20),
  testCases: z.array(z.string().trim().min(1).max(1000)).max(50).default([]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  points: z.number().int().min(1).max(1000),
  estimatedMinutes: z.number().int().min(5).max(600),
  categoryIds: z.array(z.string().min(1)).min(1).max(20),
  isPublished: z.boolean().default(false),
});

function rejectDuplicateCategories(categoryIds: string[] | undefined, ctx: z.RefinementCtx) {
  if (categoryIds && new Set(categoryIds).size !== categoryIds.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["categoryIds"], message: "Remove duplicate categories." });
  }
}

export const taskCreateSchema = taskFieldsSchema.superRefine((value, ctx) => {
  rejectDuplicateCategories(value.categoryIds, ctx);
});
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export const taskUpdateSchema = taskFieldsSchema
  .partial()
  .superRefine((value, ctx) => rejectDuplicateCategories(value.categoryIds, ctx))
  .refine((value) => Object.keys(value).length > 0, "Provide at least one challenge field to update.");

export const childUpdateSchema = z.object({
  weeklyGoalCents: z.number().int().min(500, "Minimum weekly goal is $5.").max(100000, "Maximum weekly goal is $1,000."),
});
export type ChildUpdateInput = z.infer<typeof childUpdateSchema>;

export const studioAccessUpdateSchema = z
  .object({
    studioCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/, "Use six letters or numbers.").optional(),
    pin: z.string().regex(/^\d{4,8}$/, "Use a 4 to 8 digit PIN.").optional(),
  })
  .refine((value) => value.studioCode || value.pin, "Change the Studio Code or reset the PIN.");
export type StudioAccessUpdateInput = z.infer<typeof studioAccessUpdateSchema>;

export const submissionCreateSchema = z.object({
  childId: z.string().min(1),
  taskId: z.string().min(1),
  note: z
    .string()
    .trim()
    .min(20, "Tell the family a bit more about what you built (at least 20 characters).")
    .max(600, "Keep it under 600 characters."),
  proofLink: z
    .string()
    .trim()
    .url("That doesn't look like a valid link.")
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  proofImage: z
    .string()
    .startsWith("data:image/", "Proof image must be an image file.")
    .max(2_800_000, "Image must be under ~2 MB.")
    .optional(),
});
export type SubmissionCreateInput = z.infer<typeof submissionCreateSchema>;

export const reviewSchema = z
  .object({
    action: z.enum(["APPROVE", "REQUEST_CHANGES"]),
    feedback: z.string().trim().max(600).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.action === "REQUEST_CHANGES" && (!val.feedback || val.feedback.length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["feedback"],
        message: "Please explain what needs fixing (at least 10 characters).",
      });
    }
  });
export type ReviewInput = z.infer<typeof reviewSchema>;

export const inviteCreateSchema = z.object({
  childId: z.string().min(1),
});

export const inviteAcceptSchema = z.object({
  relationLabel: z.string().trim().min(2, "e.g. Grandma, Uncle Sam").max(30),
});
export type InviteAcceptInput = z.infer<typeof inviteAcceptSchema>;

export const donationCreateSchema = z.object({
  childId: z.string().min(1),
  submissionId: z.string().optional(),
  amountCents: z
    .number()
    .int()
    .min(5000, "A cheer starts at EGP 50.")
    .max(500000, "A single cheer can be at most EGP 5,000."),
  message: z.string().trim().max(140, "Keep the message under 140 characters.").optional(),
});
export type DonationCreateInput = z.infer<typeof donationCreateSchema>;
