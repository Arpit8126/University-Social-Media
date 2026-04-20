'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { 
  ShieldQuestion, 
  MessageSquare, 
  Ghost, 
  Flame, 
  ShieldAlert,
  Zap,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { AnonymousPost } from '@/lib/types';

export default function AnonymousPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<AnonymousPost[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const fetchPosts = useCallback(async () => {
    // Use the public view that hides user_id
    const { data, error } = await supabase
      .from('anonymous_posts')
      .select('id, content, upvotes, comments_count, created_at')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching anonymous posts:', error);
    
    if (data && user) {
      // Check which posts the user has upvoted
      const { data: myUpvotes } = await supabase
        .from('anonymous_upvotes')
        .select('post_id')
        .eq('user_id', user.id);

      const upvotedIds = new Set(myUpvotes?.map((u) => u.post_id) || []);
      const enriched = data.map((p) => ({ ...p, user_has_upvoted: upvotedIds.has(p.id) }));
      setThreads(enriched);
    } else if (data) {
      setThreads(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePost = async () => {
    if (!input.trim() || !user) return;
    setIsPosting(true);

    const { error } = await supabase.from('anonymous_posts').insert({
      content: input.trim(),
      user_id: user.id,
    });

    if (!error) {
      setInput('');
      fetchPosts();
    }
    setIsPosting(false);
  };

  const handleUpvote = async (postId: string, hasUpvoted: boolean) => {
    if (!user) return;
    if (hasUpvoted) {
      await supabase.from('anonymous_upvotes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('anonymous_upvotes').insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header with Warning */}
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
            <ShieldQuestion className="w-4 h-4" />
            Untraceable Board
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Voice</h1>
          <p className="text-muted-foreground italic font-medium">Speak your mind. Names are strictly hidden.</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500 flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed font-medium">
            <span className="font-bold">Guidelines:</span> While posts are anonymous to other students, please avoid sharing sensitive personal data. Hate speech or harassment will be flagged.
          </p>
        </div>
      </div>

      {/* Anonymous Input */}
      <div className="glass-panel p-6 rounded-3xl border-blue-500/10 bg-blue-500/5 relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-[40px]" />
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground border border-white/5">
            <Ghost className="w-6 h-6 opacity-30" />
          </div>
          <div className="flex-1 space-y-4">
            <textarea 
              placeholder="What's on your mind? Post anonymously..."
              className="w-full bg-transparent border-none outline-none text-lg resize-none min-h-[100px] placeholder:text-muted-foreground/30 font-medium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 italic opacity-40">ANONYMOUS POST</span>
              <button 
                onClick={handlePost}
                disabled={!input.trim() || isPosting}
                className={`bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 ${
                  !input.trim() && 'opacity-50 grayscale'
                }`}
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch Post'}
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : threads.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Ghost className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground italic">No anonymous posts yet. Be the first to speak up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread, idx) => (
            <motion.div 
              key={thread.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-6 rounded-3xl border-white/5 hover:border-blue-500/20 transition-all cursor-pointer relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-[40px]" />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-500">
                    <Flame className="w-4 h-4 fill-current animate-pulse" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-2">
                    <span>Anonymous Peer</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <p className="text-foreground/90 font-medium leading-relaxed mb-6">
                {thread.content}
              </p>

              <div className="flex items-center gap-6 pt-4 border-t border-white/5 uppercase font-black text-[10px] tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2 group-hover:text-foreground transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  {thread.comments_count} Comments
                </div>
                <button 
                  onClick={() => handleUpvote(thread.id, thread.user_has_upvoted || false)}
                  className={`flex items-center gap-2 transition-colors ${thread.user_has_upvoted ? 'text-blue-500' : 'group-hover:text-blue-500'}`}
                >
                  <Zap className={`w-4 h-4 ${thread.user_has_upvoted ? 'fill-current' : ''}`} />
                  {thread.upvotes} Sparks
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
