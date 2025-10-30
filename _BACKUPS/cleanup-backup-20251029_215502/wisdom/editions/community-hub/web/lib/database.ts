import { supabase } from './supabase';
import type {
  BoundaryAudit,
  UpsetDocumentation,
  FulfillmentDisplay,
  AutobiographyEntry,
  Contribution,
  WisdomCircle,
  CircleMembership,
  UserAchievement
} from './supabase';

// Boundary Audit Functions
export const boundaryAuditApi = {
  async getAll(userId: string): Promise<BoundaryAudit[]> {
    const { data, error } = await supabase
      .from('boundary_audits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string, userId: string): Promise<BoundaryAudit | null> {
    const { data, error } = await supabase
      .from('boundary_audits')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(auditData: Omit<BoundaryAudit, 'id' | 'created_at' | 'updated_at'>): Promise<BoundaryAudit> {
    const { data, error } = await supabase
      .from('boundary_audits')
      .insert([auditData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, userId: string, updates: Partial<BoundaryAudit>): Promise<BoundaryAudit> {
    const { data, error } = await supabase
      .from('boundary_audits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('boundary_audits')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// Upset Documentation Functions
export const upsetDocumentationApi = {
  async getAll(userId: string): Promise<UpsetDocumentation[]> {
    const { data, error } = await supabase
      .from('upset_documentations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string, userId: string): Promise<UpsetDocumentation | null> {
    const { data, error } = await supabase
      .from('upset_documentations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(docData: Omit<UpsetDocumentation, 'id' | 'created_at' | 'updated_at'>): Promise<UpsetDocumentation> {
    const { data, error } = await supabase
      .from('upset_documentations')
      .insert([docData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, userId: string, updates: Partial<UpsetDocumentation>): Promise<UpsetDocumentation> {
    const { data, error } = await supabase
      .from('upset_documentations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('upset_documentations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// Fulfillment Display Functions
export const fulfillmentDisplayApi = {
  async getAll(userId: string): Promise<FulfillmentDisplay[]> {
    const { data, error } = await supabase
      .from('fulfillment_displays')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string, userId: string): Promise<FulfillmentDisplay | null> {
    const { data, error } = await supabase
      .from('fulfillment_displays')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(displayData: Omit<FulfillmentDisplay, 'id' | 'created_at' | 'updated_at'>): Promise<FulfillmentDisplay> {
    const { data, error } = await supabase
      .from('fulfillment_displays')
      .insert([displayData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, userId: string, updates: Partial<FulfillmentDisplay>): Promise<FulfillmentDisplay> {
    const { data, error } = await supabase
      .from('fulfillment_displays')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('fulfillment_displays')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// Autobiography Functions
export const autobiographyApi = {
  async getAll(userId: string): Promise<AutobiographyEntry[]> {
    const { data, error } = await supabase
      .from('autobiography_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date_occurred', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string, userId: string): Promise<AutobiographyEntry | null> {
    const { data, error } = await supabase
      .from('autobiography_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(entryData: Omit<AutobiographyEntry, 'id' | 'created_at' | 'updated_at'>): Promise<AutobiographyEntry> {
    const { data, error } = await supabase
      .from('autobiography_entries')
      .insert([entryData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, userId: string, updates: Partial<AutobiographyEntry>): Promise<AutobiographyEntry> {
    const { data, error } = await supabase
      .from('autobiography_entries')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('autobiography_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getMilestones(userId: string): Promise<AutobiographyEntry[]> {
    const { data, error } = await supabase
      .from('autobiography_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('is_milestone', true)
      .order('date_occurred', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Contributions Functions
export const contributionsApi = {
  async getAll(userId?: string, circleId?: string): Promise<Contribution[]> {
    let query = supabase
      .from('contributions')
      .select(`
        *,
        users!inner(username, full_name)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (circleId) {
      query = query.eq('circle_id', circleId);
    }

    // If no userId specified, only get public contributions
    if (!userId) {
      query = query.eq('visibility', 'public');
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Contribution | null> {
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        *,
        users!inner(username, full_name)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(contributionData: Omit<Contribution, 'id' | 'created_at' | 'updated_at' | 'feedback_count' | 'like_count'>): Promise<Contribution> {
    const { data, error } = await supabase
      .from('contributions')
      .insert([{
        ...contributionData,
        feedback_count: 0,
        like_count: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, userId: string, updates: Partial<Contribution>): Promise<Contribution> {
    const { data, error } = await supabase
      .from('contributions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// Wisdom Circles Functions
export const wisdomCirclesApi = {
  async getAll(): Promise<WisdomCircle[]> {
    const { data, error } = await supabase
      .from('wisdom_circles')
      .select('*')
      .eq('privacy_level', 'public')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUserCircles(userId: string): Promise<WisdomCircle[]> {
    const { data, error } = await supabase
      .from('wisdom_circles')
      .select(`
        *,
        circle_memberships!inner(user_id)
      `)
      .eq('circle_memberships.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<WisdomCircle | null> {
    const { data, error } = await supabase
      .from('wisdom_circles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(circleData: Omit<WisdomCircle, 'id' | 'created_at' | 'updated_at' | 'member_count'>): Promise<WisdomCircle> {
    const { data, error } = await supabase
      .from('wisdom_circles')
      .insert([{
        ...circleData,
        member_count: 1
      }])
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    await supabase
      .from('circle_memberships')
      .insert([{
        circle_id: data.id,
        user_id: data.creator_id,
        role: 'admin'
      }]);

    return data;
  },

  async join(circleId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('circle_memberships')
      .insert([{
        circle_id: circleId,
        user_id: userId,
        role: 'member'
      }]);

    if (error) throw error;

    // Update member count
    const { error: updateError } = await supabase.rpc('increment_circle_members', {
      circle_id: circleId
    });

    if (updateError) throw updateError;
  },

  async leave(circleId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('circle_memberships')
      .delete()
      .eq('circle_id', circleId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update member count
    const { error: updateError } = await supabase.rpc('decrement_circle_members', {
      circle_id: circleId
    });

    if (updateError) throw updateError;
  }
};

// User Achievements Functions
export const achievementsApi = {
  async getAll(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async award(userId: string, achievementData: Omit<UserAchievement, 'id' | 'user_id' | 'earned_at'>): Promise<UserAchievement> {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        ...achievementData,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Analytics Functions
export const analyticsApi = {
  async getUserStats(userId: string) {
    const [
      boundaryAudits,
      upsetDocs,
      fulfillmentDisplays,
      autobiographyEntries,
      contributions,
      achievements
    ] = await Promise.all([
      boundaryAuditApi.getAll(userId),
      upsetDocumentationApi.getAll(userId),
      fulfillmentDisplayApi.getAll(userId),
      autobiographyApi.getAll(userId),
      contributionsApi.getAll(userId),
      achievementsApi.getAll(userId)
    ]);

    return {
      totalBoundaryAudits: boundaryAudits.length,
      totalUpsetDocs: upsetDocs.length,
      totalFulfillmentDisplays: fulfillmentDisplays.length,
      totalAutobiographyEntries: autobiographyEntries.length,
      totalContributions: contributions.length,
      totalAchievements: achievements.length,
      recentActivity: {
        boundaryAudits: boundaryAudits.slice(0, 5),
        upsetDocs: upsetDocs.slice(0, 5),
        fulfillmentDisplays: fulfillmentDisplays.slice(0, 5),
        autobiographyEntries: autobiographyEntries.slice(0, 5),
        contributions: contributions.slice(0, 5)
      }
    };
  },

  async getComprehensiveAnalytics(userId: string, timeRange: string = '7d') {
    const [
      boundaryAudits,
      upsetDocs,
      fulfillmentDisplays,
      autobiographyEntries,
      contributions,
      achievements
    ] = await Promise.all([
      boundaryAuditApi.getAll(userId),
      upsetDocumentationApi.getAll(userId),
      fulfillmentDisplayApi.getAll(userId),
      autobiographyApi.getAll(userId),
      contributionsApi.getAll(userId),
      achievementsApi.getAll(userId)
    ]);

    // Helper function to filter by date range
    const filterByTimeRange = (items: any[]) => {
      const days = parseInt(timeRange.replace('d', ''));
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      
      return items.filter(item => new Date(item.created_at) >= cutoff);
    };

    // Get filtered data for time range
    const filteredBoundary = filterByTimeRange(boundaryAudits);
    const filteredUpset = filterByTimeRange(upsetDocs);
    const filteredFulfillment = filterByTimeRange(fulfillmentDisplays);
    const filteredAutobiography = filterByTimeRange(autobiographyEntries);
    const filteredContributions = filterByTimeRange(contributions);

    // Calculate weekly progress (last 7 days)
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTotal = [
        ...boundaryAudits,
        ...upsetDocs,
        ...fulfillmentDisplays,
        ...autobiographyEntries
      ].filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dayStart && itemDate <= dayEnd;
      }).length;

      return dayTotal;
    });

    // Calculate category breakdown
    const categoryBreakdown = {
      boundary: filteredBoundary.length,
      upset: filteredUpset.length,
      fulfillment: filteredFulfillment.length,
      autobiography: filteredAutobiography.length
    };

    // Calculate wellness scores (0-100)
    const productivityScore = Math.min(100, (filteredBoundary.length * 20) + (filteredFulfillment.length * 15));
    const wellnessScore = Math.min(100, (filteredUpset.length * 25) + (filteredAutobiography.length * 20));
    const learningScore = Math.min(100, (filteredAutobiography.length * 30) + (achievements.length * 10));
    const socialScore = Math.min(100, filteredContributions.length * 20);
    const insightScore = Math.min(100, 
      (filteredBoundary.filter(b => b.status === 'completed').length * 25) +
      (filteredUpset.filter(u => u.status === 'resolved').length * 30) +
      (filteredFulfillment.length * 15)
    );

    // Calculate growth metrics
    const previousPeriodData = this.getPreviousPeriodData(userId, timeRange);
    const currentTotal = Object.values(categoryBreakdown).reduce((sum, count) => sum + count, 0);
    const weeklyGrowth = currentTotal > 0 ? Math.round(((currentTotal - (await previousPeriodData).total) / currentTotal) * 100) : 0;
    const monthlyGrowth = weeklyGrowth * 4; // Estimate

    return {
      totalEntries: currentTotal,
      weeklyProgress,
      categoryBreakdown,
      streakData: weeklyProgress,
      moodTracking: {
        positive: filteredUpset.filter(u => u.status === 'resolved').length,
        neutral: filteredUpset.filter(u => u.status === 'processing').length,
        challenging: filteredUpset.filter(u => u.status === 'archived').length
      },
      timeSpentAnalysis: {
        morning: Math.floor(Math.random() * currentTotal * 0.3),
        afternoon: Math.floor(Math.random() * currentTotal * 0.4),
        evening: Math.floor(Math.random() * currentTotal * 0.3)
      },
      goalsProgress: {
        completed: filteredBoundary.filter(b => b.status === 'completed').length,
        total: filteredBoundary.length
      },
      insightScore,
      weeklyGrowth,
      monthlyGrowth,
      productivityScore,
      wellnessScore,
      learningScore,
      socialScore,
      activityHeatmap: this.generateActivityHeatmap(boundaryAudits, upsetDocs, fulfillmentDisplays, autobiographyEntries),
      achievements: achievements.slice(0, 5)
    };
  },

  async getPreviousPeriodData(userId: string, timeRange: string) {
    // Calculate previous period data for comparison
    const days = parseInt(timeRange.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days * 2));
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - days);

    const { data, error } = await supabase
      .from('boundary_audits')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    return { total: data?.length || 0 };
  },

  generateActivityHeatmap(boundaryAudits: any[], upsetDocs: any[], fulfillmentDisplays: any[], autobiographyEntries: any[]) {
    const heatmap: { [key: string]: number } = {};
    const allItems = [...boundaryAudits, ...upsetDocs, ...fulfillmentDisplays, ...autobiographyEntries];

    // Generate last 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const count = allItems.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.toISOString().split('T')[0] === dateString;
      }).length;

      if (count > 0) {
        heatmap[dateString] = count;
      }
    }

    return heatmap;
  },

  async getActivityFeed(userId: string, limit: number = 20) {
    // Get recent activity across all tools
    const [
      boundaryAudits,
      upsetDocs,
      fulfillmentDisplays,
      autobiographyEntries,
      contributions
    ] = await Promise.all([
      boundaryAuditApi.getAll(userId),
      upsetDocumentationApi.getAll(userId),
      fulfillmentDisplayApi.getAll(userId),
      autobiographyApi.getAll(userId),
      contributionsApi.getAll(userId)
    ]);

    const activities = [
      ...boundaryAudits.map(item => ({ ...item, type: 'boundary_audit' })),
      ...upsetDocs.map(item => ({ ...item, type: 'upset_documentation' })),
      ...fulfillmentDisplays.map(item => ({ ...item, type: 'fulfillment_display' })),
      ...autobiographyEntries.map(item => ({ ...item, type: 'autobiography_entry' })),
      ...contributions.map(item => ({ ...item, type: 'contribution' }))
    ];

    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  async exportUserData(userId: string) {
    const [
      boundaryAudits,
      upsetDocs,
      fulfillmentDisplays,
      autobiographyEntries,
      contributions,
      achievements
    ] = await Promise.all([
      boundaryAuditApi.getAll(userId),
      upsetDocumentationApi.getAll(userId),
      fulfillmentDisplayApi.getAll(userId),
      autobiographyApi.getAll(userId),
      contributionsApi.getAll(userId),
      achievementsApi.getAll(userId)
    ]);

    return {
      exportDate: new Date().toISOString(),
      userId,
      data: {
        boundaryAudits,
        upsetDocumentations: upsetDocs,
        fulfillmentDisplays,
        autobiographyEntries,
        contributions,
        achievements
      },
      summary: {
        totalEntries: boundaryAudits.length + upsetDocs.length + fulfillmentDisplays.length + autobiographyEntries.length,
        totalContributions: contributions.length,
        totalAchievements: achievements.length,
        firstEntry: Math.min(
          ...boundaryAudits.map(b => new Date(b.created_at).getTime()),
          ...upsetDocs.map(u => new Date(u.created_at).getTime()),
          ...fulfillmentDisplays.map(f => new Date(f.created_at).getTime()),
          ...autobiographyEntries.map(a => new Date(a.created_at).getTime())
        ),
        lastEntry: Math.max(
          ...boundaryAudits.map(b => new Date(b.created_at).getTime()),
          ...upsetDocs.map(u => new Date(u.created_at).getTime()),
          ...fulfillmentDisplays.map(f => new Date(f.created_at).getTime()),
          ...autobiographyEntries.map(a => new Date(a.created_at).getTime())
        )
      }
    };
  }
};