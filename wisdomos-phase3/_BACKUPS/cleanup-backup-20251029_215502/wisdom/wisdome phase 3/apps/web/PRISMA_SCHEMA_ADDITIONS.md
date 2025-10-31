# Prisma Schema Additions for Autobiography Feature

Add the following models to your existing `prisma/schema.prisma` file:

```prisma
model AutobiographyEntry {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter     String
  promptId    String
  promptText  String   @db.Text
  response    String   @db.Text
  audioUrl    String?
  wordCount   Int      @default(0)
  sentiment   String?
  aiInsights  Json?
  tags        String[] @default([])
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, chapter])
  @@map("autobiography_entries")
}

model AutobiographyChapterProgress {
  id              String   @id @default(cuid())
  userId          String
  chapter         String
  completedPrompts Int     @default(0)
  totalPrompts    Int
  lastAccessedAt  DateTime @default(now())

  @@unique([userId, chapter])
  @@map("autobiography_chapter_progress")
}
```

Also add this relation to the User model:
```prisma
autobiographyEntries AutobiographyEntry[]
```
