import { z } from 'zod';
import { router, protectedProcedure } from '../trpc/trpc';
import { AutobiographyService } from '@wisdomos/contrib';
import { TRPCError } from '@trpc/server';

export const autobiographyRouter = router({
  // Get or create user's autobiography
  getOrCreate: protectedProcedure.query(async ({ ctx }) => {
    const service = new AutobiographyService(ctx.supabase);
    
    try {
      const autobiography = await service.getAutobiography(ctx.user.id);
      
      // Track analytics
      await ctx.supabase.from('analytics_events').insert({
        user_id: ctx.user.id,
        event_type: 'autobiography_viewed',
        properties: { autobiography_id: autobiography.id },
      });
      
      return autobiography;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch autobiography',
      });
    }
  }),

  // Add a life event
  addEvent: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number().optional(),
        day: z.number().optional(),
        title: z.string(),
        description: z.string(),
        media: z.array(
          z.object({
            type: z.enum(['photo', 'video', 'document']),
            url: z.string(),
            caption: z.string().optional(),
          })
        ).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new AutobiographyService(ctx.supabase);
      
      try {
        const result = await service.addEvent(ctx.user.id, input);
        
        // Track analytics
        await ctx.supabase.from('analytics_events').insert({
          user_id: ctx.user.id,
          event_type: 'autobiography_entry',
          properties: { year: input.year },
        });
        
        // Update streak
        await ctx.supabase.rpc('update_streak', {
          p_user_id: ctx.user.id,
          p_type: 'autobiography',
        });
        
        // Check for badge achievements
        const { count } = await ctx.supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ctx.user.id)
          .eq('event_type', 'autobiography_entry');
        
        if (count === 1 || count === 50) {
          // Award badge (would need badge service)
        }
        
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add event',
        });
      }
    }),

  // Update an event
  updateEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        updates: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          media: z.array(z.any()).optional(),
          tags: z.array(z.string()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new AutobiographyService(ctx.supabase);
      
      try {
        return await service.updateEvent(ctx.user.id, input.eventId, input.updates);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update event',
        });
      }
    }),

  // Reframe an incident
  reframeIncident: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        originalIncident: z.string(),
        newNarrative: z.string(),
        insights: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new AutobiographyService(ctx.supabase);
      
      try {
        const result = await service.reframeIncident(
          ctx.user.id,
          input.eventId,
          {
            originalIncident: input.originalIncident,
            newNarrative: input.newNarrative,
            insights: input.insights,
          }
        );
        
        // Track analytics
        await ctx.supabase.from('analytics_events').insert({
          user_id: ctx.user.id,
          event_type: 'reframe_completed',
          properties: { event_id: input.eventId },
        });
        
        // Check for reframe badge
        const { count } = await ctx.supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ctx.user.id)
          .eq('event_type', 'reframe_completed');
        
        if (count === 10) {
          // Award "Reframe Master" badge
        }
        
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reframe incident',
        });
      }
    }),

  // Add future vision
  addFutureVision: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        vision: z.string(),
        goals: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new AutobiographyService(ctx.supabase);
      
      try {
        const result = await service.addFutureVision(
          ctx.user.id,
          input.year,
          input.vision,
          input.goals || []
        );
        
        // Track analytics
        await ctx.supabase.from('analytics_events').insert({
          user_id: ctx.user.id,
          event_type: 'future_vision',
          properties: { year: input.year },
        });
        
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add future vision',
        });
      }
    }),

  // Get timeline view
  getTimelineView: protectedProcedure
    .input(
      z.object({
        startYear: z.number().optional(),
        endYear: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const service = new AutobiographyService(ctx.supabase);
      
      try {
        return await service.getTimelineView(
          ctx.user.id,
          input.startYear,
          input.endYear
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch timeline view',
        });
      }
    }),

  // Get decade view
  getDecadeView: protectedProcedure
    .input(z.object({ decade: z.number() }))
    .query(async ({ ctx, input }) => {
      const service = new AutobiographyService(ctx.supabase);
      
      try {
        return await service.getDecadeView(ctx.user.id, input.decade);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch decade view',
        });
      }
    }),

  // Export to markdown
  exportToMarkdown: protectedProcedure.query(async ({ ctx }) => {
    const service = new AutobiographyService(ctx.supabase);
    
    try {
      const markdown = await service.exportToMarkdown(ctx.user.id);
      
      // Track analytics
      await ctx.supabase.from('analytics_events').insert({
        user_id: ctx.user.id,
        event_type: 'autobiography_exported',
        properties: { format: 'markdown' },
      });
      
      return { markdown };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to export autobiography',
      });
    }
  }),

  // Get reframe prompts
  getReframePrompts: protectedProcedure.query(async ({ ctx }) => {
    const service = new AutobiographyService(ctx.supabase);
    return service.getReframePrompts();
  }),
});