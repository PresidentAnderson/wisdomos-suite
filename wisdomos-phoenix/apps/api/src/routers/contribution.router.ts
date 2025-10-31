import { z } from 'zod';
import { router, protectedProcedure } from '../trpc/trpc';
import { ContributionDisplayService } from '@wisdomos/contrib';
import { TRPCError } from '@trpc/server';

export const contributionRouter = router({
  // Create a new contribution display
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        visibility: z.enum(['private', 'circles', 'public']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new ContributionDisplayService(ctx.supabase);
      
      try {
        const display = await service.createDisplay(ctx.user.id, input);
        
        // Track analytics
        await ctx.supabase.from('analytics_events').insert({
          user_id: ctx.user.id,
          event_type: 'contribution_created',
          properties: { display_id: display.id },
        });
        
        // Update streak
        await ctx.supabase.rpc('update_streak', {
          p_user_id: ctx.user.id,
          p_type: 'contribution',
        });
        
        return display;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create contribution display',
        });
      }
    }),

  // Get user's contribution displays
  getUserDisplays: protectedProcedure.query(async ({ ctx }) => {
    const service = new ContributionDisplayService(ctx.supabase);
    
    try {
      return await service.getUserDisplays(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch contribution displays',
      });
    }
  }),

  // Get a specific contribution display
  getDisplay: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const service = new ContributionDisplayService(ctx.supabase);
      
      try {
        return await service.getDisplay(input.id);
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contribution display not found',
        });
      }
    }),

  // Add an entry to a contribution display
  addEntry: protectedProcedure
    .input(
      z.object({
        displayId: z.string().uuid(),
        entry: z.object({
          id: z.string(),
          type: z.enum(['text', 'image', 'icon', 'media']),
          content: z.string(),
          position: z.object({ x: z.number(), y: z.number() }),
          size: z.object({ width: z.number(), height: z.number() }).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new ContributionDisplayService(ctx.supabase);
      
      try {
        return await service.addEntry(input.displayId, input.entry);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add entry',
        });
      }
    }),

  // Add feedback to a display
  addFeedback: protectedProcedure
    .input(
      z.object({
        displayId: z.string().uuid(),
        comment: z.string(),
        entryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new ContributionDisplayService(ctx.supabase);
      
      try {
        const result = await service.addFeedback(
          input.displayId,
          ctx.user.id,
          input.comment,
          input.entryId
        );
        
        // Send notification to display owner
        const display = await service.getDisplay(input.displayId);
        if (display.user_id !== ctx.user.id) {
          await ctx.supabase.from('notifications').insert({
            user_id: display.user_id,
            type: 'contribution_feedback',
            title: 'New feedback on your contribution display',
            message: input.comment,
            metadata: { display_id: input.displayId },
          });
        }
        
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add feedback',
        });
      }
    }),

  // Share display with a circle
  shareWithCircle: protectedProcedure
    .input(
      z.object({
        displayId: z.string().uuid(),
        circleId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new ContributionDisplayService(ctx.supabase);
      
      try {
        return await service.shareWithCircle(input.displayId, input.circleId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to share display',
        });
      }
    }),

  // Get prompts
  getPrompts: protectedProcedure.query(async ({ ctx }) => {
    const service = new ContributionDisplayService(ctx.supabase);
    return service.getPrompts();
  }),
});