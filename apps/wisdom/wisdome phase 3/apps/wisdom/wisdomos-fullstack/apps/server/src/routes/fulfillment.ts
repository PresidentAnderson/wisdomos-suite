import { Router } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../auth.js";
import { z } from "zod";

const router = Router();

const CreateFulfillmentAreaSchema = z.object({
  lifeAreaId: z.number().int().min(1).max(13),
  status: z.enum(["thriving", "attention", "collapse"]).optional(),
  attention: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional()
});

const CreateCommitmentSchema = z.object({
  areaId: z.string(),
  title: z.string().min(1),
  outcome: z.string().optional()
});

// Get all fulfillment areas with commitments
router.get("/areas", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const areas = await prisma.fulfillmentArea.findMany({
      where: { userId },
      include: {
        lifeArea: true,
        commitments: true
      }
    });
    res.json(areas);
  } catch (error) {
    console.error("Error fetching fulfillment areas:", error);
    res.status(500).json({ error: "Failed to fetch areas" });
  }
});

// Get life areas catalog
router.get("/life-areas", async (req: AuthRequest, res) => {
  try {
    const lifeAreas = await prisma.lifeArea.findMany({
      orderBy: { id: "asc" }
    });
    res.json(lifeAreas);
  } catch (error) {
    console.error("Error fetching life areas:", error);
    res.status(500).json({ error: "Failed to fetch life areas" });
  }
});

// Create or update fulfillment area
router.post("/areas", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = CreateFulfillmentAreaSchema.parse(req.body);
    
    const area = await prisma.fulfillmentArea.upsert({
      where: {
        userId_lifeAreaId: { userId, lifeAreaId: data.lifeAreaId }
      },
      update: data,
      create: { ...data, userId },
      include: {
        lifeArea: true,
        commitments: true
      }
    });
    
    res.status(201).json(area);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error creating fulfillment area:", error);
    res.status(500).json({ error: "Failed to create area" });
  }
});

// Update fulfillment area status
router.patch("/areas/:id/status", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const { status } = z.object({
      status: z.enum(["thriving", "attention", "collapse"])
    }).parse(req.body);
    
    const area = await prisma.fulfillmentArea.updateMany({
      where: { id: req.params.id, userId },
      data: { status }
    });
    
    if (area.count === 0) {
      return res.status(404).json({ error: "Area not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error updating area status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Get all commitments
router.get("/commitments", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const commitments = await prisma.commitment.findMany({
      where: { userId },
      include: {
        area: {
          include: { lifeArea: true }
        }
      }
    });
    res.json(commitments);
  } catch (error) {
    console.error("Error fetching commitments:", error);
    res.status(500).json({ error: "Failed to fetch commitments" });
  }
});

// Create commitment
router.post("/commitments", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = CreateCommitmentSchema.parse(req.body);
    
    // Verify area belongs to user
    const area = await prisma.fulfillmentArea.findFirst({
      where: { id: data.areaId, userId }
    });
    
    if (!area) {
      return res.status(404).json({ error: "Fulfillment area not found" });
    }
    
    const commitment = await prisma.commitment.create({
      data: { ...data, userId },
      include: {
        area: {
          include: { lifeArea: true }
        }
      }
    });
    
    res.status(201).json(commitment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error creating commitment:", error);
    res.status(500).json({ error: "Failed to create commitment" });
  }
});

// Update commitment
router.put("/commitments/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const { title, outcome } = z.object({
      title: z.string().min(1).optional(),
      outcome: z.string().optional()
    }).parse(req.body);
    
    const commitment = await prisma.commitment.updateMany({
      where: { id: req.params.id, userId },
      data: { title, outcome }
    });
    
    if (commitment.count === 0) {
      return res.status(404).json({ error: "Commitment not found" });
    }
    
    const updated = await prisma.commitment.findFirst({
      where: { id: req.params.id },
      include: {
        area: {
          include: { lifeArea: true }
        }
      }
    });
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error updating commitment:", error);
    res.status(500).json({ error: "Failed to update commitment" });
  }
});

// Delete commitment
router.delete("/commitments/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    
    const deleted = await prisma.commitment.deleteMany({
      where: { id: req.params.id, userId }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: "Commitment not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting commitment:", error);
    res.status(500).json({ error: "Failed to delete commitment" });
  }
});

export default router;