'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Lock, 
  Globe, 
  ShieldCheck, 
  Plus,
  ArrowRight,
  TrendingUp,
  Search,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';

const sampleGroups = [
  { 
    id: 1, 
    name: 'GLA Tech Community', 
    desc: 'The official tech hub for GLA hackers and developers.', 
    members: 1420, 
    type: 'PUBLIC', 
    category: 'Engineering',
    image: '💻'
  },
  { 
    id: 2, 
    name: 'Research Scholars', 
    desc: 'A private space for post-graduate research and journals.', 
    members: 85, 
    type: 'PRIVATE', 
    category: 'Academic',
    image: '📚'
  },
  { 
    id: 3, 
    name: 'Campus Socials', 
    desc: 'Everything about festivals, hackathons, and local events.', 
    members: 2840, 
    type: 'PUBLIC', 
    category: 'Social',
    image: '🎉'
  },
];

export default function GroupsPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Communities</h1>
          <p className="text-muted-foreground">Find and join your university&apos;s interest groups.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search groups..."
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all w-64 text-sm"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Featured / Welcome Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/20 rounded-full blur-[60px] group-hover:bg-primary/30 transition-all" />
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4" />
            Official University Hub
          </div>
          <h2 className="text-3xl font-bold mb-3">Welcome to GLA</h2>
          <p className="text-muted-foreground/80 mb-6 max-w-sm">Every verified student is automatically part of this core ecosystem. Share news and updates with everyone.</p>
          <button className="bg-white text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all">
            Enter Campus Square
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent relative overflow-hidden">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
            <TrendingUp className="w-4 h-4" />
            Trending Hub
          </div>
          <h2 className="text-3xl font-bold mb-3">Resource Vault</h2>
          <p className="text-muted-foreground/80 mb-6 max-w-sm">Access the shared academic repository from all departments. Upload and download with ease.</p>
          <Link href="/dashboard/resources" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 w-fit">
            Browse Notes
            <FolderOpen className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Group Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleGroups.map((group) => (
          <motion.div 
            key={group.id}
            whileHover={{ y: -5 }}
            className="glass-panel p-6 rounded-2xl flex flex-col hover:border-white/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner border border-white/5">
                {group.image}
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                group.type === 'PUBLIC' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {group.type === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {group.type}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{group.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1 italic">&quot;{group.desc}&quot;</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Users className="w-4 h-4" />
                {group.members.toLocaleString()} members
              </div>
              <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View Group
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
