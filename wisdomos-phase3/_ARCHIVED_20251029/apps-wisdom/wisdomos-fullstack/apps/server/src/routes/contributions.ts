import { Router } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../auth.js";
import { z } from "zod";

const router = Router();

const CreateContributionSchema = z.object({
  type: z.enum(["strength", "acknowledgment", "natural", "quote"]),
  title: z.string().min(1),
  content: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional()
});

const UpdateContributionSchema = CreateContributionSchema.partial();

// Get all contributions for user
router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const contributions = await prisma.contribution.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({ error: "Failed to fetch contributions" });
  }
});

// Get single contribution
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const contribution = await prisma.contribution.findFirst({
      where: { id: req.params.id, userId }
    });
    
    if (!contribution) {
      return res.status(404).json({ error: "Contribution not found" });
    }
    
    res.json(contribution);
  } catch (error) {
    console.error("Error fetching contribution:", error);
    res.status(500).json({ error: "Failed to fetch contribution" });
  }
});

// Create contribution
router.post("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = CreateContributionSchema.parse(req.body);
    
    const contribution = await prisma.contribution.create({
      data: { ...data, userId }
    });
    
    res.status(201).json(contribution);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error creating contribution:", error);
    res.status(500).json({ error: "Failed to create contribution" });
  }
});

// Update contribution
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = UpdateContributionSchema.parse(req.body);
    
    const contribution = await prisma.contribution.updateMany({
      where: { id: req.params.id, userId },
      data
    });
    
    if (contribution.count === 0) {
      return res.status(404).json({ error: "Contribution not found" });
    }
    
    const updated = await prisma.contribution.findFirst({
      where: { id: req.params.id }
    });
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error updating contribution:", error);
    res.status(500).json({ error: "Failed to update contribution" });
  }
});

// Delete contribution
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    
    const deleted = await prisma.contribution.deleteMany({
      where: { id: req.params.id, userId }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: "Contribution not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contribution:", error);
    res.status(500).json({ error: "Failed to delete contribution" });
  }
});

export default router;