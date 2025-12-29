-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "translatedText" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastName" DROP DEFAULT,
ALTER COLUMN "language" SET DEFAULT 'en';
