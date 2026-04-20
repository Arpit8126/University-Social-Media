'use client';

import { motion } from 'framer-motion';
import { 
  Trophy, 
  Timer, 
  HelpCircle, 
  Zap,
  Star,
  BarChart4,
  Construction
} from 'lucide-react';

export default function PollsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase tracking-tight">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Campus Pulse</h1>
          <p className="text-muted-foreground font-medium italic lowercase">Compete in weekly polls and win exclusive badges.</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Construction className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-500">Coming Soon</span>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="glass-panel p-16 rounded-3xl border-white/5 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Polls & Quizzes</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          Weekly contests, live leaderboards, and exclusive badges are coming to Swastik. 
          Top performers will earn the &quot;Sharp Mind&quot; badge!
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { icon: Timer, title: 'Timed Quizzes', desc: 'Compete against the clock' },
            { icon: BarChart4, title: 'Live Leaderboard', desc: 'Real-time rankings' },
            { icon: Star, title: 'Earn Badges', desc: 'Weekly rewards' },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-sm font-bold mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
