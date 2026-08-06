CREATE TABLE "WeddingTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rendererId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WeddingTemplate_isActive_idx" ON "WeddingTemplate"("isActive");

INSERT INTO "WeddingTemplate" ("id", "name", "description", "rendererId")
VALUES
  (
    'classic',
    'Classic Romance',
    'Tampilan elegan dengan envelope pembuka dan nuansa romantis yang sudah ada di Weddingly.',
    'classic'
  ),
  (
    'autumn',
    'Autumn Pop-up',
    'Undangan hangat bernuansa autumn dengan cover pop-up, countdown, kartu acara, dan galeri.',
    'autumn'
  );
