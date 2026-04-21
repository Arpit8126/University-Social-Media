'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MoreVertical, 
  CheckCheck,
  Users,
  MessageSquare,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  Phone,
  Settings,
  X,
  AlertTriangle,
  LogOut,
  Save,
  Globe,
  Lock,
  PhoneCall
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Group, GroupMessage, GroupMember, GroupCall } from '@/lib/types';

export default function GroupChatPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const groupId = unwrappedParams.id;
  const { user } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeCall, setActiveCall] = useState<GroupCall | null>(null);
  const [editGroup, setEditGroup] = useState({ name: '', description: '', rules: '', type: 'PUBLIC' });
  const [isSaving, setIsSaving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStaff = role === 'ADMIN' || role === 'CO_ADMIN' || role === 'MODERATOR';

  const fetchGroupData = useCallback(async () => {
    if (!user) return;

    // Check membership
    const { data: memberData } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!memberData) {
      router.push('/dashboard/groups');
      return;
    }

    setRole(memberData.role);

    // Fetch group
    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupData) {
      setGroup(groupData as Group);
      setEditGroup({
        name: groupData.name,
        description: groupData.description || '',
        rules: groupData.rules || '',
        type: groupData.type
      });
    }

    // Fetch messages
    const { data: msgData } = await supabase
      .from('group_messages')
      .select('*, profiles(full_name, avatar_url, username)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (msgData) setMessages(msgData as GroupMessage[]);

    // Fetch active call
    const { data: callData } = await supabase
      .from('group_calls')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (callData) setActiveCall(callData as GroupCall);

    setIsLoading(false);
  }, [user, groupId, router]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const msgChannel = supabase
      .channel(`group_messages:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`,
      }, async (payload) => {
        // Fetch full profile info for new message
        const { data: fullMsg } = await supabase
          .from('group_messages')
          .select('*, profiles(full_name, avatar_url, username)')
          .eq('id', payload.new.id)
          .single();
        
        if (fullMsg) {
          setMessages((prev) => [...prev, fullMsg as GroupMessage]);
        }
      })
      .subscribe();

    const callChannel = supabase
      .channel(`group_calls:${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_calls',
        filter: `group_id=eq.${groupId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.status === 'ACTIVE') {
          setActiveCall(payload.new as GroupCall);
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'ENDED') {
          setActiveCall(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(callChannel);
    };
  }, [groupId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (mediaUrl: string | null = null, mediaType: 'text'|'image'|'audio'|'call' = 'text', overrideContent?: string) => {
    const text = overrideContent || input.trim();
    if ((!text && !mediaUrl) || !user) return;
    setInput('');

    const { error } = await supabase.from('group_messages').insert({
      group_id: groupId,
      sender_id: user.id,
      content: text ? text : null,
      media_url: mediaUrl,
      message_type: mediaType
    });

    if (error) {
      console.error('Message Send Error:', error);
      alert(`Failed to send message: ${error.message}`);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    setIsUploadingMedia(true);
    const file = e.target.files[0];
    const isAudio = file.type.startsWith('audio/');
    const mediaType = isAudio ? 'audio' : 'image';
    const ext = file.name.split('.').pop();
    const path = `group-media/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('campus-media').upload(path, file);
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('campus-media').getPublicUrl(path);
      await handleSend(publicUrl, mediaType);
    }
    setIsUploadingMedia(false);
  };

  const handleStartGroupCall = async () => {
    if (!isStaff || !user) return;
    const { data } = await supabase.from('group_calls').insert({
      group_id: groupId,
      initiated_by: user.id,
      status: 'ACTIVE'
    }).select().single();

    if (data) {
      setActiveCall(data as GroupCall);
      await handleSend(null, 'call', 'Call generated by Admin.');
    }
  };

  const handleEndGroupCall = async () => {
    if (!isStaff || !activeCall) return;
    await supabase.from('group_calls').update({ status: 'ENDED', ended_at: new Date().toISOString() }).eq('id', activeCall.id);
    setActiveCall(null);
    await handleSend(null, 'call', 'Call ended.');
  };

  const handleJoinCall = () => {
    alert("WebRTC Media Stream connection will happen here. Currently connecting to signaling server...");
  };

  const handleSaveGroup = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('groups').update({
      name: editGroup.name.trim(),
      description: editGroup.description.trim(),
      rules: editGroup.rules.trim(),
      type: editGroup.type
    }).eq('id', groupId);

    if (!error) {
      setGroup({ ...group!, ...editGroup } as Group);
      setShowAdminPanel(false);
    }
    setIsSaving(false);
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
    router.push('/dashboard/groups');
  };

  if (isLoading || !group) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        
        {/* Chat Header */}
        <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-background/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-2xl border border-white/5">
              {group.emoji}
            </div>
            <div>
              <h3 className="font-bold">{group.name}</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3 h-3" /> {group.member_count} Members 
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                {group.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStaff && (
              <>
                {activeCall ? (
                  <button onClick={handleEndGroupCall} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all flex items-center gap-2">
                    <Phone className="w-4 h-4 rotate-[135deg]" /> End Call
                  </button>
                ) : (
                  <button onClick={handleStartGroupCall} className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 font-bold hover:bg-green-500/20 transition-all flex items-center gap-2 group">
                    <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" /> Start Call
                  </button>
                )}
                <div className="w-px h-6 bg-white/10 mx-2" />
              </>
            )}
            <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Active Call Banner */}
        <AnimatePresence>
          {activeCall && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-green-500/10 border-b border-green-500/20 px-8 py-3 flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-green-500">Group Call in Progress</span>
              </div>
              <button onClick={handleJoinCall} className="px-6 py-1.5 rounded-lg bg-green-500 text-white font-bold text-xs shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all animate-pulse">
                Join Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar relative">
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const showAvatar = !isMe && (i === 0 || messages[i-1].sender_id !== msg.sender_id);

            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 shrink-0 relative mt-1">
                    {showAvatar && (
                      msg.profiles?.avatar_url ? (
                        <img src={msg.profiles.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
                          {msg.profiles?.full_name?.[0] || '?'}
                        </div>
                      )
                    )}
                  </div>
                )}
                
                <div className={`max-w-[70%] group ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && showAvatar && (
                    <span className="text-[10px] font-bold text-muted-foreground ml-1 mb-1">{msg.profiles?.full_name}</span>
                  )}
                  
                  {msg.message_type === 'call' ? (
                    <div className="px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col items-center gap-2">
                       <PhoneCall className="w-6 h-6 animate-pulse" />
                       <span className="font-bold text-sm text-center">{msg.content}</span>
                       {msg.content?.includes('generated') && (
                         <button onClick={handleJoinCall} className="mt-2 px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold w-full hover:bg-amber-600 transition-colors">Join</button>
                       )}
                    </div>
                  ) : (
                    <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${
                      isMe 
                        ? 'bg-primary text-white rounded-tr-none shadow-primary/10' 
                        : 'bg-white/5 text-foreground rounded-tl-none border border-white/5'
                    }`}>
                      {msg.message_type === 'image' && msg.media_url && (
                        <img src={msg.media_url} alt="Shared image" className="max-w-[200px] rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity" />
                      )}
                      {msg.message_type === 'audio' && msg.media_url && (
                        <audio src={msg.media_url} controls className="max-w-[200px] h-10 mb-2" />
                      )}
                      {msg.content}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1 px-1">
                    <p className="text-[10px] text-muted-foreground font-black uppercase opacity-60 font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {isMe && <CheckCheck className="w-3 h-3 text-primary opacity-60" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-background/50 backdrop-blur-xl border-t border-white/5">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 shadow-inner group transition-all focus-within:border-primary/50">
            <label className="p-2 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
              <input type="file" className="hidden" accept="image/*,audio/*" onChange={handleMediaUpload} disabled={isUploadingMedia} />
              {isUploadingMedia ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </label>
            
            <input 
              type="text" 
              placeholder="Message group..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              className={`p-2.5 rounded-xl transition-all ${
                input.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-muted-foreground opacity-50'
              }`}
              disabled={!input.trim()}
              onClick={() => handleSend()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar: Group Info / Admin */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-white/5 rounded-3xl border border-white/5 overflow-y-auto no-scrollbar"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold">Group Info</h3>
                <button onClick={() => setShowAdminPanel(false)} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
              </div>

              {!isStaff ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Description</h4>
                    <p className="text-sm italic">{group.description || 'No description provided.'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Rules</h4>
                    <p className="text-sm whitespace-pre-wrap">{group.rules || 'No rules defined.'}</p>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <button onClick={handleLeaveGroup} className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                       <LogOut className="w-4 h-4" /> Leave Group
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    Admin controls. Changes are visible to all members.
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Group Name</label>
                      <input type="text" value={editGroup.name} onChange={(e) => setEditGroup({...editGroup, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Description</label>
                      <textarea value={editGroup.description} onChange={(e) => setEditGroup({...editGroup, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary resize-none h-20" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Rules & Regulations</label>
                      <textarea value={editGroup.rules} onChange={(e) => setEditGroup({...editGroup, rules: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary resize-none h-32" placeholder="1. Be respectful..." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Visibility</label>
                      <div className="flex gap-2">
                        {(['PUBLIC', 'PRIVATE'] as const).map(t => (
                          <button key={t} onClick={() => setEditGroup({...editGroup, type: t})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${editGroup.type === t ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleSaveGroup} disabled={isSaving} className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                  </button>

                  <div className="pt-6 border-t border-white/5">
                    <button onClick={handleLeaveGroup} className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                       <LogOut className="w-4 h-4" /> Leave Group
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
