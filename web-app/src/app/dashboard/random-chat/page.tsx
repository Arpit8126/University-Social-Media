'use client';

import { motion } from 'framer-motion';
import { 
  Dices, 
  ShieldAlert,
  Zap,
  Users,
  MessageSquare,
  Construction
} from 'lucide-react';

export default function RandomChatPage() {
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8"
      >
        <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] animate-ping group-hover:animate-none opacity-20" />
          <Dices className="w-16 h-16 text-primary group-hover:rotate-12 transition-transform" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-black tracking-tight">Random Peer Chat</h1>
            <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
              <Construction className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Coming Soon</span>
            </div>
          </div>
          <p className="text-muted-foreground italic max-w-sm mx-auto">
            &quot;Connect with a random peer from your university. Completely anonymous until you choose otherwise.&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { icon: Users, title: 'Match Peers', desc: 'Random pairing' },
            { icon: MessageSquare, title: 'Chat Anonymously', desc: 'Hidden identity' },
            { icon: Zap, title: 'Add Friends', desc: 'After the chat' },
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <f.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-bold">{f.title}</p>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-3 max-w-md mx-auto">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          This feature requires WebSocket matchmaking and will be available in a future update.
        </div>
      </motion.div>
    </div>
  );
}
