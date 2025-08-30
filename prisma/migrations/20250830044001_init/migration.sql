-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "ua" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");
