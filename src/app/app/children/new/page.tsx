"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { childCreateSchema, type ChildCreateInput } from "@/lib/validation";
import { useCreateChild } from "@/hooks/use-children";
import { apiErrorMessage } from "@/lib/api-client";
import { ageBandLabel, avatarColorMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Field, Input } from "@/components/ui/input";

const COLORS = ["emerald", "sky", "violet", "rose", "amber", "indigo"] as const;
const BANDS = ["AGE_8_10", "AGE_11_13", "AGE_14_17"] as const;

export default function NewChildPage() {
  const router = useRouter();
  const toast = useToast();
  const createChild = useCreateChild();

  const [firstName, setFirstName] = useState("");
  const [ageBand, setAgeBand] = useState<ChildCreateInput["ageBand"]>("AGE_8_10");
  const [avatarColor, setAvatarColor] = useState<(typeof COLORS)[number]>("emerald");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = childCreateSchema.safeParse({ firstName, ageBand, avatarColor });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    try {
      const { id } = await createChild.mutateAsync(parsed.data);
      toast.push({
        variant: "success",
        title: `${parsed.data.firstName} is on board 🎉`,
        description: "Their mission board is unlocked and ready.",
      });
      router.push(`/app/children/${id}`);
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <Link
        href="/app/overview"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to overview
      </Link>

      <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-stone-900">Add a builder</h2>
      <p className="mt-1 text-sm text-stone-500">
        Custodial profiles only: you own the account, they get the fun.
      </p>

      <Card className="mt-6">
        <CardBody className="space-y-5">
          {/* privacy note */}
          <div className="flex items-start gap-3 rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-inset ring-brand-100">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
            <p className="text-[13px] leading-snug text-brand-900">
              We never ask for a last name, exact birthdate, photo, or location.
              The family circle only ever sees a first name and an age band.
            </p>
          </div>

          {/* live preview */}
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <Avatar name={firstName || "?"} color={avatarColor} size="lg" />
            <div>
              <p className="text-sm font-bold text-stone-900">{firstName || "Your child"}</p>
              <p className="text-xs text-stone-500">{ageBandLabel[ageBand]}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Field label="First name" error={fieldErrors.firstName}>
              <Input
                placeholder="e.g. Maya"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={20}
              />
            </Field>

            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Age band</span>
              <div className="grid grid-cols-3 gap-2">
                {BANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setAgeBand(b)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                      ageBand === b
                        ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-600/15"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                    )}
                  >
                    {ageBandLabel[b]}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[13px] text-stone-500">
                Unlocks age-appropriate missions. Exact ages are never stored or shown.
              </p>
            </div>

            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Avatar color</span>
              <div className="flex gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => setAvatarColor(c)}
                    className={cn(
                      "h-9 w-9 rounded-full transition-all",
                      avatarColorMeta[c].dot,
                      avatarColor === c
                        ? "ring-2 ring-stone-900 ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            {formError && (
              <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                {formError}
              </div>
            )}

            <Button type="submit" className="w-full" loading={createChild.isPending}>
              Create profile
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
