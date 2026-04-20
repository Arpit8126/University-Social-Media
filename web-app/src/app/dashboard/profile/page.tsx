'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  MessageSquare, 
  FolderOpen, 
  Settings,
  ShieldCheck,
  GraduationCap,
  Edit3,
  Save,
  Loader2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import PostCard from '@/components/feed/PostCard';
import { formatDistanceToNow } from 'date-fns';

interface UserPost {
  id: string;
  content: string;
  media_url: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  user_id: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    role: string;
    username: string | null;
  } | null;
}

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ full_name: '', bio: '', username: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Activity');
  const [myPosts, setMyPosts] = useState<UserPost[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        username: profile.username || '',
      });
    }
  }, [profile]);

  // Fetch user stats
  useEffect(() => {
    if (!user) return;
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      .then(({ count }) => setPostCount(count || 0));
    supabase.from('resources').select('id', { count: 'exact', head: true }).eq('uploaded_by', user.id)
      .then(({ count }) => setResourceCount(count || 0));
  }, [user]);

  // Fetch user posts
  const fetchMyPosts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(full_name, avatar_url, is_verified, role, username)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setMyPosts(data);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'Activity') fetchMyPosts();
  }, [activeTab, fetchMyPosts]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editData.full_name.trim(),
        bio: editData.bio.trim(),
        username: editData.username.trim().toLowerCase(),
      })
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    setIsUploadingAvatar(true);
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('campus-media')
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('campus-media').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      await refreshProfile();
    }
    setIsUploadingAvatar(false);
  };

  if (!profile) return null;

  const displayName = profile.full_name || 'Student';
  const userInitial = displayName[0]?.toUpperCase() || 'S';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Avatar Area */}
          <div className="relative group">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-32 h-32 rounded-3xl object-cover shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform">
                {userInitial}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 p-2 bg-background border border-white/10 rounded-xl shadow-lg cursor-pointer hover:bg-white/5 transition-all">
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              {isUploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ImageIcon className="w-5 h-5 text-primary" />}
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xl font-bold outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="username"
                />
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
                  placeholder="Write a bio..."
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight">{displayName}</h1>
                  <span className="w-fit px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {profile.role}
                  </span>
                </div>
                {profile.username && (
                  <p className="text-sm text-muted-foreground font-medium">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="text-muted-foreground font-medium italic lowercase">&quot;{profile.bio}&quot;</p>
                )}
              </>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 pt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {profile.universities?.name || 'University'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-white/5 hover:bg-white/10 text-foreground px-8 py-3 rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Stats & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5 pb-4">
              Stats
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Posts', value: postCount, icon: MessageSquare },
                { label: 'Resources', value: resourceCount, icon: FolderOpen },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">{stat.label}</span>
                  </div>
                  <span className="text-lg font-black">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5 pb-4">
              Account Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-xs">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verified</span>
                <span className={`font-bold text-xs ${profile.is_verified ? 'text-green-500' : 'text-amber-500'}`}>
                  {profile.is_verified ? 'Yes' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl border-white/5">
          <div className="flex items-center gap-8 mb-10 border-b border-white/5 pb-6">
            {['Activity', 'About'].map((tab, i) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-black uppercase tracking-widest pb-6 -mb-6 border-b-2 transition-all ${
                  activeTab === tab ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Activity' && (
            <div className="space-y-6">
              {myPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center italic py-8">No posts yet. Share something!</p>
              ) : (
                myPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          )}

          {activeTab === 'About' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/5">
                <h4 className="text-sm font-bold mb-2">Bio</h4>
                <p className="text-sm text-muted-foreground italic">{profile.bio || 'No bio yet. Click Edit Profile to add one!'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5">
                <h4 className="text-sm font-bold mb-2">University</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {profile.universities?.name || 'Not specified'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
