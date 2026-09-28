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
  ageBand: ageBandSchema,
  avatarColor: z.enum(["emerald", "sky", "violet", "rose", "amber", "indigo"]).default("emerald"),
});
export type ChildCreateInput = z.infer<typeof childCreateSchema>;

export const childUpdateSchema = z.object({
  weeklyGoalCents: z.number().int().min(500, "Minimum weekly goal is $5.").max(100000, "Maximum weekly goal is $1,000."),
});
export type ChildUpdateInput = z.infer<typeof childUpdateSchema>;

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
    .min(100, "Minimum support is $1.")
    .max(50000, "Maximum single support is $500."),
  message: z.string().trim().max(140, "Keep the message under 140 characters.").optional(),
});
export type DonationCreateInput = z.infer<typeof donationCreateSchema>;
