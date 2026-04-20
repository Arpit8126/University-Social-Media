'use client';

import { motion } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  FileText, 
  Zap,
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react';

const notifications = [
  { 
    id: 1, 
    type: 'LIKE', 
    user: 'Deepak Sharma', 
    content: 'liked your post "Operating Systems Notes"', 
    time: '2 mins ago', 
    is_read: false 
  },
  { 
    id: 2, 
    type: 'COMMENT', 
    user: 'Siya Sharma', 
    content: 'commented: "This is exactly what I needed!"', 
    time: '1 hour ago', 
    is_read: false 
  },
  { 
    id: 3, 
    type: 'FOLLOW', 
    user: 'Sameer Garg', 
    content: 'started following you.', 
    time: '5 hours ago', 
    is_read: true 
  },
  { 
    id: 4, 
    type: 'SYSTEM', 
    user: 'Campus Bot', 
    content: 'Physics PYQ 2024 was just uploaded to GLA Resources.', 
    time: 'Yesterday', 
    is_read: true 
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'LIKE': return <Heart className="w-4 h-4 text-red-500 fill-current" />;
    case 'COMMENT': return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'FOLLOW': return <UserPlus className="w-4 h-4 text-green-500" />;
    case 'SYSTEM': return <FileText className="w-4 h-4 text-primary" />;
    default: return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between uppercase tracking-tight">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            Activity
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          </h1>
          <p className="text-muted-foreground font-medium italic lowercase">Stay updated with your campus interactions.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
          <CheckCircle2 className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.map((notif, idx) => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`glass-panel p-5 rounded-2xl flex items-center gap-5 border transition-all hover:bg-white/[0.02] cursor-pointer group ${
              notif.is_read ? 'border-white/5 opacity-80' : 'border-primary/20 bg-primary/5 shadow-lg shadow-primary/5'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${
              notif.is_read ? 'bg-white/5' : 'bg-primary/20'
            }`}>
              {getIcon(notif.type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/90 leading-tight">
                <span className="font-bold text-foreground">{notif.user}</span>{' '}
                <span className="text-muted-foreground">{notif.content}</span>
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1.5 flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary animate-pulse" />
                {notif.time}
              </p>
            </div>

            {!notif.is_read && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}

            <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="glass-panel p-20 text-center rounded-3xl border-dashed border-white/10">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground italic">No new activity yet. Start sharing to get notified!</p>
        </div>
      )}
    </div>
  );
}
