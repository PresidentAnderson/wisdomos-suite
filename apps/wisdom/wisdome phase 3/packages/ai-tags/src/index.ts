// WisdomOS AI Auto-Tagging System
// Automatically generates tags for content using AI analysis

export interface Tag {
  id: string;
  name: string;
  type: 'category' | 'emotion' | 'topic' | 'skill' | 'achievement' | 'milestone' | 'person' | 'location' | 'time' | 'custom';
  confidence: number; // 0-1 confidence score
  color?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface TaggingContext {
  contentType: 'wisdom' | 'contribution' | 'autobiography' | 'legacy' | 'discussion' | 'resource';
  userId: string;
  timestamp: number;
  language?: string;
  existingTags?: Tag[];
}

export interface TaggingResult {
  tags: Tag[];
  keywords: string[];
  categories: string[];
  sentiment: {
    score: number; // -1 to 1
    label: 'positive' | 'negative' | 'neutral' | 'mixed';
  };
  topics: Array<{
    name: string;
    relevance: number;
  }>;
  entities: Array<{
    text: string;
    type: 'person' | 'location' | 'organization' | 'event' | 'date';
    confidence: number;
  }>;
  suggestions: string[];
}

export class AITaggingEngine {
  private readonly tagDatabase: Map<string, Tag> = new Map();
  private readonly userTagHistory: Map<string, Tag[]> = new Map();
  private readonly tagRelationships: Map<string, string[]> = new Map();
  
  // Predefined tag templates for different content types
  private readonly tagTemplates = {
    wisdom: {
      categories: ['insight', 'reflection', 'learning', 'experience', 'advice', 'observation'],
      emotions: ['grateful', 'inspired', 'contemplative', 'hopeful', 'determined', 'peaceful'],
      topics: ['personal-growth', 'relationships', 'career', 'health', 'spirituality', 'creativity']
    },
    contribution: {
      categories: ['achievement', 'help', 'creation', 'collaboration', 'innovation', 'leadership'],
      skills: ['technical', 'creative', 'communication', 'problem-solving', 'mentoring', 'organizing'],
      impact: ['individual', 'team', 'community', 'organization', 'society', 'global']
    },
    autobiography: {
      periods: ['childhood', 'adolescence', 'young-adult', 'middle-age', 'senior', 'milestone'],
      themes: ['family', 'education', 'career', 'relationships', 'challenges', 'achievements'],
      emotions: ['joy', 'pride', 'nostalgia', 'growth', 'resilience', 'transformation']
    },
    legacy: {
      types: ['document', 'message', 'instruction', 'memory', 'wisdom', 'asset'],
      recipients: ['family', 'friends', 'colleagues', 'community', 'future-self', 'public'],
      importance: ['critical', 'high', 'medium', 'low', 'sentimental', 'practical']
    }
  };

  constructor() {
    this.initializeTagDatabase();
  }

  private initializeTagDatabase(): void {
    // Initialize with common tags
    const commonTags = [
      { id: 'growth', name: 'Personal Growth', type: 'topic' as const, color: '#10B981' },
      { id: 'family', name: 'Family', type: 'topic' as const, color: '#EC4899' },
      { id: 'career', name: 'Career', type: 'topic' as const, color: '#3B82F6' },
      { id: 'health', name: 'Health', type: 'topic' as const, color: '#EF4444' },
      { id: 'learning', name: 'Learning', type: 'topic' as const, color: '#8B5CF6' },
      { id: 'achievement', name: 'Achievement', type: 'achievement' as const, color: '#F59E0B' },
      { id: 'milestone', name: 'Milestone', type: 'milestone' as const, color: '#14B8A6' },
      { id: 'reflection', name: 'Reflection', type: 'category' as const, color: '#6366F1' },
      { id: 'gratitude', name: 'Gratitude', type: 'emotion' as const, color: '#84CC16' },
      { id: 'challenge', name: 'Challenge', type: 'category' as const, color: '#F97316' }
    ];

    commonTags.forEach(tag => {
      this.tagDatabase.set(tag.id, { ...tag, confidence: 1.0 });
    });
  }

