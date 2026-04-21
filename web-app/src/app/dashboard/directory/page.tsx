'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  Clock, 
  Loader2, 
  Users,
  GraduationCap
} from 'lucide-react';

// Wrap the main content in a component that takes the search params
function DirectoryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // Sync state if URL changes directly
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Fetch profiles based on search
      let req = supabase.from('profiles').select('id, full_name, username, avatar_url, role').neq('id', user.id);
      
      if (searchQuery.trim()) {
        const q = `%${searchQuery.trim().toLowerCase()}%`;
        req = req.or(`full_name.ilike.${q},username.ilike.${q}`);
      }

      const { data: profileData, error: profileError } = await req.limit(50);
      if (profileError) throw profileError;

      // 2. Fetch friend requests involving this user
      const { data: requestData, error: requestError } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
        
      if (requestError) throw requestError;

      setProfiles(profileData || []);
      setFriendRequests(requestData || []);
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchQuery]);

  // Execute search when query changes, with a small debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  const handleSendRequest = async (targetId: string) => {
    if (!user) return;
    setIsActionLoading(targetId);
    try {
      const { error } = await supabase.from('friend_requests').insert({
        sender_id: user.id,
        receiver_id: targetId,
        status: 'PENDING'
      });
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send friend request.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setIsActionLoading(requestId);
    try {
      const { error } = await supabase.from('friend_requests').update({ status: 'ACCEPTED' }).eq('id', requestId);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept friend request.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const getRelationshipStatus = (targetId: string) => {
    const req = friendRequests.find(r => 
      (r.sender_id === user?.id && r.receiver_id === targetId) || 
      (r.receiver_id === user?.id && r.sender_id === targetId)
    );

    if (!req) return { status: 'NONE', req: null };
    if (req.status === 'ACCEPTED') return { status: 'FRIENDS', req };
    if (req.status === 'PENDING') {
      return req.sender_id === user?.id 
        ? { status: 'SENT', req } 
        : { status: 'RECEIVED', req };
    }
    return { status: 'NONE', req: null };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Directory</h1>
          <p className="text-muted-foreground">Find classmates and send friend requests to start chatting.</p>
        </div>
      </div>

      {/* Local Live Search */}
      <div className="relative max-w-xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search by name or username..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Optionally update the URL so it's shareable
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) {
              params.set('q', e.target.value);
            } else {
              params.delete('q');
            }
            router.replace(`/dashboard/directory?${params.toString()}`);
          }}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-base shadow-inner"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xl font-bold mb-2">No users found</p>
          <p className="text-muted-foreground italic">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profiles.map((p) => {
            const { status, req } = getRelationshipStatus(p.id);
            const isWorking = isActionLoading === p.id || isActionLoading === req?.id;

            return (
              <motion.div 
                key={p.id}
                whileHover={{ y: -5 }}
                className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center group border border-white/5 hover:border-white/10 transition-all shadow-xl"
              >
                <div className="w-24 h-24 mb-4 relative">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover shadow-lg border border-white/10" />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center font-bold text-3xl shadow-lg border border-white/10">
                      {p.full_name?.[0] || '?'}
                    </div>
                  )}
                  {p.role === 'Owner' && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg border border-[#020617]" title="Platform Owner">
                       <GraduationCap className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="mb-6 flex-1 w-full">
                  <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{p.full_name || 'Unknown User'}</h3>
                  <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1 mt-1 truncate">
                    @{p.username || 'user'}
                  </p>
                </div>

                <div className="w-full mt-auto">
                  {status === 'NONE' && (
                    <button 
                      onClick={() => handleSendRequest(p.id)}
                      disabled={isWorking}
                      className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Add Friend
                    </button>
                  )}

                  {status === 'SENT' && (
                    <button 
                      disabled
                      className="w-full py-2.5 rounded-xl bg-white/5 text-muted-foreground font-bold text-sm flex items-center justify-center gap-2 border border-white/10 cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4" />
                      Request Sent
                    </button>
                  )}

                  {status === 'RECEIVED' && (
                    <button 
                      onClick={() => req && handleAcceptRequest(req.id)}
                      disabled={isWorking}
                      className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                    >
                      {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                      Accept Request
                    </button>
                  )}

                  {status === 'FRIENDS' && (
                    <button 
                      onClick={() => router.push('/dashboard/messages')}
                      className="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-primary" />
                      Friends
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  );
}
