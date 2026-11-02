ALTER TABLE "Task"
ADD COLUMN "starter" TEXT NOT NULL DEFAULT '',
ADD COLUMN "question" TEXT NOT NULL DEFAULT '',
ADD COLUMN "generatedForChildId" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Task_generatedForChildId_createdAt_idx" ON "Task"("generatedForChildId", "createdAt");
ALTER TABLE "Task"
ADD CONSTRAINT "Task_generatedForChildId_fkey"
FOREIGN KEY ("generatedForChildId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CategoryProgress" (
  "id" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "solvedCount" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CategoryProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CategoryProgress_childId_categoryId_key" ON "CategoryProgress"("childId", "categoryId");
CREATE INDEX "CategoryProgress_childId_idx" ON "CategoryProgress"("childId");
ALTER TABLE "CategoryProgress" ADD CONSTRAINT "CategoryProgress_childId_fkey"
FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CategoryProgress" ADD CONSTRAINT "CategoryProgress_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "CategoryProgress" ("id", "childId", "categoryId", "solvedCount", "level", "updatedAt")
SELECT
  'category-progress-' || submission."childId" || '-' || category."id",
  submission."childId",
  category."id",
  COUNT(DISTINCT submission."id")::INTEGER,
  (COUNT(DISTINCT submission."id") / 2 + 1)::INTEGER,
  CURRENT_TIMESTAMP
FROM "Submission" AS submission
JOIN "Task" AS task ON task."id" = submission."taskId"
JOIN "_CategoryToTask" AS task_category ON task_category."B" = task."id"
JOIN "Category" AS category ON category."id" = task_category."A"
WHERE submission."status" = 'APPROVED'
GROUP BY submission."childId", category."id";
