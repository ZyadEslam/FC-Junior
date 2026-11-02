"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "@/lib/api-client";
import { ageBandLabel } from "@/lib/labels";
import { categoryCreateSchema, taskCreateSchema, type CategoryCreateInput, type TaskCreateInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";

type CategoryRow = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  _count: { children: number; tasks: number };
};

type TaskRow = {
  id: string;
  slug: string;
  ageBand: keyof typeof ageBandLabel;
  title: string;
  summary: string;
  difficulty: string;
  points: number;
  estimatedMinutes: number;
  isPublished: boolean;
  rubric: string[];
  testCases: string[];
  categories: { id: string; name: string }[];
};

type CategoryResponse = { categories: CategoryRow[] };
type TaskResponse = { tasks: TaskRow[] };

const INITIAL_TASK = {
  title: "",
  summary: "",
  instructions: "",
  deliverable: "",
  starter: "",
  question: "",
  rubricText: "",
  testCasesText: "",
  ageBand: "AGE_8_10" as keyof typeof ageBandLabel,
  difficulty: "BEGINNER" as TaskCreateInput["difficulty"],
  points: 10,
  estimatedMinutes: 30,
  categoryIds: [] as string[],
  isPublished: false,
};

function slugFromTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminChallengesPage() {
  const queryClient = useQueryClient();
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryNotice, setCategoryNotice] = useState<string | null>(null);
  const [task, setTask] = useState(INITIAL_TASK);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskNotice, setTaskNotice] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin", "challenge-categories"],
    queryFn: async () => (await api.get<CategoryResponse>("/admin/categories")).data.categories,
  });
  const tasksQuery = useQuery({
    queryKey: ["admin", "challenges"],
    queryFn: async () => (await api.get<TaskResponse>("/admin/tasks")).data.tasks,
  });

  const addCategory = useMutation({
    mutationFn: async (input: CategoryCreateInput) =>
      (await api.post("/admin/categories", input)).data,
    onSuccess: async () => {
      setCategoryName("");
      setCategoryDescription("");
      setCategoryError(null);
      setCategoryNotice("Category added.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "challenge-categories"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
    },
    onError: (error) => setCategoryError(apiErrorMessage(error)),
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await api.patch(`/admin/categories/${id}`, { isActive })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "challenge-categories"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
    },
  });

  const addTask = useMutation({
    mutationFn: async (input: TaskCreateInput) =>
      (await api.post("/admin/tasks", input)).data,
    onSuccess: async () => {
      setTask(INITIAL_TASK);
      setTaskError(null);
      setTaskNotice("Challenge added.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "challenges"] });
    },
    onError: (error) => setTaskError(apiErrorMessage(error)),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      (await api.patch(`/admin/tasks/${id}`, { isPublished })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "challenges"] });
    },
  });

  function submitCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategoryError(null);
    setCategoryNotice(null);
    const parsed = categoryCreateSchema.safeParse({ name: categoryName, description: categoryDescription });
    if (!parsed.success) {
      setCategoryError(parsed.error.issues[0]?.message ?? "Check the category details.");
      return;
    }
    addCategory.mutate(parsed.data);
  }

  function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTaskError(null);
    setTaskNotice(null);
    const parsed = taskCreateSchema.safeParse({
      slug: slugFromTitle(task.title),
      ageBand: task.ageBand,
      title: task.title,
      summary: task.summary,
      instructions: task.instructions,
      deliverable: task.deliverable,
      starter: task.starter,
      question: task.question,
      rubric: task.rubricText.split("\n").map((line) => line.trim()).filter(Boolean),
      testCases: task.testCasesText.split("\n").map((line) => line.trim()).filter(Boolean),
      difficulty: task.difficulty,
      points: Number(task.points),
      estimatedMinutes: Number(task.estimatedMinutes),
      categoryIds: task.categoryIds,
      isPublished: task.isPublished,
    });
    if (!parsed.success) {
      setTaskError(parsed.error.issues[0]?.message ?? "Check the challenge details.");
      return;
    }
    addTask.mutate(parsed.data);
  }

  function toggleTaskCategory(categoryId: string) {
    setTask((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  }

  const activeCategories = categoriesQuery.data?.filter((category) => category.isActive) ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-taxi-300">Challenge library</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">Categories and challenges</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
          Add project categories, write age-appropriate challenges, and include checks for the expected result.
        </p>
      </header>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Card className="border-stone-700 bg-[#292620] text-white" shadow="none">
          <CardBody>
            <h2 className="font-display text-xl font-bold">Add a category</h2>
            <p className="mt-1 text-sm text-stone-400">For example, Scratch or Web Design.</p>
            <form onSubmit={submitCategory} className="mt-5 space-y-4">
              <Field label="Category name" labelClassName="text-stone-200">
                <Input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} maxLength={50} />
              </Field>
              <Field label="Short description" labelClassName="text-stone-200">
                <Textarea
                  value={categoryDescription}
                  onChange={(event) => setCategoryDescription(event.target.value)}
                  maxLength={200}
                  className="min-h-20"
                />
              </Field>
              {categoryError && <p role="alert" className="text-sm text-rose-300">{categoryError}</p>}
              {categoryNotice && <p role="status" className="text-sm text-emerald-300">{categoryNotice}</p>}
              <Button type="submit" loading={addCategory.isPending}>Add category</Button>
            </form>
          </CardBody>
        </Card>

        <Card className="border-stone-700 bg-[#292620] text-white" shadow="none">
          <CardBody>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold">Available categories</h2>
                <p className="mt-1 text-sm text-stone-400">Inactive categories stay on existing child profiles.</p>
              </div>
            </div>
            {categoriesQuery.isLoading ? (
              <p className="mt-4 text-sm text-stone-400">Loading categories…</p>
            ) : categoriesQuery.isError ? (
              <p role="alert" className="mt-4 text-sm text-rose-300">
                Couldn&apos;t load categories: {apiErrorMessage(categoriesQuery.error)}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-stone-700">
                {categoriesQuery.data?.map((category) => (
                  <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="mt-0.5 text-xs text-stone-400">
                        {category._count.tasks} challenges · {category._count.children} children
                        {!category.isActive && " · inactive"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      loading={updateCategory.isPending}
                      onClick={() => updateCategory.mutate({ id: category.id, isActive: !category.isActive })}
                    >
                      {category.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {updateCategory.isError && (
              <p role="alert" className="mt-2 text-sm text-rose-300">
                Couldn&apos;t update category: {apiErrorMessage(updateCategory.error)}
              </p>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-stone-700 bg-[#292620] text-white" shadow="none">
          <CardBody>
            <h2 className="font-display text-xl font-bold">Write a challenge</h2>
            <p className="mt-1 text-sm text-stone-400">A challenge is a question or guided project on a student&apos;s board.</p>
            <form onSubmit={submitTask} className="mt-5 space-y-4">
              <Field label="Challenge title" labelClassName="text-stone-200">
                <Input value={task.title} onChange={(event) => setTask({ ...task, title: event.target.value })} maxLength={120} />
              </Field>
              <Field label="Short introduction" labelClassName="text-stone-200">
                <Textarea value={task.summary} onChange={(event) => setTask({ ...task, summary: event.target.value })} maxLength={300} />
              </Field>
              <Field label="Instructions" labelClassName="text-stone-200">
                <Textarea
                  value={task.instructions}
                  onChange={(event) => setTask({ ...task, instructions: event.target.value })}
                  maxLength={8000}
                  className="min-h-36"
                />
              </Field>
              <Field label="Starter (optional)" labelClassName="text-stone-200">
                <Textarea
                  value={task.starter}
                  onChange={(event) => setTask({ ...task, starter: event.target.value })}
                  maxLength={2000}
                  className="min-h-24"
                />
              </Field>
              <Field label="Challenge question (optional)" labelClassName="text-stone-200">
                <Textarea
                  value={task.question}
                  onChange={(event) => setTask({ ...task, question: event.target.value })}
                  maxLength={2000}
                  className="min-h-24"
                />
              </Field>
              <Field label="What the student should submit" labelClassName="text-stone-200">
                <Textarea value={task.deliverable} onChange={(event) => setTask({ ...task, deliverable: event.target.value })} maxLength={500} />
              </Field>
              <Field label="Success checklist (one item per line)" labelClassName="text-stone-200">
                <Textarea
                  value={task.rubricText}
                  onChange={(event) => setTask({ ...task, rubricText: event.target.value })}
                  className="min-h-28"
                />
              </Field>
              <Field label="Test cases or expected checks (one per line)" labelClassName="text-stone-200" hint="Optional. These are displayed with the challenge instructions.">
                <Textarea
                  value={task.testCasesText}
                  onChange={(event) => setTask({ ...task, testCasesText: event.target.value })}
                  className="min-h-24"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-stone-200">
                  Age group
                  <select
                    value={task.ageBand}
                    onChange={(event) => setTask({ ...task, ageBand: event.target.value as TaskCreateInput["ageBand"] })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-stone-600 bg-[#1A1814] px-3"
                  >
                    {Object.entries(ageBandLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-stone-200">
                  Difficulty
                  <select
                    value={task.difficulty}
                    onChange={(event) => setTask({ ...task, difficulty: event.target.value as TaskCreateInput["difficulty"] })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-stone-600 bg-[#1A1814] px-3"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </label>
                <Field label="Stars awarded" labelClassName="text-stone-200">
                  <Input type="number" min={1} max={1000} value={task.points} onChange={(event) => setTask({ ...task, points: Number(event.target.value) })} />
                </Field>
                <Field label="Estimated minutes" labelClassName="text-stone-200">
                  <Input type="number" min={5} max={600} value={task.estimatedMinutes} onChange={(event) => setTask({ ...task, estimatedMinutes: Number(event.target.value) })} />
                </Field>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-stone-200">Categories</legend>
                {categoriesQuery.isError ? (
                  <p className="text-sm text-rose-300">Categories could not be loaded.</p>
                ) : activeCategories.length === 0 ? (
                  <p className="text-sm text-stone-400">Add or activate a category first.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {activeCategories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 rounded-lg border border-stone-700 px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={task.categoryIds.includes(category.id)}
                          onChange={() => toggleTaskCategory(category.id)}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
              <label className="flex items-center gap-2 text-sm text-stone-200">
                <input type="checkbox" checked={task.isPublished} onChange={(event) => setTask({ ...task, isPublished: event.target.checked })} />
                Publish as soon as it is added
              </label>
              {taskError && <p role="alert" className="text-sm text-rose-300">{taskError}</p>}
              {taskNotice && <p role="status" className="text-sm text-emerald-300">{taskNotice}</p>}
              <Button type="submit" loading={addTask.isPending}>Save challenge</Button>
            </form>
          </CardBody>
        </Card>

        <Card className="border-stone-700 bg-[#292620] text-white" shadow="none">
          <CardBody>
            <h2 className="font-display text-xl font-bold">Challenge library</h2>
            <p className="mt-1 text-sm text-stone-400">Unpublished challenges stay out of student boards.</p>
            {tasksQuery.isLoading ? (
              <p className="mt-4 text-sm text-stone-400">Loading challenges…</p>
            ) : tasksQuery.isError ? (
              <p role="alert" className="mt-4 text-sm text-rose-300">
                Couldn&apos;t load challenges: {apiErrorMessage(tasksQuery.error)}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-stone-700">
                {tasksQuery.data?.map((challenge) => (
                  <li key={challenge.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{challenge.title}</p>
                        <p className="mt-1 text-xs text-stone-400">
                          {ageBandLabel[challenge.ageBand]} · {challenge.difficulty.toLowerCase()} · {challenge.points} stars
                        </p>
                        <p className="mt-1 text-xs text-stone-400">
                          {challenge.categories.map((category) => category.name).join(", ")} · {challenge.testCases.length} test checks
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        loading={updateTask.isPending}
                        onClick={() => updateTask.mutate({ id: challenge.id, isPublished: !challenge.isPublished })}
                      >
                        {challenge.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {updateTask.isError && (
              <p role="alert" className="mt-2 text-sm text-rose-300">
                Couldn&apos;t update challenge: {apiErrorMessage(updateTask.error)}
              </p>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
