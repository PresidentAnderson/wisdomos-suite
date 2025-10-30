import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateEntrySchema, countWords, sanitizeTags } from '@/lib/autobiography/validation';

// GET /api/autobiography/[id] - Get a specific entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const entry = await prisma.autobiographyEntry.findUnique({
      where: { id: params.id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Check authorization - user must own the entry or it must be public
    if (entry.userId !== session.user.id && !entry.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

// PATCH /api/autobiography/[id] - Update an entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if entry exists and user owns it
    const existingEntry = await prisma.autobiographyEntry.findUnique({
      where: { id: params.id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateEntrySchema.parse(body);

    const updateData: any = {};

    if (validatedData.response) {
      updateData.response = validatedData.response;
      updateData.wordCount = countWords(validatedData.response);
    }

    if (validatedData.audioUrl !== undefined) {
      updateData.audioUrl = validatedData.audioUrl;
    }

    if (validatedData.tags) {
      updateData.tags = sanitizeTags(validatedData.tags);
    }

    if (validatedData.isPublic !== undefined) {
      updateData.isPublic = validatedData.isPublic;
    }

    const entry = await prisma.autobiographyEntry.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating entry:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/autobiography/[id] - Delete an entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if entry exists and user owns it
    const existingEntry = await prisma.autobiographyEntry.findUnique({
      where: { id: params.id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.autobiographyEntry.delete({
      where: { id: params.id },
    });

    // Update chapter progress
    await updateChapterProgress(session.user.id, existingEntry.chapter);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
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
      totalPrompts: 10,
      lastAccessedAt: new Date(),
    },
  });
}
