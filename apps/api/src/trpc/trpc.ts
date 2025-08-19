import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    supabase,
    session,
    user: session?.user,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: {
    serialize: (object) => JSON.stringify(object),
    deserialize: (string) => JSON.parse(string),
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);