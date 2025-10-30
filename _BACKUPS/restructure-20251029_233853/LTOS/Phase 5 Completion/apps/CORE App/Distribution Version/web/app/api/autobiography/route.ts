import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createEntrySchema, countWords, sanitizeTags } from '@/lib/autobiography/validation';
import type { EntryFilters } from '@/lib/autobiography/types';

// GET /api/autobiography - List all entries for the current user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const filters: Partial<EntryFilters> = {
      chapter: searchParams.get('chapter') || undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.getAll('tags'),
      sentiment: searchParams.get('sentiment') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    };

    const where: any = {
      userId: session.user.id,
    };

    if (filters.chapter) {
      where.chapter = filters.chapter;
    }

    if (filters.search) {
      where.OR = [
        { promptText: { contains: filters.search, mode: 'insensitive' } },
        { response: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.sentiment) {
      where.sentiment = filters.sentiment;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const entries = await prisma.autobiographyEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        chapter: true,
        promptId: true,
        promptText: true,
        response: true,
        audioUrl: true,
        wordCount: true,
        sentiment: true,
        aiInsights: true,
        tags: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// POST /api/autobiography - Create a new entry
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createEntrySchema.parse(body);

    const wordCount = countWords(validatedData.response);
    const tags = sanitizeTags(validatedData.tags || []);

    const entry = await prisma.autobiographyEntry.create({
      data: {
        userId: session.user.id,
        chapter: validatedData.chapter,
        promptId: validatedData.promptId,
        promptText: validatedData.promptText,
        response: validatedData.response,
        audioUrl: validatedData.audioUrl,
        wordCount,
        tags,
        isPublic: validatedData.isPublic || false,
      },
    });

    // Update chapter progress
    await updateChapterProgress(session.user.id, validatedData.chapter);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid entry data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}

// Helper function to update chapter progress
async function updateChapterProgress(userId: string, chapter: string) {
  const completedCount = await prisma.autobiographyEntry.count({
    where: { userId, chapter },
  });

  await prisma.autobiographyChapterProgress.upsert({
    where: {
      userId_chapter: { userId, chapter },
    },
    update: {
      completedPrompts: completedCount,
      lastAccessedAt: new Date(),
    },
    create: {
      userId,
      chapter,
      completedPrompts: completedCount,
      totalPrompts: 10, // This should match the number of prompts per chapter
      lastAccessedAt: new Date(),
    },
  });
}
