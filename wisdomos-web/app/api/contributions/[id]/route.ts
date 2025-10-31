import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const deleted = await prisma.contribution.deleteMany({
      where: { 
        id,
        userId: user.sub 
      }
    })
    
    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      )
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting contribution:', error)
    return NextResponse.json(
      { error: 'Failed to delete contribution' },
      { status: 500 }
    )
  }
}