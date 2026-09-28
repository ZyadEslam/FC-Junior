"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Clock,
  ListChecks,
  PackageCheck,
  Send,
  ImagePlus,
  Link2,
  X,
  PartyPopper,
  Hourglass,
  RefreshCcw,
} from "lucide-react";
import { useCreateSubmission, useKidTask } from "@/hooks/use-submissions";
import { apiErrorMessage } from "@/lib/api-client";
import { submissionCreateSchema } from "@/lib/validation";
import { difficultyMeta } from "@/lib/labels";
import { useToast } from "@/components/ui/toast";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const MAX_IMAGE_BYTES = 1_800_000;

export function TaskDetailClient({ childId, taskId }: { childId: string; taskId: string }) {
  const { data: task, isLoading, isError } = useKidTask(childId, taskId);
  const createSubmission = useCreateSubmission(childId);
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [note, setNote] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={PackageCheck}
          title="Mission not found"
          body="This mission doesn't exist or isn't available right now."
          action={
            <Link href={`/app/kid/${childId}`}>
              <Button size="sm" variant="outline">Back to mission board</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  if (isLoading || !task) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <CardSkeleton lines={8} />
        <CardSkeleton lines={5} />
      </div>
    );
  }

  const status = task.mySubmission?.status;

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.push({ variant: "error", title: "Please pick an image file" });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.push({ variant: "error", title: "Image is too large", description: "Keep it under ~1.5 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProofImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = submissionCreateSchema.safeParse({
      childId,
      taskId,
      note,
      proofLink: proofLink || undefined,
      proofImage: proofImage ?? undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    if (!parsed.data.proofLink && !parsed.data.proofImage) {
      setFieldErrors({ proofLink: "Add a project link or a screenshot so your parent can review it." });
      return;
    }
    try {
      await createSubmission.mutateAsync(parsed.data);
      toast.push({
        variant: "success",
        title: "Submitted for review! 🚀",
        description: "Your parent will check it against the rubric.",
      });
    } catch (err) {
      toast.push({ variant: "error", title: apiErrorMessage(err) });
    }
  }

  const instructions = task.instructions.split("\n").filter(Boolean);

  return (
    <div className="space-y-5 animate-fade-in">
      <Link
        href={`/app/kid/${childId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Mission board
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* left: mission brief */}
        <div className="space-y-5">
          <Card>
            <CardBody>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={difficultyMeta[task.difficulty].chip}>
                  {difficultyMeta[task.difficulty].label}
                </Badge>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {task.points} pts
                </span>
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-stone-400">
                  <Clock className="h-3.5 w-3.5" /> ~{task.estimatedMinutes} min
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900">{task.title}</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-stone-600">{task.summary}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="text-[15px] font-bold text-stone-900">The mission</h2>
              <div className="mt-3 space-y-3">
                {instructions.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-stone-600">
                    {p}
                  </p>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="inline-flex items-center gap-2 text-[15px] font-bold text-stone-900">
                <ListChecks className="h-4 w-4 text-brand-600" /> How it&apos;s graded
              </h2>
              <ul className="mt-3 space-y-2.5">
                {task.rubric.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-stone-500">
                      {i + 1}
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-inset ring-brand-100">
                <p className="text-[13px] leading-snug text-brand-900">
                  <span className="font-bold">What to hand in: </span>
                  {task.deliverable}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* right: submission panel */}
        <div className="sticky top-24">
          {status === "APPROVED" ? (
            <Card className="border-brand-200 bg-brand-50/60">
              <CardBody className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <PartyPopper className="h-6 w-6" />
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-stone-900">Mission complete!</h2>
                <p className="mt-1 text-sm text-stone-600">
                  +{task.points} pts earned, and this post is live on your family wall.
                </p>
                <Link href={`/app/kid/${childId}`}>
                  <Button className="mt-4 w-full" variant="secondary">Pick the next mission</Button>
                </Link>
              </CardBody>
            </Card>
          ) : status === "PENDING" ? (
            <Card>
              <CardBody className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Hourglass className="h-6 w-6" />
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-stone-900">In review</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Your parent is checking this against the rubric. You&apos;ll see it on your
                  wall once approved.
                </p>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                {status === "CHANGES_REQUESTED" && task.mySubmission && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-800">
                      <RefreshCcw className="h-4 w-4" /> Almost there — tweak it
                    </p>
                    <p className="mt-1.5 whitespace-pre-line text-[13px] leading-snug text-rose-700">
                      {task.mySubmission.feedback}
                    </p>
                  </div>
                )}

                <h2 className="text-[15px] font-bold text-stone-900">
                  {status === "CHANGES_REQUESTED" ? "Resubmit your work" : "Submit your work"}
                </h2>
                <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
                  <Field
                    label="Tell the family about it"
                    error={fieldErrors.note}
                    hint="What did you build? What was tricky? (min 20 characters)"
                  >
                    <Textarea
                      placeholder="e.g. I made a dragon that flaps its wings when you click it. The sound effect took me three tries…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={600}
                      className="min-h-[110px]"
                    />
                  </Field>

                  <Field label="Project link" error={fieldErrors.proofLink}>
                    <div className="relative">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input
                        className="pl-9"
                        type="url"
                        placeholder="https://scratch.mit.edu/projects/…"
                        value={proofLink}
                        onChange={(e) => setProofLink(e.target.value)}
                      />
                    </div>
                  </Field>

                  <div>
                    <span className="mb-1.5 block text-[13px] font-medium text-stone-700">
                      …or a screenshot
                    </span>
                    {proofImage ? (
                      <div className="relative overflow-hidden rounded-xl border border-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
                        <img src={proofImage} alt="Proof preview" className="max-h-52 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProofImage(null)}
                          className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-stone-500 shadow-card hover:text-stone-800"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-7 text-stone-500 transition-colors hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700"
                      >
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-[13px] font-semibold">Upload a screenshot</span>
                        <span className="text-xs">PNG or JPG, up to ~1.5 MB</span>
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                    {fieldErrors.proofImage && (
                      <p className="mt-1.5 text-[13px] font-medium text-rose-600">{fieldErrors.proofImage}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" loading={createSubmission.isPending}>
                    <Send className="h-4 w-4" />
                    {status === "CHANGES_REQUESTED" ? "Resubmit for review" : "Submit for review"}
                  </Button>
                  <p className="text-center text-xs text-stone-400">
                    Your parent approves it before the family circle can see it.
                  </p>
                </form>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
