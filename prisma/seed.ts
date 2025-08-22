import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@wisdomos.app" },
    update: {},
    create: { 
      email: "demo@wisdomos.app", 
      name: "Demo User" 
    }
  });
  console.log("✅ Created user:", user.email);

  // Ensure life areas exist
  const lifeAreas = [
    { id: 1, name: "Work & Purpose", icon: "💼", description: "Career, business, meaningful work" },
    { id: 2, name: "Health", icon: "❤️", description: "Physical vitality, recovery, wellness" },
    { id: 3, name: "Finance", icon: "💰", description: "Wealth strategy, financial security" },
    { id: 4, name: "Intimacy & Love", icon: "💕", description: "Romantic partnership, deep connection" },
    { id: 5, name: "Time & Energy", icon: "⏰", description: "Focus blocks, energy management" },
    { id: 6, name: "Spiritual Alignment", icon: "✨", description: "Inner guidance, spiritual practice" },
    { id: 7, name: "Creativity & Expression", icon: "🎨", description: "Art, writing, creative projects" },
    { id: 8, name: "Friendship & Community", icon: "👥", description: "Social connections, support network" },
    { id: 9, name: "Learning & Growth", icon: "📚", description: "Personal development, skill building" },
    { id: 10, name: "Home & Environment", icon: "🏡", description: "Living space, comfort, order" },
    { id: 11, name: "Sexuality", icon: "🔥", description: "Embodiment, erotic expression" },
    { id: 12, name: "Emotional Regulation", icon: "🧘", description: "Inner child work, emotional clarity" },
    { id: 13, name: "Legacy & Archives", icon: "📜", description: "Life documentation, contribution preservation" }
  ];

  for (const area of lifeAreas) {
    await prisma.lifeArea.upsert({
      where: { id: area.id },
      update: area,
      create: area
    });
  }
  console.log("✅ Created", lifeAreas.length, "life areas");

  // Create sample contacts
  const contacts = [
    { firstName: "Djamel", lastName: "Partner", notes: "Life partner", tags: JSON.stringify(["partner", "core"]) },
    { firstName: "Michael", lastName: "Friend", notes: "Operations support", tags: JSON.stringify(["friend", "ops"]) },
    { firstName: "Sarah", lastName: "Therapist", notes: "Weekly therapy", tags: JSON.stringify(["professional", "therapy"]) },
    { firstName: "Alex", lastName: "Mentor", notes: "Business mentor", tags: JSON.stringify(["professional", "mentor"]) }
  ];

  const createdContacts = [];
  for (const contact of contacts) {
    const created = await prisma.contact.create({
      data: { ...contact, userId: user.id }
    });
    createdContacts.push(created);
  }
  console.log("✅ Created", contacts.length, "contacts");

  // Create contact-life area links
  if (createdContacts[0]) {
    await prisma.contactLifeAreaLink.create({
      data: {
        userId: user.id,
        contactId: createdContacts[0].id,
        lifeAreaId: 4, // Intimacy & Love
        roleLabel: "partner",
        frequency: "daily",
        weight: 0.9,
        outcomes: "Deep connection and mutual growth"
      }
    });
  }

  // Create sample contributions
  const contributions = [
    {
      type: "strength" as const,
      title: "Catalyst for Clarity",
      content: "Turns chaos into clear, actionable systems",
      tags: JSON.stringify(["systems", "clarity"])
    },
    {
      type: "acknowledgment" as const,
      title: "Pattern Recognition",
      content: "You see connections others miss",
      source: "Team feedback",
      tags: JSON.stringify(["insight", "vision"])
    },
    {
      type: "natural" as const,
      title: "Deep Listening",
      content: "Creating space for others to discover themselves",
      tags: JSON.stringify(["empathy", "presence"])
    }
  ];

  for (const contribution of contributions) {
    await prisma.contribution.create({
      data: { ...contribution, userId: user.id }
    });
  }
  console.log("✅ Created", contributions.length, "contributions");

  // Create sample autobiography entries
  const currentYear = new Date().getFullYear();
  await prisma.autobiographyEntry.create({
    data: {
      userId: user.id,
      year: currentYear,
      title: "Building WisdomOS",
      narrative: "Creating a system for tracking personal growth and wisdom",
      earliest: "Always been drawn to systems and patterns",
      insight: "Systems create freedom, not constraint",
      commitment: "Build tools that empower self-discovery",
      lifeAreas: JSON.stringify([1, 7, 9]), // Work, Creativity, Learning
      tags: JSON.stringify(["systems", "creation", "growth"])
    }
  });
  console.log("✅ Created autobiography entry");

  // Create fulfillment areas
  const fulfillmentAreas = [
    { lifeAreaId: 1, status: "thriving" as const, attention: 80 },
    { lifeAreaId: 2, status: "attention" as const, attention: 60 },
    { lifeAreaId: 4, status: "thriving" as const, attention: 90 }
  ];

  const createdAreas = [];
  for (const area of fulfillmentAreas) {
    const created = await prisma.fulfillmentArea.create({
      data: { ...area, userId: user.id }
    });
    createdAreas.push(created);
  }
  console.log("✅ Created", fulfillmentAreas.length, "fulfillment areas");

  // Create sample commitment
  if (createdAreas[0]) {
    await prisma.commitment.create({
      data: {
        userId: user.id,
        areaId: createdAreas[0].id,
        title: "Launch WisdomOS",
        outcome: "Complete personal growth tracking system"
      }
    });
  }
  console.log("✅ Created commitment");

  // Create sample assessment
  if (createdContacts[0]) {
    await prisma.relationshipAssessment.create({
      data: {
        userId: user.id,
        contactId: createdContacts[0].id,
        lifeAreaId: 4,
        trustScore: 4.5,
        communication: 4.0,
        reliability: 4.5,
        openness: 4.0,
        growth: 4.5,
        reciprocity: 4.0,
        alignment: 4.5,
        overall: 4.3,
        notes: "Strong foundation, continuing to grow together"
      }
    });
  }
  console.log("✅ Created relationship assessment");

  console.log("\n🎉 Seeding complete!");
  console.log("📧 Login with: demo@wisdomos.app");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });