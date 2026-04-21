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
  Bookmark,
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
      universities?: { name: string } | null;
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
      className="bg-background border border-white/10 rounded-sm mb-6 max-w-[470px] mx-auto w-full transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-yellow-400 to-purple-500 p-[2px] cursor-pointer">
            <div className="w-full h-full rounded-full bg-background overflow-hidden border border-background">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold text-xs">
                  {profile?.full_name?.[0] || '?'}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-sm hover:text-muted-foreground cursor-pointer">{profile?.username || profile?.full_name || 'Student'}</h3>
              {profile?.is_verified && <Star className="w-3 h-3 text-blue-500 fill-current" />}
              <span className="text-muted-foreground mx-1 text-xs">•</span>
              <span className="text-xs text-muted-foreground">{timeAgo.replace('about ', '')}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{profile?.universities?.name || 'University'}</span>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:opacity-50 transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && isOwner && (
            <div className="absolute right-0 top-10 bg-[#262626] border border-white/10 rounded-xl shadow-xl w-32 z-10 overflow-hidden">
              <button onClick={handleDelete} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-white/5 transition-all font-bold">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content / Media */}
      <div className="w-full relative bg-[#000] flex items-center justify-center min-h-[300px] border-y border-white/5">
        {post.media_url ? (
           post.media_type === 'video' ? (
             <video src={post.media_url} controls className="w-full max-h-[600px] object-cover" />
           ) : (
             <img onDoubleClick={handleLike} src={post.media_url} alt="Post media" className="w-full max-h-[600px] object-contain" />
           )
        ) : (
           <div onDoubleClick={handleLike} className="w-full p-8 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 min-h-[300px]">
             <p className="text-lg md:text-xl font-medium text-center">{post.content}</p>
           </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="hover:opacity-50 transition-all group">
              <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
            </button>
            <button onClick={handleToggleComments} className="hover:opacity-50 transition-all">
              <MessageCircle className="w-6 h-6 -scale-x-100" />
            </button>
            <button className="hover:opacity-50 transition-all">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button className="hover:opacity-50 transition-all">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Likes Count */}
        <div className="font-semibold text-sm mb-1">
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </div>

        {/* Caption */}
        {post.media_url && post.content && (
          <div className="text-sm mb-1">
            <span className="font-semibold mr-2">{profile?.username || profile?.full_name || 'Student'}</span>
            <span className="whitespace-pre-wrap">{post.content}</span>
          </div>
        )}
        
        {/* Comments Link */}
        {commentsCount > 0 && !showComments && (
          <button onClick={handleToggleComments} className="text-sm text-muted-foreground hover:text-foreground mb-1">
            View all {commentsCount} comments
          </button>
        )}
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 space-y-2"
          >
            {isLoadingComments ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="text-sm flex gap-2">
                    <span className="font-semibold shrink-0 cursor-pointer">{comment.profiles?.username || comment.profiles?.full_name || 'Student'}</span>
                    <span className="text-foreground">{comment.content}</span>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Comment */}
      <div className="px-3 py-2 border-t border-white/10 flex items-center gap-3">
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          className="flex-1 bg-transparent border-none text-sm outline-none placeholder:text-muted-foreground"
        />
        {commentText.trim() && (
          <button onClick={handleAddComment} className="text-blue-500 font-semibold text-sm hover:text-blue-400">
            Post
          </button>
        )}
      </div>
    </motion.div>
  );
}
