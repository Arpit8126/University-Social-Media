'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import CreatePost from '@/components/feed/CreatePost';
import PostCard from '@/components/feed/PostCard';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Award, Loader2 } from 'lucide-react';

interface Post {
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

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url,
          is_verified,
          role,
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching posts:', error);
    if (data) setPosts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 0);

    // Subscribe to new posts in real-time
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(subscription);
    };
  }, [fetchPosts]);

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Feed */}
      <div className="lg:col-span-8">
        <CreatePost />
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
              ))}
              {posts.length === 0 && (
                <div className="glass-panel p-12 text-center rounded-2xl">
                  <p className="text-muted-foreground italic">No posts yet. Be the first to share something!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Column: Campus Pulse (Sidebar) */}
      <div className="lg:col-span-4 space-y-6 hidden lg:block">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 rounded-2xl sticky top-8 border-white/5"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Campus Pulse</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Quick Links</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-all cursor-pointer group">
                  <Calendar className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-semibold">Academic Calendar</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-all cursor-pointer group">
                  <Award className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-semibold">Scholarship News</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="text-sm font-bold">{posts.length}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
