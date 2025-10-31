'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Save, 
  Upload,
  Loader2,
  Trophy,
  Target,
  Flame,
  Star,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/lib/supabase';

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, userProfile, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: ProfileData) => {
    try {
      setIsSaving(true);
      await updateProfile({
        bio: data.bio || null,
        location: data.location || null,
        website: data.website || null,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset({
      bio: userProfile?.bio || '',
      location: userProfile?.location || '',
      website: userProfile?.website || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-200/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-black mb-1">{user?.user_metadata?.full_name}</h2>
                <p className="text-black mb-2">@{user?.user_metadata?.username}</p>
                <p className="text-black text-sm mb-4">{user?.email}</p>
                
                <button className="flex items-center gap-2 mx-auto text-black hover:text-black transition">
                  <Upload className="w-4 h-4" />
                  Change Avatar
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black">Wisdom Level</span>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-black" />
                    <span className="text-black">{userProfile?.wisdom_level || 1}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black">Contribution Points</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-black" />
                    <span className="text-black">{userProfile?.contribution_points || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black">Current Streak</span>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-black" />
                    <span className="text-black">{userProfile?.streak_count || 0} days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black">Member Since</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-black" />
                    <span className="text-black">
                      {userProfile?.created_at ? 
                        new Date(userProfile.created_at).toLocaleDateString() : 
                        'Recently'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              {userProfile?.badges && userProfile.badges.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-black mb-3">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {(userProfile.badges as string[]).map((badge, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-500/20 text-black text-xs rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-200/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-black">Profile Settings</h1>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-slate-600 text-black rounded-lg hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={!isDirty || isSaving}
                      className="px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <form className="space-y-6">
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-black mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      {...register('bio')}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-black placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-700/20 border border-slate-600 rounded-lg text-black min-h-[100px]">
                      {userProfile?.bio || 'No bio provided yet.'}
                    </div>
                  )}
                  {errors.bio && (
                    <p className="mt-1 text-sm text-black">{errors.bio.message}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-black mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                    {isEditing ? (
                      <input
                        id="location"
                        type="text"
                        {...register('location')}
                        className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-black placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition"
                        placeholder="Where are you located?"
                      />
                    ) : (
                      <div className="w-full pl-11 pr-4 py-3 bg-slate-700/20 border border-slate-600 rounded-lg text-black">
                        {userProfile?.location || 'Location not specified'}
                      </div>
                    )}
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-black">{errors.location.message}</p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-black mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                    {isEditing ? (
                      <input
                        id="website"
                        type="url"
                        {...register('website')}
                        className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-black placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition"
                        placeholder="https://your-website.com"
                      />
                    ) : (
                      <div className="w-full pl-11 pr-4 py-3 bg-slate-700/20 border border-slate-600 rounded-lg text-black">
                        {userProfile?.website ? (
                          <a
                            href={userProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black hover:text-black transition"
                          >
                            {userProfile.website}
                          </a>
                        ) : (
                          'No website provided'
                        )}
                      </div>
                    )}
                  </div>
                  {errors.website && (
                    <p className="mt-1 text-sm text-black">{errors.website.message}</p>
                  )}
                </div>

                {/* Account Information */}
                <div className="pt-6 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-black mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Email
                      </label>
                      <div className="flex items-center gap-2 text-black">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Username
                      </label>
                      <div className="flex items-center gap-2 text-black">
                        <User className="w-4 h-4" />
                        @{user?.user_metadata?.username}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}