import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get the current session from the request
 */
export async function getSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Require authentication for API routes
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return session;
}

/**
 * Require provider role
 */
export async function requireProvider() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user is a provider (you may need to adjust this based on your session structure)
  const isProvider = (session.user as any).isProvider;
  
  if (!isProvider) {
    return NextResponse.json(
      { error: 'Forbidden: Provider access required' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user is an admin (you may need to adjust this based on your session structure)
  const isAdmin = (session.user as any).isAdmin;
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Get user ID from session
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id || null;
}
