import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from './db';

/**
 * Auth options for NextAuth
 */
export const authOptions = {
  providers: [],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
};

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      providerProfile: true,
    },
  });

  return user;
}

/**
 * Require authentication middleware
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require provider authentication
 */
export async function requireProvider() {
  const user = await requireAuth();

  if (!user.providerProfile) {
    throw new Error('Provider profile required');
  }

  return { user, provider: user.providerProfile };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Check if user has provider profile
 */
export async function isProvider(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user?.providerProfile;
}
