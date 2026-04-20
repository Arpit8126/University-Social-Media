'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical, 
  Globe, 
  Lock,
  Star,
  Trash2,
  Send,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PostComment } from '@/lib/types';

interface PostProps {
  post: {
    id: string;
    content: string;
    media_url: string | null;
    media_type?: string | null;
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
  };
  onDelete?: (id: string) => void;
}

export default function PostCard({ post, onDelete }: PostProps) {
  const { user } = useAuth();
  const profile = post.profiles;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?.id === post.user_id;

  // Check if user has liked this post
  useEffect(() => {
    if (!user) return;
    supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setLiked(true);
      });
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      setLiked(false);
      setLikesCount((c) => Math.max(c - 1, 0));
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      setLiked(true);
      setLikesCount((c) => c + 1);
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    const { data } = await supabase
      .from('post_comments')
      .select('*, profiles(full_name, avatar_url, username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    
    if (data) setComments(data as PostComment[]);
    setIsLoadingComments(false);
  };

  const handleToggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, user_id: user.id, content: commentText.trim() })
      .select('*, profiles(full_name, avatar_url, username)')
      .single();

    if (!error && data) {
      setComments((c) => [...c, data as PostComment]);
      setCommentsCount((c) => c + 1);
      setCommentText('');
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    await supabase.from('posts').delete().eq('id', post.id);
    onDelete?.(post.id);
    setShowMenu(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl mb-6 relative hover:border-white/10 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-11 h-11 rounded-lg object-cover border border-white/5" />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold text-lg border border-white/5">
              {profile?.full_name?.[0] || '?'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{profile?.full_name || 'Student'}</h3>
              {profile?.is_verified && (
                <div className="p-0.5 rounded-full bg-primary/20 text-primary">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                {profile?.role || 'Student'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {profile?.username && <span>@{profile.username}</span>}
              {profile?.username && <span className="w-1 h-1 bg-white/20 rounded-full" />}
              <span>{timeAgo}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center gap-1 uppercase tracking-tighter font-bold">
                {post.visibility === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {post.visibility}
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && isOwner && (
            <div className="absolute right-0 top-10 bg-background border border-white/10 rounded-xl shadow-xl p-2 z-10 min-w-[140px]">
              <button 
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {post.media_url && (
          <div className="rounded-xl overflow-hidden bg-black/20 border border-white/5">
            {post.media_type === 'video' ? (
              <video 
                src={post.media_url} 
                controls 
                className="w-full h-auto max-h-[500px] object-contain"
              />
            ) : (
              <img 
                src={post.media_url} 
                alt="Post media" 
                className="w-full h-auto max-h-[500px] object-contain"
              />
            )}
          </div>
        )}
      </div>

      {/* Engagement Bar */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors group ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${liked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{likesCount > 0 ? likesCount : 'Like'}</span>
        </button>
        <button 
          onClick={handleToggleComments}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <MessageCircle className={`w-5 h-5 group-hover:scale-110 transition-transform ${showComments ? 'text-primary' : ''}`} />
          <span className="text-sm font-medium">{commentsCount > 0 ? commentsCount : 'Comment'}</span>
        </button>
        <div className="flex-1" />
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/5 space-y-4"
          >
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 shrink-0">
                      {(comment.profiles?.full_name?.[0]) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{comment.profiles?.full_name || 'Student'}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center italic py-2">No comments yet. Be the first!</p>
                )}
              </>
            )}

            {/* Add Comment */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-primary text-white disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
