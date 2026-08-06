-- AlterTable
ALTER TABLE "WeddingSite"
ADD COLUMN "coupleDetailsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "brideFullName" TEXT,
ADD COLUMN "brideParents" TEXT,
ADD COLUMN "bridePhotoUrl" TEXT,
ADD COLUMN "groomFullName" TEXT,
ADD COLUMN "groomParents" TEXT,
ADD COLUMN "groomPhotoUrl" TEXT,
ADD COLUMN "quoteEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "quoteText" TEXT,
ADD COLUMN "quoteSource" TEXT,
ADD COLUMN "storyTimelineEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "storyTimeline" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "dressCodeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dressCodeTitle" TEXT NOT NULL DEFAULT 'Dress Code',
ADD COLUMN "dressCodeText" TEXT,
ADD COLUMN "dressCodeColors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "bankAccounts" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "giftAddress" TEXT,
ADD COLUMN "liveStreamEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "liveStreamUrl" TEXT,
ADD COLUMN "rsvpEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "rsvpGuestCountEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "wishesEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RSVP" ADD COLUMN "guestCount" INTEGER;

-- CreateTable
CREATE TABLE "WeddingWish" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingWish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeddingWish_siteId_idx" ON "WeddingWish"("siteId");

-- AddForeignKey
ALTER TABLE "WeddingWish" ADD CONSTRAINT "WeddingWish_siteId_fkey"
FOREIGN KEY ("siteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
