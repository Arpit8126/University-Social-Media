'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import CreatePost from '@/components/feed/CreatePost';
import PostCard from '@/components/feed/PostCard';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  media_url: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    role: string;
  };
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchPosts = useCallback(async () => {
    // isLoading starts as true, so we only need to set it to false when done
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url,
          is_verified,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching posts:', error);
    if (data) setPosts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Defer to avoid synchronous state update in effect
    const timer = setTimeout(() => {
      fetchPosts();
    }, 0);

    // Subscribe to new posts in real-time
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts(); // Refresh on new post
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(subscription);
    };
  }, [fetchPosts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Feed */}
      <div className="lg:col-span-8">
        <CreatePost />
        
        <div className="space-y-6">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="glass-panel h-48 rounded-2xl animate-pulse bg-white/5" />
            ))
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
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
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Trending Topics</h3>
              <div className="space-y-3">
                {['#Hackathon2026', '#GLAExams', '#CampusLife', '#NotesExchange'].map((tag) => (
                  <div key={tag} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{tag}</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-muted-foreground group-hover:bg-primary/10 transition-colors">2.4k</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Top Contributors</h3>
              <div className="space-y-3">
                {[
                  { name: 'Arpit Pandey', role: 'Campus Star', points: 2840 },
                  { name: 'Sameer Garg', role: 'Mod', points: 1920 },
                  { name: 'Siya Sharma', role: 'Writer', points: 1560 }
                ].map((user, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5">
                      {user.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-[10px] text-primary/70 font-bold uppercase tracking-wider mt-1">{user.role}</p>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground">{user.points} XP</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all mt-4">
              View Leaderboard
            </button>
          </div>
        </motion.div>

        {/* Quick Links Card */}
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <div className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-all cursor-pointer group">
            <Calendar className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="text-sm font-semibold">Academic Calendar</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-all cursor-pointer mt-4 group">
            <Award className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="text-sm font-semibold">Scholarship News</span>
          </div>
        </div>
      </div>
    </div>
  );
}
