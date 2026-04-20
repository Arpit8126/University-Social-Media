'use client';

import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Users, 
  MessageSquare, 
  Flag, 
  Activity, 
  Search, 
  Settings,
  MoreVertical,
  Eye,
  Trash2,
  Ban
} from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '4,280', icon: Users, color: 'text-blue-500' },
  { label: 'Active Posts', value: '12,450', icon: MessageSquare, color: 'text-purple-500' },
  { label: 'Reported Content', value: '14', icon: Flag, color: 'text-red-500' },
  { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-green-500' },
];

const mockUsers = [
  { id: 1, name: 'Arpit Pandey', email: 'arpit@gla.ac.in', university: 'GLA', posts: 142, status: 'ACTIVE' },
  { id: 2, name: 'Sameer Garg', email: 'sameer@gla.ac.in', university: 'GLA', posts: 89, status: 'MODERATOR' },
  { id: 3, name: 'Troublemaker User', email: 'bad@univ.edu', university: 'Stanford', posts: 2, status: 'FLAGGED' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-foreground p-8">
      {/* Admin Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            Super Admin Access
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Owner Console</h1>
          <p className="text-muted-foreground italic lowercase font-medium">Global management & moderation hub.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search global users or chats..."
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all w-80 text-sm"
            />
          </div>
          <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="glass-panel p-6 rounded-3xl border-white/5 relative overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-none mb-2">{stat.label}</p>
            <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Management Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-8 glass-panel rounded-3xl border-white/5 p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              User Database
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-black">ALL UNIVERSITIES</span>
            </h2>
            <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
              View All History
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5 pb-4">
                  <th className="pb-4 pt-0">User Identity</th>
                  <th className="pb-4 pt-0">Email / Domain</th>
                  <th className="pb-4 pt-0">Content</th>
                  <th className="pb-4 pt-0 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{user.name}</p>
                          <p className="text-[10px] text-primary/70 font-black uppercase mt-1 tracking-tighter">{user.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-medium text-muted-foreground">
                      {user.email}
                      <span className="block text-[10px] opacity-50 mt-0.5">{user.university} University</span>
                    </td>
                    <td className="py-4 text-xs font-black tracking-widest text-foreground/70">
                      {user.posts} POSTS
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all">
                          <Ban className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Activity Feed Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-white/5 relative overflow-hidden">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Feed Audit
            </h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-1 h-12 bg-white/5 group-hover:bg-primary transition-colors rounded-full" />
                  <div>
                    <p className="text-xs font-bold leading-tight flex items-center gap-2">
                      Siya Sharma 
                      <span className="text-[10px] font-normal text-muted-foreground italic">just posted in Engineering Group</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">&quot;Can someone please share the notes for BCA semester 4 PYQ?&quot;</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                      <button className="hover:underline">View Post</button>
                      <button className="hover:underline text-red-500/70">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              OPEN MODERATION QUEUE
            </button>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl border-red-500/20 bg-red-500/5">
            <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-4 uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" />
              System Alerts
            </h3>
            <p className="text-xs text-muted-foreground italic mb-6">No critical server errors or database leaks detected in the last 24 hours.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">AUTH LOAD</p>
                <p className="text-lg font-black leading-none text-green-500 font-mono">NORMAL</p>
              </div>
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">R2 EGRESS</p>
                <p className="text-lg font-black leading-none text-blue-500 font-mono">$0.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
