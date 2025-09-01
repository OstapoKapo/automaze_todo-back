-- CreateTable
CREATE TABLE "public"."security_logs" (
    "logID" SERIAL NOT NULL,
    "personID" INTEGER NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "ipAddress" VARCHAR(50) NOT NULL,
    "userAgent" TEXT NOT NULL,
    "eventTime" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("logID")
);

-- AddForeignKey
ALTER TABLE "public"."security_logs" ADD CONSTRAINT "security_logs_personID_fkey" FOREIGN KEY ("personID") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
