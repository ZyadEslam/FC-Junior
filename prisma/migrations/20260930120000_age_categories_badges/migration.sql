ALTER TABLE "Child"
ADD COLUMN "age" INTEGER;

ALTER TABLE "Task"
ADD COLUMN "testCases" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "Task" DROP COLUMN "category";
DROP TYPE "TaskCategory";

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_isActive_name_idx" ON "Category"("isActive", "name");

INSERT INTO "Category" ("id", "slug", "name", "description") VALUES
  ('category_scratch', 'scratch', 'Scratch', 'Visual programming and creative coding.'),
  ('category_mit_app_inventor', 'mit-app-inventor', 'MIT App Inventor', 'Build mobile apps with visual blocks.'),
  ('category_web_design', 'web-design', 'Web Design', 'Create websites with HTML, CSS, and JavaScript.'),
  ('category_python_problem_solving', 'python-problem-solving', 'Python Problem Solving', 'Learn Python through guided programming problems.');

CREATE TABLE "_CategoryToChild" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CategoryToChild_AB_unique" ON "_CategoryToChild"("A", "B");
CREATE INDEX "_CategoryToChild_B_index" ON "_CategoryToChild"("B");
ALTER TABLE "_CategoryToChild" ADD CONSTRAINT "_CategoryToChild_A_fkey"
  FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToChild" ADD CONSTRAINT "_CategoryToChild_B_fkey"
  FOREIGN KEY ("B") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "_CategoryToTask" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CategoryToTask_AB_unique" ON "_CategoryToTask"("A", "B");
CREATE INDEX "_CategoryToTask_B_index" ON "_CategoryToTask"("B");
ALTER TABLE "_CategoryToTask" ADD CONSTRAINT "_CategoryToTask_A_fkey"
  FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToTask" ADD CONSTRAINT "_CategoryToTask_B_fkey"
  FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_CategoryToChild" ("A", "B")
SELECT 'category_scratch', "id" FROM "Child";

INSERT INTO "_CategoryToTask" ("A", "B")
SELECT 'category_scratch', "id" FROM "Task";
