"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { childCreateSchema, type ChildCreateInput } from "@/lib/validation";
import { useCreateChild } from "@/hooks/use-children";
import { apiErrorMessage } from "@/lib/api-client";
import { avatarColorMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Field, Input } from "@/components/ui/input";

const COLORS = ["emerald", "sky", "violet", "rose", "amber", "indigo"] as const;
type CategoryOption = { id: string; name: string; description: string };

export default function NewChildPage() {
  const router = useRouter();
  const toast = useToast();
  const createChild = useCreateChild();

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [avatarColor, setAvatarColor] = useState<(typeof COLORS)[number]>("emerald");
  const [pin, setPin] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<{ categories: CategoryOption[] }>("/categories")).data.categories,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = childCreateSchema.safeParse({
      firstName,
      age: age ? Number(age) : undefined,
      categoryIds,
      avatarColor,
      pin,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    try {
      const { id, studioCode } = await createChild.mutateAsync(parsed.data);
      toast.push({
        variant: "success",
        title: `${parsed.data.firstName} is in!`,
        description: `Their Studio Code is ${studioCode}. Save it somewhere private.`,
      });
      router.push(`/app/children/${id}`);
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  function toggleCategory(id: string) {
    setCategoryIds((selected) =>
      selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
    );
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <Link
        href="/app/overview"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        ← Back to overview
      </Link>

      <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-stone-900">Add a child</h2>
      <p className="mt-1 text-sm text-stone-500">
        Choose their age and the kinds of projects they would enjoy.
      </p>

      <Card className="mt-6">
        <CardBody className="space-y-5">
          {/* privacy note */}
          <div className="flex items-start gap-3 rounded-xl bg-taxi-50 px-4 py-3 ring-1 ring-inset ring-taxi-100">
            <p className="text-[13px] leading-snug text-taxi-900">
              We only ask for their first name and age. Their exact age stays private to your family;
              invited supporters only see an age group.
            </p>
          </div>

          {/* live preview */}
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <Avatar name={firstName || "?"} color={avatarColor} size="lg" />
            <div>
              <p className="text-sm font-bold text-stone-900">{firstName || "Your child"}</p>
              <p className="text-xs text-stone-500">
                {age ? `Age ${age}` : "Choose an age"} · {categoryIds.length} project {categoryIds.length === 1 ? "category" : "categories"}
              </p>
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

            <Field label="Age" error={fieldErrors.age}>
              <select
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className="h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-800 focus:border-taxi-600 focus:outline-none focus:ring-2 focus:ring-taxi-600/15"
                required
              >
                <option value="">Select age</option>
                {Array.from({ length: 10 }, (_, index) => index + 8).map((value) => (
                  <option key={value} value={value}>{value} years old</option>
                ))}
              </select>
              <p className="mt-1.5 text-[13px] text-stone-500">
                We use age to choose suitable projects. Supporters only see an age group.
              </p>
            </Field>

            <Field label="Private Studio PIN" error={fieldErrors.pin}>
              <Input
                type="password"
                inputMode="numeric"
                placeholder="4 to 8 digits"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
              />
              <p className="mt-1.5 text-[13px] text-stone-500">Your child uses this PIN with their Studio Code. Never reuse your own password.</p>
            </Field>

            <div>
              <span className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                Project categories
              </span>
              <p className="mb-3 text-sm text-stone-500">
                Select all the topics they would like to explore.
              </p>
              {categoriesQuery.isLoading ? (
                <p className="text-sm text-stone-500">Loading categories…</p>
              ) : categoriesQuery.isError ? (
                <p role="alert" className="text-sm text-flame-700">
                  Couldn&apos;t load project categories: {apiErrorMessage(categoriesQuery.error)}
                </p>
              ) : categoriesQuery.data?.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {categoriesQuery.data.map((category) => {
                    const selected = categoryIds.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        onClick={() => toggleCategory(category.id)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-left transition-colors",
                          selected
                            ? "border-taxi-600 bg-taxi-50 ring-2 ring-taxi-600/15"
                            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                        )}
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                          <span className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border text-xs",
                            selected ? "border-taxi-700 bg-taxi-600 text-white" : "border-stone-300 bg-white"
                          )}>
                            {selected ? "✓" : ""}
                          </span>
                          {category.name}
                        </span>
                        {category.description && (
                          <span className="mt-1 block pl-7 text-xs leading-relaxed text-stone-500">
                            {category.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-stone-500">There are no active categories yet.</p>
              )}
              {fieldErrors.categoryIds && (
                <p className="mt-1 text-[13px] text-flame-700">{fieldErrors.categoryIds}</p>
              )}
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
