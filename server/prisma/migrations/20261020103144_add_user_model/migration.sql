/*
  Warnings:

  - You are about to drop the column `email` on the `google_calendar_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `google_calendar_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `google_calendar_accounts` table. All the data in the column will be lost.
  - You are about to drop the `mcp_access_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "mcp_access_tokens" DROP CONSTRAINT "mcp_access_tokens_client_id_fkey";

-- DropForeignKey
ALTER TABLE "mcp_authorization_codes" DROP CONSTRAINT "mcp_authorization_codes_client_id_fkey";

-- DropForeignKey
ALTER TABLE "mcp_oauth_grants" DROP CONSTRAINT "mcp_oauth_grants_client_id_fkey";

-- DropForeignKey
ALTER TABLE "mcp_refresh_tokens" DROP CONSTRAINT "mcp_refresh_tokens_client_id_fkey";

-- AlterTable
ALTER TABLE "google_calendar_accounts" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "picture",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "mcp_access_tokens";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "google_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "mcp_oauth_grants" ADD CONSTRAINT "mcp_oauth_grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcp_oauth_grants" ADD CONSTRAINT "mcp_oauth_grants_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "mcp_oauth_clients"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcp_authorization_codes" ADD CONSTRAINT "mcp_authorization_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcp_authorization_codes" ADD CONSTRAINT "mcp_authorization_codes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "mcp_oauth_clients"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcp_refresh_tokens" ADD CONSTRAINT "mcp_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcp_refresh_tokens" ADD CONSTRAINT "mcp_refresh_tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "mcp_oauth_clients"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_calendar_accounts" ADD CONSTRAINT "google_calendar_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "mcp_oauth_grants_user_created_idx" RENAME TO "mcp_oauth_grants_user_id_created_at_idx";
