'use client';

import { motion } from 'framer-motion';
import { 
  Trophy, 
  Timer, 
  HelpCircle, 
  Users, 
  ArrowRight,
  Zap,
  Star,
  CheckCircle2,
  BarChart4
} from 'lucide-react';

const activeQuizzes = [
  { 
    id: 1, 
    title: 'Weekly Tech Trivia #14', 
    desc: 'How well do you know OS and Data Structures? Top 3 winners get the "Sharp Mind" badge.', 
    participants: 1420, 
    expires: '2h 14m left',
    reward: '500 XP'
  },
  { 
    id: 2, 
    title: 'University Culture Poll', 
    desc: 'Vote for the best location for the upcoming Fall Festival 2026.', 
    participants: 2840, 
    expires: '1 day left',
    reward: 'Badge'
  },
];

const topPerformers = [
  { name: 'Arpit Pandey', points: 4800, rank: 1 },
  { name: 'Sameer Garg', points: 4200, rank: 2 },
  { name: 'Siya Sharma', points: 3950, rank: 3 },
];

export default function PollsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase tracking-tight">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Campus Pulse</h1>
          <p className="text-muted-foreground font-medium italic lowercase">Compete in weekly polls and win exclusive badges.</p>
        </div>
        
        <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-lg shadow-primary/5">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Rank</p>
            <p className="text-lg font-black text-primary">#142 <span className="text-[10px] text-muted-foreground opacity-50 ml-1">TOP 10%</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Contests */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary fill-current animate-pulse" />
            Live Contests & Polls
          </h2>

          <div className="space-y-4">
            {activeQuizzes.map((quiz, i) => (
              <motion.div 
                key={quiz.id}
                whileHover={{ scale: 1.01 }}
                className="glass-panel p-8 rounded-[2rem] border-white/5 relative overflow-hidden group border-l-4 border-l-primary"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -z-10 group-hover:bg-primary/10 transition-all" />
                
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold">{quiz.title}</h3>
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-current" />
                        {quiz.reward}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium italic italic">&quot;{quiz.desc}&quot;</p>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-2">
                      <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {quiz.participants} Voted</span>
                      <span className="flex items-center gap-1.5 text-primary"><Timer className="w-3 h-3" /> {quiz.expires}</span>
                    </div>
                  </div>

                  <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all w-full md:w-auto justify-center">
                    {quiz.title.includes('Poll') ? 'Vote Now' : 'Start Quiz'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
              <BarChart4 className="w-4 h-4 text-primary" />
              Weekly Top 10
            </h3>
            
            <div className="space-y-6">
              {topPerformers.map((user, i) => (
                <div key={i} className="flex items-center gap-4 relative group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${
                    i === 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/10 text-muted-foreground'
                  }`}>
                    #{user.rank}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold truncate flex items-center gap-2">
                      {user.name}
                      {i === 0 && <CheckCircle2 className="w-3 h-3 text-amber-500" />}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">{user.points} Points Earned</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all">
              Full Leaderboard
            </button>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-white/5 bg-gradient-to-br from-primary/5 to-transparent text-center">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
            <h4 className="text-lg font-bold mb-2">Want to host?</h4>
            <p className="text-xs text-muted-foreground italic mb-6">Campus Reps and Mods can host official university quizzes.</p>
            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Apply for Mod Status</button>
          </div>
        </div>
      </div>
    </div>
  );
}
