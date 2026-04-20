'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Calendar, 
  Award, 
  MessageSquare, 
  FolderOpen, 
  Globe,
  Settings,
  ShieldCheck,
  Star,
  GraduationCap
} from 'lucide-react';

const userStats = [
  { label: 'Posts', value: '142', icon: MessageSquare },
  { label: 'Resources', value: '12', icon: FolderOpen },
  { label: 'Connections', value: '850', icon: GraduationCap },
];

const badges = [
  { name: 'Resource Champ', icon: '🏆', color: 'bg-amber-500/10 text-amber-500' },
  { name: 'Community Leader', icon: '🎖️', color: 'bg-primary/10 text-primary' },
  { name: 'Campus Star', icon: '⭐', color: 'bg-blue-500/10 text-blue-500' },
];

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform">
              A
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-background border border-white/10 rounded-xl shadow-lg">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">Arpit Pandey</h1>
              <span className="w-fit px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                CAMPUS STAR
              </span>
            </div>
            <p className="text-muted-foreground font-medium italic lowercase">&quot;Building the future of campus social networking @GLA.&quot;</p>
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 pt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                GLA University
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Joined April 2026
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
              Edit Profile
            </button>
            <button className="bg-white/5 hover:bg-white/10 text-foreground px-8 py-3 rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Badges & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Badges */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5 pb-4">
              Gamified Stats
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {userStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 group hover:bg-white/10 transition-all cursor-crosshair">
                  <div className="flex items-center gap-3">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">{stat.label}</span>
                  </div>
                  <span className="text-lg font-black">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5 pb-4">
              Earned Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 shadow-sm ${badge.color}`}>
                  <span>{badge.icon}</span>
                  {badge.name}
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all">
              View All Badges
            </button>
          </div>
        </div>

        {/* Right Column: Activity / Portfolio */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl border-white/5">
          <div className="flex items-center gap-8 mb-10 border-b border-white/5 pb-6">
            {['Activity', 'Resources', 'About'].map((tab, i) => (
              <button 
                key={tab} 
                className={`text-sm font-black uppercase tracking-widest pb-6 -mb-6 border-b-2 transition-all ${
                  i === 0 ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {[1, 2].map((post) => (
              <div key={post} className="p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground/50 uppercase mb-4">
                  <Calendar className="w-3 h-3" />
                  April 18, 2026
                  <span className="w-1 h-1 bg-white/20 rounded-full mx-1" />
                  Shared in Academic Resources
                </div>
                <p className="text-sm font-medium italic mb-4 leading-relaxed group-hover:text-foreground transition-colors">
                  &quot;I just uploaded the the complete notes for Data Structures Semester 4. Includes all PYQ solutions from 2022-2024!&quot;
                </p>
                <div className="flex items-center gap-6 text-xs text-muted-foreground font-bold">
                  <div className="flex items-center gap-1.5"><Star className="w-3 h-3" /> 42</div>
                  <div className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> 12</div>
                </div>
              </div>
            ))}
            <button className="w-full py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Show more activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
