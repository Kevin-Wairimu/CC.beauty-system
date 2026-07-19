-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_sessionId_idx" ON "Appointment"("sessionId");
