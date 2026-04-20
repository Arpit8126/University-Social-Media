'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, 
  Lock, 
  Globe, 
  ShieldCheck, 
  Plus,
  ArrowRight,
  Search,
  Loader2,
  X,
  MessageCircle
} from 'lucide-react';
import type { Group } from '@/lib/types';
import Link from 'next/link';

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroup, setNewGroup] = useState({ name: '', description: '', type: 'PUBLIC' as Group['type'], emoji: '💬' });
  const [isCreating, setIsCreating] = useState(false);

  const fetchGroups = useCallback(async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) console.error('Error fetching groups:', error);

    if (data && user) {
      // Check membership for each group
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      const memberGroupIds = new Set(memberships?.map((m) => m.group_id) || []);
      const enriched = data.map((g) => ({ ...g, is_member: memberGroupIds.has(g.id) }));
      setGroups(enriched);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !user) return;
    setIsCreating(true);

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        type: newGroup.type,
        emoji: newGroup.emoji,
        created_by: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      // Auto-join as admin
      await supabase.from('group_members').insert({
        group_id: data.id,
        user_id: user.id,
        role: 'ADMIN',
      });
      setShowCreate(false);
      setNewGroup({ name: '', description: '', type: 'PUBLIC', emoji: '💬' });
      fetchGroups();
    }
    setIsCreating(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: user.id,
      role: 'MEMBER',
    });
    fetchGroups();
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
    fetchGroups();
  };

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all w-64 text-sm"
            />
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Group Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground italic">No groups found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((group) => (
            <motion.div 
              key={group.id}
              whileHover={{ y: -5 }}
              className="glass-panel p-6 rounded-2xl flex flex-col hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner border border-white/5">
                  {group.emoji}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  group.type === 'PUBLIC' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {group.type === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {group.type}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{group.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1 italic">&quot;{group.description || 'No description'}&quot;</p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {group.member_count} members
                </div>
                {group.is_member ? (
                  <Link 
                    href={`/dashboard/groups/${group.id}`}
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl"
                  >
                    Open Chat
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                ) : (
                  <button 
                    onClick={() => handleJoinGroup(group.id)}
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Join Group
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Group</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Group Name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              <textarea
                placeholder="Description (optional)"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
              />
              <div className="flex gap-2">
                {(['PUBLIC', 'PRIVATE', 'SEMI_PUBLIC'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewGroup({ ...newGroup, type })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      newGroup.type === type ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroup.name.trim() || isCreating}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Group
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
