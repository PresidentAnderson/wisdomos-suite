import { Router } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../auth.js";
import { getHubSpotClient } from "../integrations/hubspot.js";
import { z } from "zod";

const router = Router();

const CreateInteractionSchema = z.object({
  contactId: z.string().uuid(),
  lifeAreaId: z.number().int().min(1).max(13).optional(),
  channel: z.enum(["call", "sms", "email", "meeting", "note", "whatsapp", "telegram", "signal", "messenger", "other"]),
  direction: z.enum(["inbound", "outbound", "internal"]).optional(),
  occurredAt: z.string().datetime().optional(),
  subject: z.string().optional(),
  bodyText: z.string().optional(),
  bodyHtml: z.string().optional(),
  uri: z.string().optional(),
  sentiment: z.enum(["very_negative", "negative", "neutral", "positive", "very_positive"]).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  topics: z.array(z.string()).optional(),
  entities: z.any().optional(),
  meta: z.record(z.any()).optional(),
  syncToHubSpot: z.boolean().optional()
});

// Get all interactions
router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const { contactId, lifeAreaId, limit = 100, offset = 0 } = req.query;
    
    const where: any = { userId };
    if (contactId) where.contactId = contactId;
    if (lifeAreaId) where.lifeAreaId = parseInt(lifeAreaId as string);
    
    const interactions = await prisma.interaction.findMany({
      where,
      include: {
        contact: true,
        lifeArea: true
      },
      orderBy: { occurredAt: "desc" },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });
    
    res.json(interactions);
  } catch (error) {
    console.error("Error fetching interactions:", error);
    res.status(500).json({ error: "Failed to fetch interactions" });
  }
});

// Get interaction statistics
router.get("/stats", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const { days = 30 } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));
    
    // Get interaction counts by channel
    const byChannel = await prisma.interaction.groupBy({
      by: ["channel"],
      where: {
        userId,
        occurredAt: { gte: daysAgo }
      },
      _count: true
    });
    
    // Get interaction counts by life area
    const byLifeArea = await prisma.interaction.groupBy({
      by: ["lifeAreaId"],
      where: {
        userId,
        occurredAt: { gte: daysAgo }
      },
      _count: true
    });
    
    // Get sentiment distribution
    const bySentiment = await prisma.interaction.groupBy({
      by: ["sentiment"],
      where: {
        userId,
        occurredAt: { gte: daysAgo },
        sentiment: { not: null }
      },
      _count: true
    });
    
    // Get life areas for mapping
    const lifeAreas = await prisma.lifeArea.findMany();
    const lifeAreaMap = Object.fromEntries(
      lifeAreas.map(la => [la.id, la])
    );
    
    // Map life area IDs to names
    const byLifeAreaWithNames = byLifeArea.map(item => ({
      lifeArea: item.lifeAreaId ? lifeAreaMap[item.lifeAreaId] : null,
      count: item._count
    }));
    
    res.json({
      period: `Last ${days} days`,
      totalInteractions: byChannel.reduce((sum, item) => sum + item._count, 0),
      byChannel,
      byLifeArea: byLifeAreaWithNames,
      bySentiment,
      topContacts: await prisma.interaction.groupBy({
        by: ["contactId"],
        where: {
          userId,
          occurredAt: { gte: daysAgo }
        },
        _count: true,
        orderBy: { _count: { contactId: "desc" } },
        take: 10
      })
    });
  } catch (error) {
    console.error("Error fetching interaction stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Create interaction
router.post("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = CreateInteractionSchema.parse(req.body);
    
    // Verify contact belongs to user
    const contact = await prisma.contact.findFirst({
      where: { id: data.contactId, userId }
    });
    
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    // Create interaction
    const interaction = await prisma.interaction.create({
      data: {
        userId,
        contactId: data.contactId,
        lifeAreaId: data.lifeAreaId,
        channel: data.channel,
        direction: data.direction || "internal",
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
        subject: data.subject,
        bodyText: data.bodyText,
        bodyHtml: data.bodyHtml,
        uri: data.uri,
        sentiment: data.sentiment,
        sentimentScore: data.sentimentScore,
        topics: data.topics || [],
        entities: data.entities,
        meta: data.meta || {}
      },
      include: {
        contact: true,
        lifeArea: true
      }
    });
    
    // Sync to HubSpot if requested and configured
    if (data.syncToHubSpot && getHubSpotClient()) {
      try {
        await getHubSpotClient()!.syncInteractionToHubSpot(interaction.id);
      } catch (error) {
        console.error("Failed to sync to HubSpot:", error);
        // Don't fail the request, just log the error
      }
    }
    
    res.status(201).json(interaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error creating interaction:", error);
    res.status(500).json({ error: "Failed to create interaction" });
  }
});

// Bulk log interactions (for imports)
router.post("/bulk", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const { interactions, syncToHubSpot = false } = req.body;
    
    if (!Array.isArray(interactions)) {
      return res.status(400).json({ error: "interactions must be an array" });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < interactions.length; i++) {
      try {
        const data = CreateInteractionSchema.parse(interactions[i]);
        
        // Verify contact
        const contact = await prisma.contact.findFirst({
          where: { id: data.contactId, userId }
        });
        
        if (!contact) {
          errors.push({ index: i, error: "Contact not found" });
          continue;
        }
        
        // Create interaction
        const interaction = await prisma.interaction.create({
          data: {
            userId,
            contactId: data.contactId,
            lifeAreaId: data.lifeAreaId,
            channel: data.channel,
            direction: data.direction || "internal",
            occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
            subject: data.subject,
            bodyText: data.bodyText,
            bodyHtml: data.bodyHtml,
            uri: data.uri,
            sentiment: data.sentiment,
            sentimentScore: data.sentimentScore,
            topics: data.topics || [],
            entities: data.entities,
            meta: data.meta || {}
          }
        });
        
        results.push(interaction);
        
        // Sync to HubSpot if requested
        if (syncToHubSpot && getHubSpotClient()) {
          // Queue for async processing to avoid slowing down bulk import
          setTimeout(async () => {
            try {
              await getHubSpotClient()!.syncInteractionToHubSpot(interaction.id);
            } catch (error) {
              console.error(`Failed to sync interaction ${interaction.id} to HubSpot:`, error);
            }
          }, i * 100); // Stagger requests
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({ index: i, error: "Invalid data", details: error.errors });
        } else {
          errors.push({ index: i, error: (error as Error).message });
        }
      }
    }
    
    res.json({
      success: results.length,
      failed: errors.length,
      results: results.slice(0, 10), // Return first 10 for preview
      errors
    });
  } catch (error) {
    console.error("Error in bulk interaction import:", error);
    res.status(500).json({ error: "Failed to import interactions" });
  }
});

