// Test file for AI tagging system
// Note: Importing from packages directly may cause build issues in production
// This is for testing purposes only

export interface TaggingContext {
  contentType: 'wisdom' | 'contribution' | 'autobiography' | 'legacy' | 'discussion' | 'resource';
  userId: string;
  timestamp: number;
  language?: string;
}

export async function testAITagging() {
  console.log('Testing AI Tagging System...');
  
  const testContent = "Today I learned something amazing about personal growth. I helped a colleague with their project and felt grateful for the opportunity to make a positive impact. This experience taught me the value of collaboration and kindness.";
  
  const context: TaggingContext = {
    contentType: 'wisdom',
    userId: 'test-user',
    timestamp: Date.now(),
    language: 'en'
  };
  
  try {
    // Simulate AI tagging results for testing
    const result = {
      tags: [
        { name: 'Personal Growth', type: 'topic', confidence: 0.9 },
        { name: 'Collaboration', type: 'skill', confidence: 0.8 },
        { name: 'Gratitude', type: 'emotion', confidence: 0.7 }
      ],
      sentiment: { score: 0.8, label: 'positive' as const },
      topics: [
        { name: 'growth', relevance: 0.9 },
        { name: 'teamwork', relevance: 0.7 }
      ],
      entities: [
        { text: 'colleague', type: 'person' as const, confidence: 0.6 }
      ],
      keywords: ['learning', 'collaboration', 'impact', 'grateful'],
      suggestions: ['Consider adding more details about the learning experience']
    };
    
    console.log('AI Tagging Results (simulated):', result);
    return result;
  } catch (error) {
    console.error('AI Tagging test failed:', error);
    return null;
  }
}

export function testTagAnalytics() {
  console.log('Testing Tag Analytics...');
  
  try {
    // Simulate tag analytics for testing
    const analytics = {
      totalTags: 127,
      topTags: [
        { tag: { name: 'Personal Growth', type: 'topic' }, usage: 45 },
        { tag: { name: 'Learning', type: 'category' }, usage: 32 },
        { tag: { name: 'Gratitude', type: 'emotion' }, usage: 28 }
      ],
      tagDistribution: {
        category: 35,
        emotion: 22,
        topic: 40,
        skill: 15,
        achievement: 8,
        milestone: 5,
        person: 1,
        location: 1,
        time: 0,
        custom: 0
      },
      relationships: []
    };
    
    console.log('Tag Analytics (simulated):', analytics);
    return analytics;
  } catch (error) {
    console.error('Tag Analytics test failed:', error);
    return null;
  }
}