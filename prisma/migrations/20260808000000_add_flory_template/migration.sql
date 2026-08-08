INSERT INTO "WeddingTemplate" ("id", "name", "description", "rendererId")
VALUES (
  'flory',
  'Flory Garden',
  'Undangan cerah penuh bunga, pepohonan, dan bingkai foto bernuansa taman romantis.',
  'flory'
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "rendererId" = EXCLUDED."rendererId",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
