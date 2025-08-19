import { z } from 'zod';
import { http } from './client';

// Schemas
export const JournalCreateSchema = z.object({
  lifeAreaId: z.string().uuid(),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const ResetCreateSchema = z.object({
  lifeAreaId: z.string().uuid(),
  step1_pause: z.string().optional(),
  step2_identify: z.string().optional(),
  step3_acknowledge: z.string().optional(),
  step4_recommit: z.string().optional(),
  step5_recalibrate: z.string().optional(),
});

export const LifeAreaUpdateSchema = z.object({
  name: z.string().optional(),
  phoenixName: z.string().optional(),
  status: z.enum(['GREEN', 'YELLOW', 'RED']).optional(),
});

// Types
export type JournalCreate = z.infer<typeof JournalCreateSchema>;
export type ResetCreate = z.infer<typeof ResetCreateSchema>;
export type LifeAreaUpdate = z.infer<typeof LifeAreaUpdateSchema>;

export interface DashboardData {
  lifeAreas: Array<{
    id: string;
    name: string;
    phoenixName: string;
    status: 'GREEN' | 'YELLOW' | 'RED';
    score: number;
    upsets: number;
    brokenCommitments: number;
    recentEvents: Array<{
      title: string;
      type: string;
      date: string;
    }>;
  }>;
  phoenixStage: 'ashes' | 'fire' | 'rebirth' | 'flight';
  totalScore: number;
  badges: Array<{
    id: string;
    name: string;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
  }>;
}

// API Endpoints
export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const { data } = await http.post('/auth/login', { email, password });
      return data;
    },
    register: async (email: string, password: string, name?: string) => {
      const { data } = await http.post('/auth/register', { email, password, name });
      return data;
    },
    logout: async () => {
      const { data } = await http.post('/auth/logout');
      return data;
    },
    me: async () => {
      const { data } = await http.get('/auth/me');
      return data;
    },
  },

  // Dashboard
  dashboard: {
    get: async (): Promise<DashboardData> => {
      const { data } = await http.get('/dashboard');
      return data;
    },
    refresh: async () => {
      const { data } = await http.post('/dashboard/refresh');
      return data;
    },
  },

  // Journal
  journal: {
    create: async (input: JournalCreate) => {
      const validated = JournalCreateSchema.parse(input);
      const { data } = await http.post('/journal', validated);
      return data;
    },
    list: async (lifeAreaId?: string) => {
      const params = lifeAreaId ? { lifeAreaId } : {};
      const { data } = await http.get('/journal', { params });
      return data;
    },
    get: async (id: string) => {
      const { data } = await http.get(`/journal/${id}`);
      return data;
    },
    update: async (id: string, content: string) => {
      const { data } = await http.patch(`/journal/${id}`, { content });
      return data;
    },
    delete: async (id: string) => {
      const { data } = await http.delete(`/journal/${id}`);
      return data;
    },
    reframe: async (id: string) => {
      const { data } = await http.post(`/journal/${id}/reframe`);
      return data;
    },
  },

  // Life Areas
  lifeAreas: {
    list: async () => {
      const { data } = await http.get('/life-areas');
      return data;
    },
    get: async (id: string) => {
      const { data } = await http.get(`/life-areas/${id}`);
      return data;
    },
    update: async (id: string, input: LifeAreaUpdate) => {
      const validated = LifeAreaUpdateSchema.parse(input);
      const { data } = await http.patch(`/life-areas/${id}`, validated);
      return data;
    },
    getEvents: async (id: string) => {
      const { data } = await http.get(`/life-areas/${id}/events`);
      return data;
    },
  },

  // Reset Rituals
  resets: {
    create: async (input: ResetCreate) => {
      const validated = ResetCreateSchema.parse(input);
      const { data } = await http.post('/resets', validated);
      return data;
    },
    list: async () => {
      const { data } = await http.get('/resets');
      return data;
    },
    complete: async (id: string) => {
      const { data } = await http.post(`/resets/${id}/complete`);
      return data;
    },
  },

  // Badges
  badges: {
    list: async () => {
      const { data } = await http.get('/badges');
      return data;
    },
    unlock: async (type: string) => {
      const { data } = await http.post(`/badges/${type}/unlock`);
      return data;
    },
  },

  // Vault
  vault: {
    create: async (title: string, content: string, category?: string) => {
      const { data } = await http.post('/vault', { title, content, category });
      return data;
    },
    list: async () => {
      const { data } = await http.get('/vault');
      return data;
    },
    get: async (id: string) => {
      const { data } = await http.get(`/vault/${id}`);
      return data;
    },
    update: async (id: string, updates: any) => {
      const { data } = await http.patch(`/vault/${id}`, updates);
      return data;
    },
    delete: async (id: string) => {
      const { data } = await http.delete(`/vault/${id}`);
      return data;
    },
  },
};