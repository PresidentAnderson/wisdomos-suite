'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Lock,
  Globe,
  Calendar,
  MessageCircle,
  Settings,
  UserPlus,
  Shield,
  Search,
  Filter
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  type: 'circle' | 'event' | 'workshop' | 'community';
  visibility: 'private' | 'invite_only' | 'public';
  memberCount: number;
  maxMembers: number;
  lastActivity: Date;
  image?: string;
}

export function GroupCircles() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [filter, setFilter] = useState<'all' | 'my_groups' | 'public'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const visibilityIcons = {
    private: Lock,
    invite_only: UserPlus,
    public: Globe,
  };

  const typeColors = {
    circle: 'bg-purple-500',
    event: 'bg-blue-500',
    workshop: 'bg-green-500',
    community: 'bg-orange-500',
  };

  const handleCreateGroup = (data: Partial<Group>) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: data.name || '',
      description: data.description || '',
      type: data.type || 'circle',
      visibility: data.visibility || 'private',
      memberCount: 1,
      maxMembers: data.maxMembers || 50,
      lastActivity: new Date(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setIsCreatingGroup(false);
  };

  const filteredGroups = groups.filter((group) => {
    if (searchTerm && !group.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filter === 'public' && group.visibility !== 'public') {
      return false;
    }
    // For 'my_groups', would need to check membership
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Circles</h1>
        <p className="text-black">Connect with like-minded individuals on your wisdom journey</p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={20} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-gray-200'
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => setFilter('my_groups')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'my_groups' ? 'bg-primary text-primary-foreground' : 'bg-gray-200'
            }`}
          >
            My Groups
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'public' ? 'bg-primary text-primary-foreground' : 'bg-gray-200'
            }`}
          >
            Public
          </button>
        </div>

        <button
          onClick={() => setIsCreatingGroup(true)}
          className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <Plus size={18} />
          Create Group
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => {
          const VisibilityIcon = visibilityIcons[group.visibility];
          
          return (
            <motion.div
              key={group.id}
              whileHover={{ scale: 1.02 }}
              className="group-card cursor-pointer"
              onClick={() => setSelectedGroup(group)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${typeColors[group.type]} flex items-center justify-center text-black`}>
                  <Users size={24} />
                </div>
                <VisibilityIcon size={18} className="text-black" />
              </div>

              <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
              <p className="text-black dark:text-black mb-4 line-clamp-2">
                {group.description}
              </p>

              <div className="flex items-center justify-between text-sm text-black">
                <span>{group.memberCount}/{group.maxMembers} members</span>
                <span className="capitalize">{group.type}</span>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-xs text-black">
                  Active {new Date(group.lastActivity).toLocaleDateString()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Join group logic
                  }}
                  className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90"
                >
                  Join
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="mx-auto mb-4 text-black" size={48} />
            <h3 className="text-lg font-semibold mb-2">No groups found</h3>
            <p className="text-black mb-4">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first group to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Create Your First Group
              </button>
            )}
          </div>
        )}
      </div>

      {/* Group Detail Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedGroup(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedGroup.name}</h2>
                  <p className="text-black dark:text-black">
                    {selectedGroup.description}
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Settings size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Users className="mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold">{selectedGroup.memberCount}</div>
                  <div className="text-sm text-black">Members</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <MessageCircle className="mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold">42</div>
                  <div className="text-sm text-black">Discussions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-black">Upcoming Events</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="font-medium">Sarah shared a contribution display</div>
                    <div className="text-sm text-black">2 hours ago</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="font-medium">New event: Weekly Wisdom Circle</div>
                    <div className="text-sm text-black">Yesterday</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                  Join Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreatingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsCreatingGroup(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">Create New Group</h2>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateGroup({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    type: formData.get('type') as Group['type'],
                    visibility: formData.get('visibility') as Group['visibility'],
                    maxMembers: parseInt(formData.get('maxMembers') as string),
                  });
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Group Name</label>
                    <input
                      name="name"
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      className="w-full p-2 border rounded-lg"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select name="type" className="w-full p-2 border rounded-lg">
                      <option value="circle">Circle</option>
                      <option value="event">Event</option>
                      <option value="workshop">Workshop</option>
                      <option value="community">Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Visibility</label>
                    <select name="visibility" className="w-full p-2 border rounded-lg">
                      <option value="private">Private</option>
                      <option value="invite_only">Invite Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Max Members</label>
                    <input
                      name="maxMembers"
                      type="number"
                      defaultValue={50}
                      min={2}
                      max={1000}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingGroup(false)}
                    className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}