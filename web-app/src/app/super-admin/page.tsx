'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
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
  Ban,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import type { Profile } from '@/lib/types';

const OWNER_EMAIL = 'admin_arpit_8395@codeshastra.tech';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalResources: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  // Auth guard - only owner
  useEffect(() => {
    if (profile && profile.email !== OWNER_EMAIL) {
      router.push('/dashboard');
    }
  }, [profile, router]);

  const fetchData = useCallback(async () => {
    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (usersData) setUsers(usersData as Profile[]);

    // Fetch stats
    const { count: userCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const { count: postCount } = await supabase.from('posts').select('id', { count: 'exact', head: true });
    const { count: resourceCount } = await supabase.from('resources').select('id', { count: 'exact', head: true });
    setStats({
      totalUsers: userCount || 0,
      totalPosts: postCount || 0,
      totalResources: resourceCount || 0,
    });

    // Fetch recent posts for audit feed
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, content, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    if (postsData) setRecentPosts(postsData);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    await supabase.from('profiles').update({ is_banned: !isBanned }).eq('id', userId);
    fetchData();
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    fetchData();
  };

  if (!profile || profile.email !== OWNER_EMAIL) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500' },
    { label: 'Active Posts', value: stats.totalPosts.toLocaleString(), icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Resources', value: stats.totalResources.toLocaleString(), icon: Flag, color: 'text-green-500' },
    { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-green-500' },
  ];

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
          <p className="text-muted-foreground italic lowercase font-medium">Global management &amp; moderation hub.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
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
        {statCards.map((stat, i) => (
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
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-black">{users.length} USERS</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5 pb-4">
                    <th className="pb-4 pt-0">User</th>
                    <th className="pb-4 pt-0">Email</th>
                    <th className="pb-4 pt-0">Role</th>
                    <th className="pb-4 pt-0 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs">
                              {u.full_name?.[0] || '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold leading-none">{u.full_name || 'Unknown'}</p>
                            {u.username && <p className="text-[10px] text-muted-foreground mt-1">@{u.username}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-medium text-muted-foreground">{u.email}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                          u.is_banned ? 'bg-red-500/10 text-red-500' :
                          u.role === 'Owner' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {u.is_banned ? 'BANNED' : u.role}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleBanUser(u.id, u.is_banned)}
                            className={`p-2 rounded-lg transition-all ${u.is_banned ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500' : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'}`}
                          >
                            {u.is_banned ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Feed Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-white/5 relative overflow-hidden">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Posts
            </h3>
            <div className="space-y-6">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex gap-4 group cursor-pointer">
                  <div className="w-1 h-12 bg-white/5 group-hover:bg-primary transition-colors rounded-full" />
                  <div className="flex-1">
                    <p className="text-xs font-bold leading-tight">
                      {post.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">&quot;{post.content}&quot;</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                      <button onClick={() => handleDeletePost(post.id)} className="hover:underline text-red-500/70">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
