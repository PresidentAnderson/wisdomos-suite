/**
 * Fulfillment Display v5 Data Models
 * Three-tier architecture: Life Areas → Subdomains → Five Dimensions
 */

export type DimensionName =
  | 'Being'
  | 'Doing'
  | 'Having'
  | 'Relating'
  | 'Becoming';

export type LifeAreaStatus =
  | 'Thriving'
  | 'Needs Attention'
  | 'Breakdown/Reset Needed';

export interface Dimension {
  name: DimensionName;
  focus: string;
  inquiry: string;
  practices: string[];
  metric?: number; // 1-5 scale
  notes?: string;
  lastUpdated?: Date;
}

export interface Subdomain {
  id: string;
  name: string;
  description?: string;
  dimensions: Dimension[];
  projects?: Project[]; // Optional: attach OKRs/initiatives
}

export interface Project {
  id: string;
  title: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

export interface LifeArea {
  id: string;
  name: string;
  phoenixName: string;
  icon: string;
  color: string;
  status: LifeAreaStatus;
  score: number; // Aggregate score 0-100
  commitments: number;
  subdomains: Subdomain[];
  acceptable?: string[]; // What's working
  noLongerTolerated?: string[]; // What needs to change
}

export interface FulfillmentDisplayData {
  lifeAreas: LifeArea[];
  lastSync: Date;
  userId: string;
}
