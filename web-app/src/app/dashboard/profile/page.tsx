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
  X,
  Grid,
  Bookmark,
  Users
} from 'lucide-react';
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
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
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
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id)
      .then(({ count }) => setFollowersCount(count || 0));
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id)
      .then(({ count }) => setFollowingCount(count || 0));
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
    <div className="max-w-4xl mx-auto pb-20">
      {/* Profile Header Card */}
      <div className="py-8 px-4 md:px-8 border-b border-white/10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar Area */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 cursor-pointer">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover border-4 border-background" />
              ) : (
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-5xl font-black text-white border-4 border-background">
                  {userInitial}
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-2 p-2 bg-[#0f172a] border border-white/20 rounded-full shadow-lg cursor-pointer hover:bg-white/10 transition-all z-10 text-white">
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              {isUploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </label>
          </div>

          {/* User Info & Stats */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{profile.username || displayName}</h1>
                {profile.is_verified && (
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                )}
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} disabled={isSaving} className="bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90 transition-all text-sm flex items-center gap-2">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg font-bold transition-all text-sm">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white px-5 py-1.5 rounded-lg font-bold transition-all text-sm">
                      Edit profile
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-1.5 rounded-lg font-bold transition-all text-sm">
                      Share profile
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-bold transition-all">
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center md:justify-start gap-8 md:gap-12">
              <div className="text-center md:text-left">
                <span className="font-bold text-lg">{postCount}</span> <span className="text-muted-foreground text-sm">posts</span>
              </div>
              <div className="text-center md:text-left cursor-pointer hover:opacity-80">
                <span className="font-bold text-lg">{followersCount}</span> <span className="text-muted-foreground text-sm">followers</span>
              </div>
              <div className="text-center md:text-left cursor-pointer hover:opacity-80">
                <span className="font-bold text-lg">{followingCount}</span> <span className="text-muted-foreground text-sm">following</span>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <h2 className="font-bold text-sm">{profile.full_name}</h2>
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <input type="text" value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm outline-none focus:border-primary/50" placeholder="Name" />
                  <input type="text" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm outline-none focus:border-primary/50" placeholder="Username" />
                  <textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm outline-none focus:border-primary/50 resize-none h-16" placeholder="Bio..." />
                </div>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
                  {profile.universities && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {profile.universities.name}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-12 border-t border-transparent relative">
        {['POSTS', 'RESOURCES'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab === 'POSTS' ? 'Activity' : tab)}
            className={`flex items-center gap-2 py-4 text-xs font-bold tracking-widest transition-all ${
              (activeTab === 'Activity' && tab === 'POSTS') || activeTab === tab ? 'text-foreground border-t border-foreground -mt-px' : 'text-muted-foreground border-t border-transparent hover:text-foreground/80'
            }`}
          >
            {tab === 'POSTS' ? <Grid className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="mt-2">
        {activeTab === 'Activity' ? (
          myPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="w-16 h-16 rounded-full border-2 border-muted-foreground flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-lg font-bold">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {myPosts.map((post) => (
                <div key={post.id} className="aspect-square relative group bg-white/5 cursor-pointer overflow-hidden">
                  {post.media_url ? (
                     post.media_type === 'video' ? (
                       <video src={post.media_url} className="w-full h-full object-cover" />
                     ) : (
                       <img src={post.media_url} alt="post" className="w-full h-full object-cover" />
                     )
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col justify-center items-center text-center bg-gradient-to-br from-white/5 to-white/10">
                      <p className="text-[10px] md:text-sm font-medium line-clamp-4 text-white/80">{post.content}</p>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 z-10">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      {post.likes_count}
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <MessageSquare className="w-6 h-6 fill-white" />
                      {post.comments_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-full border-2 border-muted-foreground flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-bold">No Resources Yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
