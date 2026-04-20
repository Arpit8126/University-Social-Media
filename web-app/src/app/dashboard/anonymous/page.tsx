'use client';

import { motion } from 'framer-motion';
import { 
  ShieldQuestion, 
  MessageSquare, 
  Send, 
  Ghost, 
  Flame, 
  ShieldAlert,
  Zap,
  MoreVertical,
  Plus
} from 'lucide-react';
import { useState } from 'react';

const threads = [
  { id: 1, text: 'Is it true that the GLA library will be open 24/7 during exams?', comments: 42, upvotes: 156, time: '2h ago' },
  { id: 2, text: 'What are the best electives for BCA 4th Semester? Need honest reviews!', comments: 12, upvotes: 45, time: '4h ago' },
  { id: 3, text: 'Confession: I accidentally slept through my mid-term viva today. Help.', comments: 89, upvotes: 210, time: '6h ago' },
];

export default function AnonymousPage() {
  const [input, setInput] = useState('');

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
            <span className="font-bold">Guidelines:</span> While posts are anonymous to other students, please avoid sharing sensitive personal data. Hate speech or harassment will be flagged by AI.
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
              placeholder="What's the campus secret? Speak anonymously..."
              className="w-full bg-transparent border-none outline-none text-lg resize-none min-h-[100px] placeholder:text-muted-foreground/30 font-medium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 italic opacity-40">AUTO-DELETE IN 48 HOURS</span>
              <button 
                className={`bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 ${
                  !input.trim() && 'opacity-50 grayscale'
                }`}
              >
                Launch Post
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion List */}
      <div className="space-y-4">
        {threads.map((thread, idx) => (
          <motion.div 
            key={thread.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
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
                  <span>{thread.time}</span>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <p className="text-foreground/90 font-medium leading-relaxed italic mb-6">
              &quot;{thread.text}&quot;
            </p>

            <div className="flex items-center gap-6 pt-4 border-t border-white/5 uppercase font-black text-[10px] tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2 group-hover:text-foreground transition-colors">
                <MessageSquare className="w-4 h-4" />
                {thread.comments} Comments
              </div>
              <div className="flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                <Zap className="w-4 h-4 fill-current" />
                {thread.upvotes} Sparks
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
