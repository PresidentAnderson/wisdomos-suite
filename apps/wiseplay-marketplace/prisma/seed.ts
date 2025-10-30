import { PrismaClient, ServiceStatus, PriceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test users
  console.log('Creating users...');
  const user1 = await prisma.user.upsert({
    where: { email: 'coach1@wiseplay.com' },
    update: {},
    create: {
      email: 'coach1@wiseplay.com',
      name: 'Sarah Chen',
      image: null,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'coach2@wiseplay.com' },
    update: {},
    create: {
      email: 'coach2@wiseplay.com',
      name: 'Michael Rodriguez',
      image: null,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'leader@wiseplay.com' },
    update: {},
    create: {
      email: 'leader@wiseplay.com',
      name: 'Jennifer Liu',
      image: null,
    },
  });

  // Create providers
  console.log('Creating providers...');
  const provider1 = await prisma.provider.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      displayName: 'Sarah Chen',
      bio: 'Landmark Forum Leader with 15 years of experience. I specialize in helping people break through limiting beliefs and create extraordinary results. My work focuses on authentic relationships, bold action, and living from possibility.',
      tagline: 'Breakthrough Coach & Landmark Leader',
      location: 'San Francisco, CA',
      website: 'https://sarahchen.coach',
      isVerified: true,
    },
  });

  const provider2 = await prisma.provider.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      displayName: 'Michael Rodriguez',
      bio: 'Former corporate executive turned transformation coach. I bring my 20 years of business leadership experience to help professionals create breakthroughs in their careers and lives. Certified Landmark Coach.',
      tagline: 'Leadership & Career Coach',
      location: 'New York, NY',
      website: null,
      isVerified: true,
    },
  });

  const provider3 = await prisma.provider.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      displayName: 'Jennifer Liu',
      bio: 'Introduction Leader and community builder. I love creating spaces where people can discover their authentic selves and connect deeply with others. Let\'s explore what\'s possible together!',
      tagline: 'Community Facilitator',
      location: 'Los Angeles, CA',
      website: null,
      isVerified: false,
    },
  });

  // Create categories
  console.log('Creating categories...');
  const coachingCategory = await prisma.category.upsert({
    where: { slug: 'coaching' },
    update: {},
    create: {
      name: 'Coaching',
      slug: 'coaching',
      icon: '🎯',
      description: 'One-on-one breakthrough coaching sessions',
    },
  });

  const partnershipCategory = await prisma.category.upsert({
    where: { slug: 'partnership' },
    update: {},
    create: {
      name: 'Accountability Partnership',
      slug: 'partnership',
      icon: '🤝',
      description: 'Partner with someone committed to breakthrough',
    },
  });

  const workshopCategory = await prisma.category.upsert({
    where: { slug: 'workshops' },
    update: {},
    create: {
      name: 'Workshops',
      slug: 'workshops',
      icon: '🎓',
      description: 'Group learning experiences and seminars',
    },
  });

  const conversationCategory = await prisma.category.upsert({
    where: { slug: 'conversations' },
    update: {},
    create: {
      name: 'Deep Conversations',
      slug: 'conversations',
      icon: '💬',
      description: 'Authentic dialogue and connection',
    },
  });

  // Create services
  console.log('Creating services...');

  const service1 = await prisma.service.create({
    data: {
      providerId: provider1.id,
      categoryId: coachingCategory.id,
      title: 'Breakthrough Coaching Session',
      description: `Transform your relationship to what's possible in a powerful 1-hour coaching session.

In this session, we'll work together to:
- Identify and breakthrough limiting beliefs
- Create new possibilities for action
- Design commitments that inspire you
- Address any breakdowns or incompletions

This is not therapy or advice-giving. This is coaching from the Landmark methodology - we'll work with your authentic self-expression and what you're committed to creating.`,
      price: 150,
      priceType: PriceType.PER_SESSION,
      deliveryTime: '1 hour session',
      location: 'Online (Zoom)',
      status: ServiceStatus.ACTIVE,
      imageUrl: null,
      whatIsIncluded: `- 1 hour of focused breakthrough coaching
- Follow-up action plan and commitments
- Email support for 1 week after session
- Recording of session (if desired)`,
      requirements: `- Have completed Landmark Forum (preferred but not required)
- Come with an open mind and willingness to be challenged
- Be ready to take bold action
- Stable internet connection for video call`,
      averageRating: 4.8,
      totalBookings: 47,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      providerId: provider1.id,
      categoryId: workshopCategory.id,
      title: 'Monthly Possibility Workshop',
      description: `Join our monthly community workshop where we explore what's possible when we live from commitment rather than circumstance.

Each month focuses on a different domain:
- Relationships
- Career & Money
- Health & Well-being
- Self-expression
- Contribution

Limited to 12 participants to ensure everyone gets personal attention and breakthrough.`,
      price: 75,
      priceType: PriceType.PER_SESSION,
      deliveryTime: '2.5 hour workshop',
      location: 'Online (Zoom)',
      status: ServiceStatus.ACTIVE,
      imageUrl: null,
      whatIsIncluded: `- 2.5 hour interactive workshop
- Small group coaching (max 12 people)
- Workbook and exercises
- Access to private community group
- Monthly follow-up call`,
      requirements: `- Commitment to participate fully
- Video on during workshop
- Complete pre-workshop reflection (15 mins)`,
      averageRating: 4.9,
      totalBookings: 156,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      providerId: provider2.id,
      categoryId: coachingCategory.id,
      title: 'Career Breakthrough Package',
      description: `Designed for professionals ready to make their next big career move or transform their relationship to work.

Over 3 months, we'll work on:
- Clarifying your authentic career path
- Breaking through impostor syndrome
- Designing bold career moves
- Building powerful professional relationships
- Creating a career that fulfills you

This is a deep partnership focused on real transformation, not just career advice.`,
      price: 2500,
      priceType: PriceType.PACKAGE,
      deliveryTime: '3 months (12 sessions)',
      location: 'Online (Zoom) or In-Person (NYC)',
      status: ServiceStatus.ACTIVE,
      imageUrl: null,
      whatIsIncluded: `- 12 one-hour coaching sessions (weekly)
- Email support between sessions
- Career assessment and planning tools
- Networking introduction support
- Resume and LinkedIn review
- 90-day action plan`,
      requirements: `- Minimum 3 years professional experience
- Ready to make real changes (not just explore)
- Commitment to complete all 12 sessions
- Willingness to take bold action`,
      averageRating: 5.0,
      totalBookings: 23,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      providerId: provider2.id,
      categoryId: partnershipCategory.id,
      title: 'Leadership Accountability Partnership',
      description: `Partner with me for 6 weeks of focused accountability and breakthrough.

Perfect for leaders who want:
- Regular check-ins on commitments
- Support in challenging conversations
- Partnership in bold action
- Breakthrough when stuck

We'll meet weekly to check in on your commitments, address breakdowns, and design new possibilities for action.`,
      price: 300,
      priceType: PriceType.PACKAGE,
      deliveryTime: '6 weeks',
      location: 'Online (Zoom)',
      status: ServiceStatus.ACTIVE,
      imageUrl: null,
      whatIsIncluded: `- 6 weekly 30-minute check-in calls
- Unlimited text/email accountability check-ins
- Shared commitment tracking document
- Emergency "breakthrough needed" session (1 per 6 weeks)`,
      requirements: `- In a leadership role (team lead or above)
- Clear goals or projects to work on
- Willingness to be held accountable`,
      averageRating: 4.7,
      totalBookings: 31,
    },
  });

  const service5 = await prisma.service.create({
    data: {
      providerId: provider3.id,
      categoryId: conversationCategory.id,
      title: 'Authentic Connection Circle',
      description: `Monthly gathering for deep, authentic conversation and connection.

This is not networking. This is not therapy. This is a space to:
- Share what's really going on
- Be seen and heard
- Connect beyond small talk
- Practice authentic self-expression
- Build real community

Limited to 8 people per circle. No agenda, just authentic human connection and whatever wants to emerge.`,
      price: 35,
      priceType: PriceType.PER_SESSION,
      deliveryTime: '2 hour circle',
      location: 'Los Angeles, CA (In-Person)',
      status: ServiceStatus.ACTIVE,
      imageUrl: null,
      whatIsIncluded: `- 2 hour facilitated circle
- Light refreshments
- Access to community Signal group
- Follow-up circle invitation`,
      requirements: `- Willingness to be vulnerable
- Respect for confidentiality
- Open heart and mind`,
      averageRating: 4.9,
      totalBookings: 89,
    },
  });

  const service6 = await prisma.service.create({
    data: {
      providerId: provider3.id,
      categoryId: workshopCategory.id,
      title: 'Introduction to Landmark Distinctions',
      description: `4-hour workshop introducing key Landmark distinctions and practices.

Perfect for:
- Those curious about Landmark but not ready for the Forum
- Alumni wanting a refresher
- Anyone interested in transformation

We'll explore distinctions like possibility, commitment, integrity, and authentic self-expression through exercises and conversation.`,
      price: 50,
      priceType: PriceType.PER_SESSION,
      deliveryTime: '4 hours',
      location: 'Online (Zoom)',
      status: ServiceStatus.ACTIVE,
      imageUrl: null,
      whatIsIncluded: `- 4 hour interactive workshop
- Workbook with exercises
- List of recommended Landmark programs
- 30-day practice guide`,
      requirements: `- No prior Landmark experience needed
- Open mind and curiosity`,
      averageRating: 4.6,
      totalBookings: 67,
    },
  });

  // Create some sample reviews
  console.log('Creating reviews...');

  // Create a buyer user for reviews
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@wiseplay.com' },
    update: {},
    create: {
      email: 'buyer@wiseplay.com',
      name: 'Alex Thompson',
      image: null,
    },
  });

  const buyer = await prisma.buyer.upsert({
    where: { userId: buyerUser.id },
    update: {},
    create: {
      userId: buyerUser.id,
    },
  });

  await prisma.review.create({
    data: {
      serviceId: service1.id,
      buyerId: buyer.id,
      rating: 5,
      comment: 'Sarah is an incredible coach! In just one session, I had a breakthrough about my career that I\'d been stuck on for months. Her direct, compassionate style created the space for me to see new possibilities. Highly recommend!',
    },
  });

  await prisma.review.create({
    data: {
      serviceId: service2.id,
      buyerId: buyer.id,
      rating: 5,
      comment: 'The monthly workshop is transformative. The small group size means you really get personalized attention, and the community that forms is incredible. I look forward to it every month.',
    },
  });

  await prisma.review.create({
    data: {
      serviceId: service3.id,
      buyerId: buyer.id,
      rating: 5,
      comment: 'Michael\'s career breakthrough package changed my life. I went from feeling stuck and unfulfilled to landing my dream job and doubling my salary. More importantly, I now know how to create the career I want. Worth every penny.',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${3} users created`);
  console.log(`- ${3} providers created (2 verified)`);
  console.log(`- ${4} categories created`);
  console.log(`- ${6} services created`);
  console.log(`- ${3} reviews created`);
  console.log('\n🎉 Database is ready for testing!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