  /**
   * Analyze content and generate AI tags
   */
  public async analyzeContent(
    content: string,
    context: TaggingContext
  ): Promise<TaggingResult> {
    // Perform various analyses
    const [
      nlpAnalysis,
      sentimentAnalysis,
      entityExtraction,
      topicModeling,
      keywordExtraction
    ] = await Promise.all([
      this.performNLPAnalysis(content),
      this.analyzeSentiment(content),
      this.extractEntities(content),
      this.modelTopics(content, context),
      this.extractKeywords(content)
    ]);

    // Generate tags based on analyses
    const tags = this.generateTags(
      content,
      context,
      nlpAnalysis,
      sentimentAnalysis,
      entityExtraction,
      topicModeling
    );

    // Get personalized suggestions
    const suggestions = this.generateSuggestions(
      content,
      context,
      tags,
      this.getUserTagHistory(context.userId)
    );

    return {
      tags,
      keywords: keywordExtraction,
      categories: this.categorizeContent(content, context),
      sentiment: sentimentAnalysis,
      topics: topicModeling,
      entities: entityExtraction,
      suggestions
    };
  }

  /**
   * Natural Language Processing Analysis
   */
  private async performNLPAnalysis(content: string): Promise<any> {
    // Simplified NLP analysis
    const words = content.toLowerCase().split(/\s+/);
    const wordFrequency = new Map<string, number>();
    
    words.forEach(word => {
      const cleaned = word.replace(/[^a-z0-9]/g, '');
      if (cleaned.length > 3) {
        wordFrequency.set(cleaned, (wordFrequency.get(cleaned) || 0) + 1);
      }
    });

    // Identify key phrases
    const phrases = this.extractPhrases(content);
    
    return {
      wordCount: words.length,
      uniqueWords: wordFrequency.size,
      topWords: Array.from(wordFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      phrases
    };
  }

  /**
   * Sentiment Analysis
   */
  private async analyzeSentiment(content: string): Promise<TaggingResult['sentiment']> {
    // Simplified sentiment analysis using keyword matching
    const positiveWords = ['happy', 'joy', 'love', 'excellent', 'amazing', 'wonderful', 'grateful', 'blessed', 'success', 'achievement'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'disappointed', 'failure', 'lost', 'worried', 'anxious', 'stressed', 'difficult'];
    
    const words = content.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });
    
    const totalWords = words.length;
    const score = (positiveScore - negativeScore) / Math.max(totalWords * 0.1, 1);
    
    let label: 'positive' | 'negative' | 'neutral' | 'mixed';
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';
    else if (positiveScore > 0 && negativeScore > 0) label = 'mixed';
    else label = 'neutral';
    
    return {
      score: Math.max(-1, Math.min(1, score)),
      label
    };
  }

