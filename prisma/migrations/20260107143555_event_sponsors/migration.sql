-- CreateTable
CREATE TABLE "EventSpeakersOnPosts" (
    "eventId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "EventSpeakersOnPosts_pkey" PRIMARY KEY ("eventId","postId")
);

-- CreateTable
CREATE TABLE "EventSponsorsOnPosts" (
    "eventId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "EventSponsorsOnPosts_pkey" PRIMARY KEY ("eventId","postId")
);

-- CreateIndex
CREATE INDEX "EventSpeakersOnPosts_eventId_idx" ON "EventSpeakersOnPosts"("eventId");

-- CreateIndex
CREATE INDEX "EventSpeakersOnPosts_postId_idx" ON "EventSpeakersOnPosts"("postId");

-- CreateIndex
CREATE INDEX "EventSponsorsOnPosts_eventId_idx" ON "EventSponsorsOnPosts"("eventId");

-- CreateIndex
CREATE INDEX "EventSponsorsOnPosts_postId_idx" ON "EventSponsorsOnPosts"("postId");

-- AddForeignKey
ALTER TABLE "EventSpeakersOnPosts" ADD CONSTRAINT "EventSpeakersOnPosts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSpeakersOnPosts" ADD CONSTRAINT "EventSpeakersOnPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSponsorsOnPosts" ADD CONSTRAINT "EventSponsorsOnPosts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSponsorsOnPosts" ADD CONSTRAINT "EventSponsorsOnPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