// Update interaction
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = CreateInteractionSchema.partial().parse(req.body);
    
    const interaction = await prisma.interaction.updateMany({
      where: { id: req.params.id, userId },
      data: {
        ...data,
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : undefined
      }
    });
    
    if (interaction.count === 0) {
      return res.status(404).json({ error: "Interaction not found" });
    }
    
    const updated = await prisma.interaction.findFirst({
      where: { id: req.params.id },
      include: {
        contact: true,
        lifeArea: true
      }
    });
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error updating interaction:", error);
    res.status(500).json({ error: "Failed to update interaction" });
  }
});

// Delete interaction
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    
    const deleted = await prisma.interaction.deleteMany({
      where: { id: req.params.id, userId }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: "Interaction not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting interaction:", error);
    res.status(500).json({ error: "Failed to delete interaction" });
  }
});

// Analyze sentiment for an interaction (placeholder for AI integration)
router.post("/:id/analyze", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    
    const interaction = await prisma.interaction.findFirst({
      where: { id: req.params.id, userId }
    });
    
    if (!interaction) {
      return res.status(404).json({ error: "Interaction not found" });
    }
    
    // TODO: Integrate with AI service for sentiment analysis
    // For now, return a mock analysis
    const analysis = {
      sentiment: "positive" as const,
      sentimentScore: 0.7,
      topics: ["collaboration", "planning", "feedback"],
      entities: {
        people: [],
        organizations: [],
        locations: []
      },
      summary: "Positive interaction focused on collaboration and planning."
    };
    
    // Update interaction with analysis
    await prisma.interaction.update({
      where: { id: req.params.id },
      data: {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        topics: analysis.topics,
        entities: analysis.entities
      }
    });
    
    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing interaction:", error);
    res.status(500).json({ error: "Failed to analyze interaction" });
  }
});

export default router;