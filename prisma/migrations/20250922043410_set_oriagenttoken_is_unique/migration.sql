/*
  Warnings:

  - A unique constraint covering the columns `[oriagentToken]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Setting_oriagentToken_key" ON "public"."Setting"("oriagentToken");
