import { Router } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../auth.js";
import { z } from "zod";

const router = Router();

const CreateAssessmentSchema = z.object({
  contactId: z.string(),
  lifeAreaId: z.number().int().min(1).max(13),
  assessedOn: z.string().datetime().optional(),
  trustScore: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  reliability: z.number().min(1).max(5).optional(),
  openness: z.number().min(1).max(5).optional(),
  growth: z.number().min(1).max(5).optional(),
  reciprocity: z.number().min(1).max(5).optional(),
  alignment: z.number().min(1).max(5).optional(),
  overall: z.number().min(1).max(5).optional(),
  notes: z.string().optional()
});

// Get all assessments
router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const assessments = await prisma.relationshipAssessment.findMany({
      where: { userId },
      include: {
        contact: true,
        lifeArea: true
      },
      orderBy: { assessedOn: "desc" }
    });
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// Get assessments for a specific contact
router.get("/contact/:contactId", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const assessments = await prisma.relationshipAssessment.findMany({
      where: { 
        userId, 
        contactId: req.params.contactId 
      },
      include: {
        contact: true,
        lifeArea: true
      },
      orderBy: { assessedOn: "desc" }
    });
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching contact assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// Get latest assessment summary
router.get("/summary", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    
    // Get latest assessment for each contact-area combination
    const latestAssessments = await prisma.relationshipAssessment.findMany({
      where: { userId },
      distinct: ["contactId", "lifeAreaId"],
      orderBy: [
        { contactId: "asc" },
        { lifeAreaId: "asc" },
        { assessedOn: "desc" }
      ],
      include: {
        contact: true,
        lifeArea: true
      }
    });
    
    // Group by contact
    const summary = latestAssessments.reduce((acc, assessment) => {
      const contactId = assessment.contactId;
      if (!acc[contactId]) {
        acc[contactId] = {
          contact: assessment.contact,
          areas: [],
          averageScore: 0
        };
      }
      
      // Calculate average score for this assessment
      const scores = [
        assessment.trustScore,
        assessment.communication,
        assessment.reliability,
        assessment.openness,
        assessment.growth,
        assessment.reciprocity,
        assessment.alignment
      ].filter(score => score !== null) as number[];
      
      const avgScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      
      acc[contactId].areas.push({
        lifeArea: assessment.lifeArea,
        assessment,
        averageScore: avgScore
      });
      
      return acc;
    }, {} as any);
    
    // Calculate overall average for each contact
    Object.values(summary).forEach((item: any) => {
      const totalScore = item.areas.reduce((sum: number, area: any) => 
        sum + area.averageScore, 0
      );
      item.averageScore = item.areas.length > 0 
        ? totalScore / item.areas.length 
        : 0;
    });
    
    res.json(summary);
  } catch (error) {
    console.error("Error fetching assessment summary:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// Create assessment
router.post("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = CreateAssessmentSchema.parse(req.body);
    
    // Verify contact belongs to user
    const contact = await prisma.contact.findFirst({
      where: { id: data.contactId, userId }
    });
    
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    // Calculate overall if not provided
    let overall = data.overall;
    if (!overall) {
      const scores = [
        data.trustScore,
        data.communication,
        data.reliability,
        data.openness,
        data.growth,
        data.reciprocity,
        data.alignment
      ].filter(score => score !== undefined) as number[];
      
      if (scores.length > 0) {
        overall = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    }
    
    const assessment = await prisma.relationshipAssessment.create({
      data: {
        ...data,
        userId,
        overall,
        assessedOn: data.assessedOn ? new Date(data.assessedOn) : new Date()
      },
      include: {
        contact: true,
        lifeArea: true
      }
    });
    
    res.status(201).json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error creating assessment:", error);
    res.status(500).json({ error: "Failed to create assessment" });
  }
});

// Update assessment
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = CreateAssessmentSchema.partial().parse(req.body);
    
    // Recalculate overall if scores changed
    let overall = data.overall;
    if (!overall && Object.keys(data).some(key => key.includes("Score") || ["communication", "reliability", "openness", "growth", "reciprocity", "alignment"].includes(key))) {
      const existing = await prisma.relationshipAssessment.findFirst({
        where: { id: req.params.id, userId }
      });
      
      if (existing) {
        const scores = [
          data.trustScore ?? existing.trustScore,
          data.communication ?? existing.communication,
          data.reliability ?? existing.reliability,
          data.openness ?? existing.openness,
          data.growth ?? existing.growth,
          data.reciprocity ?? existing.reciprocity,
          data.alignment ?? existing.alignment
        ].filter(score => score !== null) as number[];
        
        if (scores.length > 0) {
          overall = scores.reduce((a, b) => a + b, 0) / scores.length;
        }
      }
    }
    
    const assessment = await prisma.relationshipAssessment.updateMany({
      where: { id: req.params.id, userId },
      data: { ...data, overall }
    });
    
    if (assessment.count === 0) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    
    const updated = await prisma.relationshipAssessment.findFirst({
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
    console.error("Error updating assessment:", error);
    res.status(500).json({ error: "Failed to update assessment" });
  }
});

// Delete assessment
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    
    const deleted = await prisma.relationshipAssessment.deleteMany({
      where: { id: req.params.id, userId }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ error: "Failed to delete assessment" });
  }
});

export default router;