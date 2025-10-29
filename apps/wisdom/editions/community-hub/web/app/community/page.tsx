'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus,
  Filter,
  Search,
  TrendingUp,
  Clock,
  User,
  Award,
  Globe,
  Lock,
  Eye,
  Bookmark,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Quote,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_level: number;
  content: string;
  type: 'reflection' | 'milestone' | 'question' | 'insight' | 'achievement';
  tags: string[];
  images: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  visibility: 'public' | 'circles' | 'private';
  created_at: string;
  updated_at: string;
}

interface CommunityStats {
  total_members: number;
  active_members: number;
  posts_today: number;
  total_posts: number;
  trending_tags: string[];
}

const postTypes = [
  { id: 'all', label: 'All Posts', icon: Globe },
  { id: 'reflection', label: 'Reflections', icon: Quote },
  { id: 'milestone', label: 'Milestones', icon: Award },
  { id: 'question', label: 'Questions', icon: MessageCircle },
  { id: 'insight', label: 'Insights', icon: Zap },
  { id: 'achievement', label: 'Achievements', icon: TrendingUp }
];

export default function CommunityPage() {
  const { user, userProfile } = useAuth();
  const { addNotification } = useNotifications();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // New post form state
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'reflection' as CommunityPost['type'],
    visibility: 'public' as CommunityPost['visibility'],
    tags: [] as string[],
    images: [] as string[]
  });

  useEffect(() => {
    loadCommunityData();
  }, [selectedType]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - in real app, this would be API calls
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      setStats({
        total_members: 1247,
        active_members: 89,
        posts_today: 23,
        total_posts: 3456,
        trending_tags: ['boundaries', 'mindfulness', 'growth', 'self-care', 'wisdom']
      });

      setPosts([
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Sarah Chen',
          user_level: 4,
          content: 'Just completed my 30-day boundary audit challenge! The biggest insight was learning that saying "no" to others often means saying "yes" to myself. Has anyone else experienced this shift in perspective?',
          type: 'milestone',
          tags: ['boundaries', '30-day-challenge', 'self-advocacy'],
          images: [],
          likes_count: 24,
          comments_count: 8,
          shares_count: 3,
          is_liked: false,
          is_bookmarked: true,
          visibility: 'public',
          created_at: '2024-01-19T10:30:00Z',
          updated_at: '2024-01-19T10:30:00Z'
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Michael Rodriguez',
          user_level: 2,
          content: 'Struggling with maintaining consistency in my wisdom practice. Some days I feel so motivated, others I can barely remember to check in with myself. Any tips for building sustainable habits?',
          type: 'question',
          tags: ['consistency', 'habits', 'motivation'],
          images: [],
          likes_count: 12,
          comments_count: 15,
          shares_count: 1,
          is_liked: true,
          is_bookmarked: false,
          visibility: 'public',
          created_at: '2024-01-19T08:15:00Z',
          updated_at: '2024-01-19T08:15:00Z'
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Alex Thompson',
          user_level: 6,
          content: 'Reflection from today\'s upset documentation: I realized my emotional reactions often stem from unmet expectations I didn\'t even know I had. The practice of naming these hidden expectations has been transformative.',
          type: 'insight',
          tags: ['emotional-intelligence', 'expectations', 'self-awareness'],
          images: [],
          likes_count: 31,
          comments_count: 12,
          shares_count: 7,
          is_liked: false,
          is_bookmarked: false,
          visibility: 'public',
          created_at: '2024-01-18T16:45:00Z',
          updated_at: '2024-01-18T16:45:00Z'
        }
      ]);

    } catch (error) {
      console.error('Error loading community data:', error);
      addNotification({
        type: 'system',
        title: 'Loading Failed',
        message: 'Failed to load community data. Please try again.',
        icon: 'alert',
        priority: 'high'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;

    try {
      setPosting(true);
      
      // Mock API call - in real app, this would post to API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockPost: CommunityPost = {
        id: Date.now().toString(),
        user_id: user?.id || 'current-user',
        user_name: user?.user_metadata?.full_name || 'You',
        user_level: userProfile?.wisdom_level || 1,
        content: newPost.content,
        type: newPost.type,
        tags: newPost.tags,
        images: newPost.images,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_liked: false,
        is_bookmarked: false,
        visibility: newPost.visibility,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setPosts(prev => [mockPost, ...prev]);
      
      setNewPost({
        content: '',
        type: 'reflection',
        visibility: 'public',
        tags: [],
        images: []
      });
      
      setShowCreatePost(false);

      addNotification({
        type: 'achievement',
        title: 'Post Shared!',
        message: 'Your wisdom has been shared with the community.',
        icon: 'check',
        priority: 'medium'
      });

    } catch (error) {
      addNotification({
        type: 'system',
        title: 'Post Failed',
        message: 'Failed to share your post. Please try again.',
        icon: 'alert',
        priority: 'high'
      });
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          is_liked: !post.is_liked,
          likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
        };
      }
      return post;
    }));
  };

  const handleBookmarkPost = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          is_bookmarked: !post.is_bookmarked
        };
      }
      return post;
    }));

    const post = posts.find(p => p.id === postId);
    if (post) {
      addNotification({
        type: 'system',
        title: post.is_bookmarked ? 'Bookmark Removed' : 'Post Bookmarked',
        message: post.is_bookmarked ? 'Removed from your saved posts' : 'Added to your saved posts',
        icon: 'check',
        priority: 'low'
      });
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = postTypes.find(t => t.id === type);
    return typeConfig?.icon || Quote;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      reflection: 'text-black bg-blue-100 dark:bg-blue-900/20',
      milestone: 'text-black bg-yellow-100 dark:bg-yellow-900/20',
      question: 'text-black bg-green-100 dark:bg-green-900/20',
      insight: 'text-black bg-purple-100 dark:bg-purple-900/20',
      achievement: 'text-black bg-red-100 dark:bg-red-900/20'
    };
    return colors[type as keyof typeof colors] || colors.reflection;
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesType = selectedType === 'all' || post.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black dark:text-black">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-black mb-2">
            Community
          </h1>
          <p className="text-black dark:text-black">
            Share your wisdom journey and learn from others
          </p>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-black" />
                <div>
                  <p className="text-2xl font-bold text-black dark:text-black">
                    {stats.total_members.toLocaleString()}
                  </p>
                  <p className="text-xs text-black dark:text-black">Members</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-black" />
                <div>
                  <p className="text-2xl font-bold text-black dark:text-black">
                    {stats.active_members}
                  </p>
                  <p className="text-xs text-black dark:text-black">Active Today</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-black" />
                <div>
                  <p className="text-2xl font-bold text-black dark:text-black">
                    {stats.posts_today}
                  </p>
                  <p className="text-xs text-black dark:text-black">Posts Today</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-black" />
                <div>
                  <p className="text-2xl font-bold text-black dark:text-black">
                    {stats.total_posts.toLocaleString()}
                  </p>
                  <p className="text-xs text-black dark:text-black">Total Posts</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Post */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          {!showCreatePost ? (
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full flex items-center gap-3 p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-black font-medium">
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-black dark:text-black">
                Share your wisdom with the community...
              </span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-black font-medium">
                  {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-black dark:text-black">
                    {user?.user_metadata?.full_name || 'You'}
                  </p>
                  <p className="text-sm text-black dark:text-black">
                    Level {userProfile?.wisdom_level || 1} • Sharing publicly
                  </p>
                </div>
              </div>

              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="What wisdom would you like to share today?"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-black placeholder-gray-500 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost(prev => ({ ...prev, type: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-black text-sm"
                  >
                    <option value="reflection">Reflection</option>
                    <option value="milestone">Milestone</option>
                    <option value="question">Question</option>
                    <option value="insight">Insight</option>
                    <option value="achievement">Achievement</option>
                  </select>
                  
                  <button className="p-2 text-black hover:text-black dark:hover:text-black transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="px-4 py-2 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={posting || !newPost.content.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {posting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {posting ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {postTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                    ${selectedType === type.id
                      ? 'bg-purple-100 dark:bg-purple-900/20 text-black dark:text-black'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredPosts.map((post) => {
              const TypeIcon = getTypeIcon(post.type);
              
              return (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-black font-medium">
                        {post.user_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-black dark:text-black">
                            {post.user_name}
                          </h3>
                          <span className="text-xs text-black dark:text-black">
                            Level {post.user_level}
                          </span>
                          <div className={`p-1 rounded ${getTypeColor(post.type)}`}>
                            <TypeIcon className="w-3 h-3" />
                          </div>
                        </div>
                        <p className="text-sm text-black dark:text-black">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <MoreHorizontal className="w-4 h-4 text-black" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-black dark:text-black leading-relaxed mb-3">
                      {post.content}
                    </p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-purple-100 dark:bg-purple-900/20 text-black dark:text-black px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.is_liked 
                            ? 'text-black hover:text-black' 
                            : 'text-black hover:text-black'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span className="text-sm font-medium">{post.likes_count}</span>
                      </button>

                      <button className="flex items-center gap-2 text-black hover:text-black transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments_count}</span>
                      </button>

                      <button className="flex items-center gap-2 text-black hover:text-black transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.shares_count}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleBookmarkPost(post.id)}
                      className={`p-2 transition-colors ${
                        post.is_bookmarked 
                          ? 'text-black hover:text-black' 
                          : 'text-black hover:text-black'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-black dark:text-black mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black dark:text-black mb-2">
              No posts found
            </h3>
            <p className="text-black dark:text-black mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Be the first to share your wisdom!'
              }
            </p>
            {!showCreatePost && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            )}
          </div>
        )}

        {/* Trending Tags */}
        {stats && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-black">
            <h2 className="text-xl font-bold mb-4">Trending Topics</h2>
            <div className="flex flex-wrap gap-2">
              {stats.trending_tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}