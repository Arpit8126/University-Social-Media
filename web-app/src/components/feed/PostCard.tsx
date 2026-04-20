'use client';

import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical, 
  Globe, 
  Lock,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostProps {
  post: {
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
  };
}

export default function PostCard({ post }: PostProps) {
  const profile = post.profiles;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl mb-6 relative hover:border-white/10 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold text-lg border border-white/5">
            {profile?.full_name?.[0] || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{profile?.full_name || 'Campus Student'}</h3>
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
              <span>{timeAgo}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center gap-1 uppercase tracking-tighter font-bold">
                {post.visibility === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {post.visibility}
              </div>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-all">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {post.media_url && (
          <div className="rounded-xl overflow-hidden bg-black/20 border border-white/5">
            <img 
              src={post.media_url} 
              alt="Post media" 
              className="w-full h-auto max-h-[500px] object-contain"
            />
          </div>
        )}
      </div>

      {/* Engagement Bar */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors group">
          <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Like</span>
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
          <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Comment</span>
        </button>
        <div className="flex-1" />
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </motion.div>
  );
}
