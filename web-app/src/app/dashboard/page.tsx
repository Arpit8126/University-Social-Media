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
    <div className="flex justify-center max-w-5xl mx-auto">
      {/* Left Column: Feed */}
      <div className="w-full max-w-[470px] mr-0 lg:mr-8">
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
                <div className="p-12 text-center rounded-2xl border border-white/5">
                  <p className="text-muted-foreground italic">No posts yet. Be the first to share something!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Column: Sidebar */}
      <div className="hidden lg:block w-[320px] shrink-0 pt-8">
        <div className="sticky top-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-muted-foreground">Suggested for you</h2>
            <button className="text-xs font-bold text-foreground">See All</button>
          </div>
          
          <div className="space-y-4">
             {/* Example suggested users */}
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div>
                       <p className="text-sm font-bold leading-tight">peer_{i}</p>
                       <p className="text-xs text-muted-foreground leading-tight">Suggested for you</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-blue-500">Follow</button>
                </div>
             ))}
          </div>

          <div className="text-[11px] text-muted-foreground mt-8 space-y-4">
             <div className="flex flex-wrap gap-x-2 gap-y-1">
               <span>About</span><span>Help</span><span>Press</span><span>API</span><span>Jobs</span><span>Privacy</span><span>Terms</span>
             </div>
             <p>© 2026 UNIVERSITY SOCIAL MEDIA FROM SWASTIK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
