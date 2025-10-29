// Integrated Display Framework Types

// 1. Contribution Display Types
export interface CoreStrength {
  id: string;
  title: string;
  description: string;
  source: 'self' | 'others' | 'ai';
  category: 'natural' | 'developed' | 'emerging';
  createdAt: Date;
}

export interface NaturalContribution {
  id: string;
  contribution: string;
  effortLevel: 'effortless' | 'easy' | 'moderate';
  frequency: 'daily' | 'weekly' | 'occasional';
  impact: 'personal' | 'interpersonal' | 'community' | 'global';
  examples: string[];
}

export interface Acknowledgment {
  id: string;
  from: string;
  message: string;
  date: Date;
  context: string;
  tags: string[];
}

export interface ContributionDisplay {
  userId: string;
  coreStrengths: CoreStrength[];
  naturalContributions: NaturalContribution[];
  acknowledgments: Acknowledgment[];
  identityStatement: string;
  lastUpdated: Date;
}

// 2. Autobiography Timeline Types
export interface YearEntry {
  year: number;
  events: LifeEvent[];
  people: Person[];
  mood: 'thriving' | 'growing' | 'challenging' | 'transforming';
  commitments: string[];
  insights: string[];
  completionStatus: 'empty' | 'partial' | 'complete';
}

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: 'milestone' | 'challenge' | 'celebration' | 'loss' | 'beginning' | 'ending';
  emotionalCharge: -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  reframed?: string;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  impact: 'positive' | 'neutral' | 'challenging' | 'transformative';
  stillPresent: boolean;
  notes?: string;
}

export interface AutobiographyTimeline {
  userId: string;
  birthYear: number;
  entries: YearEntry[];
  futureProjections: FutureProjection[];
  patterns: Pattern[];
  currentAge: number;
}

export interface FutureProjection {
  year: number;
  vision: string;
  commitments: string[];
  desiredState: string;
  milestones: string[];
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  yearsPresent: number[];
  category: 'relationship' | 'career' | 'health' | 'spiritual' | 'creative';
  resolved: boolean;
}

// 3. Fulfillment Display Types
export interface LifeArea {
  id: string;
  name: string;
  status: 'thriving' | 'attention' | 'collapsed';
  commitments: Commitment[];
  relationships: Relationship[];
  score: number; // 0-100
  lastAudit: Date;
  notes: string;
}

export interface Commitment {
  id: string;
  title: string;
  description: string;
  areaId: string;
  relatedPeople: string[]; // Person IDs
  status: 'active' | 'pending' | 'completed' | 'abandoned';
  createdAt: Date;
  dueDate?: Date;
  size: 'small' | 'medium' | 'large';
}

export interface Relationship {
  id: string;
  personName: string;
  type: 'family' | 'friend' | 'colleague' | 'mentor' | 'partner' | 'community';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastContact: Date;
  quality: 1 | 2 | 3 | 4 | 5;
  commitments: string[]; // Commitment IDs
  outcomes: Outcome[];
}

export interface Outcome {
  id: string;
  description: string;
  achieved: boolean;
  date: Date;
  relationshipId: string;
}

export interface FulfillmentDisplay {
  userId: string;
  lifeAreas: LifeArea[];
  relationships: Relationship[];
  monthlyAudits: MonthlyAudit[];
  overallStatus: 'thriving' | 'balanced' | 'struggling';
}

export interface MonthlyAudit {
  id: string;
  month: string; // YYYY-MM
  areasReviewed: string[];
  boundariesSet: string[];
  boundariesReleased: string[];
  insights: string[];
  completedAt: Date;
}

// 4. Assessment Tool Types
export interface RelationshipAssessment {
  id: string;
  relationshipId: string;
  commitmentId?: string;
  score: 1 | 2 | 3 | 4 | 5;
  trust: 1 | 2 | 3 | 4 | 5;
  reliability: 1 | 2 | 3 | 4 | 5;
  openness: 1 | 2 | 3 | 4 | 5;
  notes: string;
  assessedAt: Date;
  weekend: 2 | 3 | 4 | 5; // Weekend 2-5 rating
}

export interface AssessmentSummary {
  relationshipId: string;
  averageScore: number;
  trend: 'improving' | 'stable' | 'declining';
  historicalScores: { date: Date; score: number }[];
  recommendations: string[];
}

export interface AssessmentTool {
  userId: string;
  assessments: RelationshipAssessment[];
  summaries: AssessmentSummary[];
  lastAssessment: Date;
  insights: Insight[];
}

export interface Insight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'celebration';
  title: string;
  description: string;
  relatedIds: string[]; // Can be relationship, commitment, or area IDs
  createdAt: Date;
  dismissed: boolean;
}

// Integrated Display State
export interface IntegratedDisplay {
  contribution: ContributionDisplay;
  autobiography: AutobiographyTimeline;
  fulfillment: FulfillmentDisplay;
  assessment: AssessmentTool;
  connections: Connection[];
}

export interface Connection {
  fromComponent: 'contribution' | 'autobiography' | 'fulfillment' | 'assessment';
  toComponent: 'contribution' | 'autobiography' | 'fulfillment' | 'assessment';
  dataType: string;
  description: string;
}