  /**
   * Entity Extraction
   */
  private async extractEntities(content: string): Promise<TaggingResult['entities']> {
    const entities: TaggingResult['entities'] = [];
    
    // Simple pattern matching for dates
    const datePattern = /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4})\b/gi;
    const dates = content.match(datePattern) || [];
    dates.forEach(date => {
      entities.push({
        text: date,
        type: 'date',
        confidence: 0.9
      });
    });
    
    // Pattern matching for capitalized words (potential names/places)
    const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const capitalized = content.match(capitalizedPattern) || [];
    
    capitalized.forEach(text => {
      // Simple heuristics to classify entities
      if (this.isLikelyPerson(text)) {
        entities.push({
          text,
          type: 'person',
          confidence: 0.7
        });
      } else if (this.isLikelyLocation(text)) {
        entities.push({
          text,
          type: 'location',
          confidence: 0.7
        });
      }
    });
    
    return entities;
  }

  /**
   * Topic Modeling
   */
  private async modelTopics(
    content: string,
    context: TaggingContext
  ): Promise<TaggingResult['topics']> {
    const topics: TaggingResult['topics'] = [];
    const templates = this.tagTemplates[context.contentType] || this.tagTemplates.wisdom;
    
    // Check content against topic templates
    Object.entries(templates).forEach(([category, keywords]) => {
      if (Array.isArray(keywords)) {
        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = content.match(regex);
          if (matches) {
            const existing = topics.find(t => t.name === keyword);
            if (existing) {
              existing.relevance += matches.length * 0.1;
            } else {
              topics.push({
                name: keyword,
                relevance: Math.min(1, matches.length * 0.1)
              });
            }
          }
        });
      }
    });
    
    // Sort by relevance
    return topics.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  /**
   * Keyword Extraction
   */
  private async extractKeywords(content: string): Promise<string[]> {
    // Simple TF-IDF inspired keyword extraction
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'shall']);
    
    const words = content.toLowerCase().split(/\s+/)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 3 && !stopWords.has(w));
    
    const frequency = new Map<string, number>();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });
    
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Generate tags based on all analyses
   */
  private generateTags(
    content: string,
    context: TaggingContext,
    nlpAnalysis: any,
    sentiment: TaggingResult['sentiment'],
    entities: TaggingResult['entities'],
    topics: TaggingResult['topics']
  ): Tag[] {
    const tags: Tag[] = [];
    const tagIds = new Set<string>();
    
    // Add sentiment-based tags
    if (sentiment.label === 'positive') {
      this.addTag(tags, tagIds, 'positive-vibes', 'Positive Vibes', 'emotion', 0.8, '#10B981');
    } else if (sentiment.label === 'negative') {
      this.addTag(tags, tagIds, 'challenging', 'Challenging', 'emotion', 0.8, '#EF4444');
    }
    
    // Add topic-based tags
    topics.forEach(topic => {
      if (topic.relevance > 0.3) {
        const tagId = topic.name.toLowerCase().replace(/\s+/g, '-');
        this.addTag(
          tags,
          tagIds,
          tagId,
          topic.name.charAt(0).toUpperCase() + topic.name.slice(1),
          'topic',
          topic.relevance,
          this.getColorForTopic(topic.name)
        );
      }
    });
    
    // Add entity-based tags
    entities.forEach(entity => {
      if (entity.confidence > 0.6) {
        const tagId = entity.text.toLowerCase().replace(/\s+/g, '-');
        this.addTag(
          tags,
          tagIds,
          tagId,
          entity.text,
          entity.type as any,
          entity.confidence,
          this.getColorForEntityType(entity.type)
        );
      }
    });
    
    // Add content-type specific tags
    this.addContentSpecificTags(tags, tagIds, content, context);
    
    // Add time-based tags
    this.addTimeBasedTags(tags, tagIds, context.timestamp);
    
    // Limit to top 10 tags
    return tags.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }

  /**
   * Helper to add tag without duplicates
   */
  private addTag(
    tags: Tag[],
    tagIds: Set<string>,
    id: string,
    name: string,
    type: Tag['type'],
    confidence: number,
    color?: string
  ): void {
    if (!tagIds.has(id)) {
      tagIds.add(id);
      tags.push({
        id,
        name,
        type,
        confidence,
        color: color || this.generateColorForTag(id)
      });
    }
  }

  /**
   * Add content-specific tags
   */
  private addContentSpecificTags(
    tags: Tag[],
    tagIds: Set<string>,
    content: string,
    context: TaggingContext
  ): void {
    const contentLength = content.length;
    
    // Length-based tags
    if (contentLength < 100) {
      this.addTag(tags, tagIds, 'brief', 'Brief', 'category', 0.7, '#6B7280');
    } else if (contentLength > 1000) {
      this.addTag(tags, tagIds, 'detailed', 'Detailed', 'category', 0.7, '#4B5563');
    }
    
    // Content type specific
    switch (context.contentType) {
      case 'wisdom':
        if (content.includes('learned') || content.includes('realized')) {
          this.addTag(tags, tagIds, 'lesson', 'Lesson', 'category', 0.8, '#8B5CF6');
        }
        break;
      case 'contribution':
        if (content.includes('helped') || content.includes('assisted')) {
          this.addTag(tags, tagIds, 'helping', 'Helping Others', 'category', 0.8, '#10B981');
        }
        break;
      case 'autobiography':
        if (content.includes('born') || content.includes('childhood')) {
          this.addTag(tags, tagIds, 'early-life', 'Early Life', 'milestone', 0.8, '#F59E0B');
        }
        break;
    }
  }

  /**
   * Add time-based tags
   */
  private addTimeBasedTags(
    tags: Tag[],
    tagIds: Set<string>,
    timestamp: number
  ): void {
    const date = new Date(timestamp);
    const month = date.getMonth();
    const hour = date.getHours();
    
    // Season tags
    if (month >= 2 && month <= 4) {
      this.addTag(tags, tagIds, 'spring', 'Spring', 'time', 0.6, '#10B981');
    } else if (month >= 5 && month <= 7) {
      this.addTag(tags, tagIds, 'summer', 'Summer', 'time', 0.6, '#F59E0B');
    } else if (month >= 8 && month <= 10) {
      this.addTag(tags, tagIds, 'autumn', 'Autumn', 'time', 0.6, '#F97316');
    } else {
      this.addTag(tags, tagIds, 'winter', 'Winter', 'time', 0.6, '#3B82F6');
    }
    
    // Time of day tags
    if (hour >= 5 && hour < 12) {
      this.addTag(tags, tagIds, 'morning', 'Morning', 'time', 0.5, '#FCD34D');
    } else if (hour >= 12 && hour < 17) {
      this.addTag(tags, tagIds, 'afternoon', 'Afternoon', 'time', 0.5, '#FB923C');
    } else if (hour >= 17 && hour < 21) {
      this.addTag(tags, tagIds, 'evening', 'Evening', 'time', 0.5, '#A78BFA');
    } else {
      this.addTag(tags, tagIds, 'night', 'Night', 'time', 0.5, '#6366F1');
    }
  }

  /**
   * Generate personalized suggestions
   */
  private generateSuggestions(
    content: string,
    context: TaggingContext,
    generatedTags: Tag[],
    userHistory: Tag[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Suggest frequently used tags not in generated list
    const generatedIds = new Set(generatedTags.map(t => t.id));
    const frequentTags = this.getFrequentTags(userHistory)
      .filter(t => !generatedIds.has(t.id))
      .slice(0, 3);
    
    frequentTags.forEach(tag => {
      suggestions.push(`Consider adding "${tag.name}" based on your history`);
    });
    
    // Suggest related tags
    generatedTags.slice(0, 3).forEach(tag => {
      const related = this.getRelatedTags(tag.id);
      if (related.length > 0) {
        suggestions.push(`Related to "${tag.name}": ${related.slice(0, 2).join(', ')}`);
      }
    });
    
    // Content-specific suggestions
    if (context.contentType === 'wisdom' && !generatedIds.has('gratitude')) {
      suggestions.push('Consider adding what you\'re grateful for');
    }
    
    if (context.contentType === 'contribution' && !generatedIds.has('impact')) {
      suggestions.push('Describe the impact of your contribution');
    }
    
    return suggestions.slice(0, 5);
  }

  /**
   * Helper methods
   */
  private extractPhrases(content: string): string[] {
    // Simple n-gram extraction (bigrams and trigrams)
    const words = content.toLowerCase().split(/\s+/);
    const phrases: string[] = [];
    
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
      if (i < words.length - 2) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }
    
    return phrases;
  }

  private isLikelyPerson(text: string): boolean {
    const personPatterns = [
      /^(Mr|Mrs|Ms|Dr|Prof)\.?\s+/,
      /\s+(Jr|Sr|III|IV)$/,
      /^[A-Z][a-z]+\s+[A-Z][a-z]+$/
    ];
    return personPatterns.some(pattern => pattern.test(text));
  }

  private isLikelyLocation(text: string): boolean {
    const locationKeywords = ['City', 'Town', 'Street', 'Avenue', 'Road', 'Park', 'Beach', 'Mountain', 'Lake', 'River'];
    return locationKeywords.some(keyword => text.includes(keyword));
  }

  private getColorForTopic(topic: string): string {
    const colors: Record<string, string> = {
      'personal-growth': '#10B981',
      'relationships': '#EC4899',
      'career': '#3B82F6',
      'health': '#EF4444',
      'spirituality': '#8B5CF6',
      'creativity': '#F59E0B'
    };
    return colors[topic] || '#6B7280';
  }

  private getColorForEntityType(type: string): string {
    const colors: Record<string, string> = {
      'person': '#3B82F6',
      'location': '#10B981',
      'organization': '#8B5CF6',
      'event': '#F59E0B',
      'date': '#6B7280'
    };
    return colors[type] || '#9CA3AF';
  }

  private generateColorForTag(tagId: string): string {
    // Generate consistent color based on tag ID
    const colors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'];
    let hash = 0;
    for (let i = 0; i < tagId.length; i++) {
      hash = tagId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  private getUserTagHistory(userId: string): Tag[] {
    return this.userTagHistory.get(userId) || [];
  }

  private getFrequentTags(userHistory: Tag[]): Tag[] {
    const frequency = new Map<string, { tag: Tag; count: number }>();
    
    userHistory.forEach(tag => {
      const existing = frequency.get(tag.id);
      if (existing) {
        existing.count++;
      } else {
        frequency.set(tag.id, { tag, count: 1 });
      }
    });
    
    return Array.from(frequency.values())
      .sort((a, b) => b.count - a.count)
      .map(({ tag }) => tag);
  }

  private getRelatedTags(tagId: string): string[] {
    return this.tagRelationships.get(tagId) || [];
  }

  private categorizeContent(content: string, context: TaggingContext): string[] {
    const categories: string[] = [];
    const templates = this.tagTemplates[context.contentType];
    
    if (templates && templates.categories) {
      templates.categories.forEach(category => {
        if (content.toLowerCase().includes(category)) {
          categories.push(category);
        }
      });
    }
    
    return categories;
  }

  /**
   * Train the tagging engine with user feedback
   */
  public async trainWithFeedback(
    content: string,
    context: TaggingContext,
    approvedTags: Tag[],
    rejectedTags: Tag[]
  ): Promise<void> {
    // Update user history
    const userId = context.userId;
    const history = this.userTagHistory.get(userId) || [];
    history.push(...approvedTags);
    this.userTagHistory.set(userId, history);
    
    // Update tag relationships
    for (let i = 0; i < approvedTags.length; i++) {
      for (let j = i + 1; j < approvedTags.length; j++) {
        const tag1 = approvedTags[i];
        const tag2 = approvedTags[j];
        
        // Add bidirectional relationship
        const related1 = this.tagRelationships.get(tag1.id) || [];
        if (!related1.includes(tag2.name)) {
          related1.push(tag2.name);
          this.tagRelationships.set(tag1.id, related1);
        }
        
        const related2 = this.tagRelationships.get(tag2.id) || [];
        if (!related2.includes(tag1.name)) {
          related2.push(tag1.name);
          this.tagRelationships.set(tag2.id, related2);
        }
      }
    }
    
    // Store feedback for future improvements
    console.log('Training data collected:', {
      content: content.substring(0, 100),
      approved: approvedTags.map(t => t.name),
      rejected: rejectedTags.map(t => t.name)
    });
  }

  /**
   * Batch process multiple contents
   */
  public async batchAnalyze(
    contents: Array<{ content: string; context: TaggingContext }>
  ): Promise<TaggingResult[]> {
    return Promise.all(
      contents.map(({ content, context }) => this.analyzeContent(content, context))
    );
  }

  /**
   * Export tag analytics
   */
  public getTagAnalytics(userId?: string): {
    totalTags: number;
    topTags: Array<{ tag: Tag; usage: number }>;
    tagDistribution: Record<Tag['type'], number>;
    relationships: Array<{ from: string; to: string; strength: number }>;
  } {
    const allTags = userId
      ? this.getUserTagHistory(userId)
      : Array.from(this.tagDatabase.values());
    
    // Calculate tag usage
    const usage = new Map<string, number>();
    allTags.forEach(tag => {
      usage.set(tag.id, (usage.get(tag.id) || 0) + 1);
    });
    
    // Tag type distribution
    const distribution: Record<Tag['type'], number> = {
      category: 0,
      emotion: 0,
      topic: 0,
      skill: 0,
      achievement: 0,
      milestone: 0,
      person: 0,
      location: 0,
      time: 0,
      custom: 0
    };
    
    allTags.forEach(tag => {
      distribution[tag.type]++;
    });
    
    // Tag relationships
    const relationships: Array<{ from: string; to: string; strength: number }> = [];
    this.tagRelationships.forEach((related, tagId) => {
      related.forEach(relatedTag => {
        relationships.push({
          from: tagId,
          to: relatedTag,
          strength: 0.5 // Could be calculated based on co-occurrence
        });
      });
    });
    
    return {
      totalTags: allTags.length,
      topTags: Array.from(usage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tagId, count]) => ({
          tag: this.tagDatabase.get(tagId) || { id: tagId, name: tagId, type: 'custom', confidence: 1 },
          usage: count
        })),
      tagDistribution: distribution,
      relationships
    };
  }
}

// Export singleton instance
export const aiTagging = new AITaggingEngine();