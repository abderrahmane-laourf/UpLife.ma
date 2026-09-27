-- CreateTable
CREATE TABLE "DailyReview" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "mood" INTEGER NOT NULL,
    "learned" TEXT NOT NULL,
    "tomorrow" TEXT NOT NULL,
    "highlight" TEXT,
    "challenge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReview_date_key" ON "DailyReview"("date");

-- CreateIndex
CREATE INDEX "DailyReview_userId_date_idx" ON "DailyReview"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyReview" ADD CONSTRAINT "DailyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
