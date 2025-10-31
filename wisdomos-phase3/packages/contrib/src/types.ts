import { z } from 'zod';

// Contribution Display Types
export const ContributionEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'icon', 'media']),
  content: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export const ContributionDisplaySchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  entries: z.array(ContributionEntrySchema),
  feedback: z.array(z.object({
    id: z.string(),
    fromUserId: z.string(),
    entryId: z.string().optional(),
    comment: z.string(),
    createdAt: z.date(),
  })),
  visibility: z.enum(['private', 'circles', 'public']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Autobiography Types
export const AutobiographyEventSchema = z.object({
  id: z.string(),
  year: z.number(),
  month: z.number().optional(),
  day: z.number().optional(),
  title: z.string(),
  description: z.string(),
  media: z.array(z.object({
    type: z.enum(['photo', 'video', 'document']),
    url: z.string(),
    caption: z.string().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  isReframed: z.boolean().default(false),
  reframe: z.object({
    originalIncident: z.string(),
    newNarrative: z.string(),
    insights: z.array(z.string()),
    completedAt: z.date(),
  }).optional(),
});

export const AutobiographySchema = z.object({
  id: z.string(),
  userId: z.string(),
  events: z.array(AutobiographyEventSchema),
  futureVisions: z.array(z.object({
    year: z.number(),
    vision: z.string(),
    goals: z.array(z.string()),
    updatedAt: z.date(),
  })),
  culturalContext: z.record(z.string(), z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Guided Prompts for Contribution Display
export const CONTRIBUTION_PROMPTS = [
  {
    id: 'acknowledgment',
    question: 'What do others acknowledge you for?',
    helpText: 'Think about compliments, recognition, or feedback you often receive',
  },
  {
    id: 'natural',
    question: 'What do you naturally contribute?',
    helpText: 'Consider what you do effortlessly that benefits others',
  },
  {
    id: 'energy',
    question: 'What activities give you energy?',
    helpText: 'Identify what you could do all day without feeling drained',
  },
  {
    id: 'unique',
    question: 'What unique perspective do you bring?',
    helpText: 'Think about your distinctive viewpoint or approach',
  },
];

// Reframe Prompts for Autobiography
export const REFRAME_PROMPTS = [
  {
    stage: 'identify',
    prompt: 'Identify an early incident that still affects you',
    questions: [
      'What happened?',
      'How old were you?',
      'Who was involved?',
      'What emotions did you feel?',
    ],
  },
  {
    stage: 'acknowledge',
    prompt: 'Acknowledge the impact',
    questions: [
      'How has this shaped your behavior?',
      'What patterns emerged from this?',
      'What beliefs did you form?',
    ],
  },
  {
    stage: 'reframe',
    prompt: 'Create a new narrative',
    questions: [
      'What did you learn from this?',
      'How did it make you stronger?',
      'What gifts came from this experience?',
      'How can you see this with compassion?',
    ],
  },
];

export type ContributionEntry = z.infer<typeof ContributionEntrySchema>;
export type ContributionDisplay = z.infer<typeof ContributionDisplaySchema>;
export type AutobiographyEvent = z.infer<typeof AutobiographyEventSchema>;
export type Autobiography = z.infer<typeof AutobiographySchema>;