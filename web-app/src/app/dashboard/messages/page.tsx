'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Send, 
  MoreVertical, 
  CheckCheck,
  UserPlus,
  MessageSquare,
  Loader2,
  Plus,
  X,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Phone,
  Video
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItem {
  id: string;
  last_message_text: string | null;
  last_message_at: string | null;
  participant: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'call';
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvo, setActiveConvo] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeCall, setActiveCall] = useState<any | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; full_name: string | null; username: string | null; avatar_url: string | null }[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (!participations || participations.length === 0) {
      setIsLoading(false);
      return;
    }

    const convoIds = participations.map((p) => p.conversation_id);

    const { data: convos } = await supabase
      .from('conversations')
      .select('*')
      .in('id', convoIds)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (!convos) {
      setIsLoading(false);
      return;
    }

    // For each conversation, get the other participant
    const enriched: ConversationItem[] = [];
    for (const convo of convos) {
      const { data: parts } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', convo.id)
        .neq('user_id', user.id);

      let participant = null;
      if (parts && parts.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .eq('id', parts[0].user_id)
          .single();
        participant = profile;
      }

      enriched.push({ ...convo, participant });
    }

    setConversations(enriched);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convoId: string) => {
    setIsLoadingMessages(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
    setIsLoadingMessages(false);
  }, []);

  // Subscribe to real-time messages & calls
  useEffect(() => {
    if (!user) return;

    // Call Channel
    const callChannel = supabase
      .channel(`personal_calls:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'personal_calls',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.status === 'RINGING') {
          setIncomingCall(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.status === 'ENDED' || payload.new.status === 'REJECTED') {
            setIncomingCall(null);
            setActiveCall(null);
          } else if (payload.new.status === 'ACTIVE') {
            setActiveCall(payload.new);
            setIncomingCall(null);
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'personal_calls',
        filter: `caller_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new.status === 'ACTIVE') {
          setActiveCall(payload.new);
        } else if (payload.new.status === 'ENDED' || payload.new.status === 'REJECTED') {
          setActiveCall(null);
        }
      })
      .subscribe();

    if (!activeConvo) return;

    fetchMessages(activeConvo.id);
    const msgChannel = supabase
      .channel(`messages:${activeConvo.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConvo.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as MessageItem]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(callChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [activeConvo, fetchMessages, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async (mediaUrl: string | null = null, mediaType: 'text'|'image'|'audio'|'video'|'call' = 'text') => {
    if ((!input.trim() && !mediaUrl) || !activeConvo || !user) return;
    const text = input.trim();
    setInput('');

    await supabase.from('messages').insert({
      conversation_id: activeConvo.id,
      sender_id: user.id,
      content: text ? text : null,
      media_url: mediaUrl,
      message_type: mediaType
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !activeConvo || !user) return;
    setIsUploadingMedia(true);
    const file = e.target.files[0];
    const isAudio = file.type.startsWith('audio/');
    const mediaType = isAudio ? 'audio' : 'image';
    const ext = file.name.split('.').pop();
    const path = `chat-media/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('campus-media').upload(path, file);
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('campus-media').getPublicUrl(path);
      await handleSend(publicUrl, mediaType);
    }
    setIsUploadingMedia(false);
  };

  const handleStartCall = async (type: 'audio' | 'video') => {
    if (!activeConvo || !user || !activeConvo.participant) return;
    const { data } = await supabase.from('personal_calls').insert({
      caller_id: user.id,
      receiver_id: activeConvo.participant.id,
      call_type: type
    }).select().single();
    if (data) setActiveCall(data);
  };

  const handleAnswerCall = async () => {
    if (!incomingCall) return;
    const { data } = await supabase.from('personal_calls').update({ status: 'ACTIVE', answered_at: new Date().toISOString() }).eq('id', incomingCall.id).select().single();
    setIncomingCall(null);
    if(data) setActiveCall(data);
  };

  const handleEndCall = async (callId: string) => {
    await supabase.from('personal_calls').update({ status: 'ENDED', ended_at: new Date().toISOString() }).eq('id', callId);
    setActiveCall(null);
    setIncomingCall(null);
    // Insert system message about call
    if (activeConvo) {
      await handleSend(null, 'call');
    }
  };

  // Search users for new chat
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .neq('id', user?.id || '')
        .limit(10);
      if (data) setSearchResults(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  // Start new conversation
  const startConversation = async (otherUserId: string) => {
    if (!user) return;

    // Check if conversation already exists
    const { data: myConvos } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (myConvos) {
      for (const mc of myConvos) {
        const { data: otherPart } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', mc.conversation_id)
          .eq('user_id', otherUserId)
          .maybeSingle();
        
        if (otherPart) {
          // Conversation exists, switch to it
          const existing = conversations.find((c) => c.id === mc.conversation_id);
          if (existing) {
            setActiveConvo(existing);
            setShowNewChat(false);
            return;
          }
        }
      }
    }

    // Create new conversation
    const { data: newConvo } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (!newConvo) return;

    await supabase.from('conversation_participants').insert([
      { conversation_id: newConvo.id, user_id: user.id },
      { conversation_id: newConvo.id, user_id: otherUserId },
    ]);

    setShowNewChat(false);
    await fetchConversations();
    
    // Find and select the new conversation
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .eq('id', otherUserId)
      .single();

    setActiveConvo({ ...newConvo, participant: profile });
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      
      {/* Sidebar: Chat List */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col shrink-0 ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <button 
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground italic">
              No conversations yet
            </div>
          ) : (
            conversations.map((convo) => (
              <button 
                key={convo.id}
                onClick={() => setActiveConvo(convo)}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/5 group relative ${
                  activeConvo?.id === convo.id ? 'bg-primary/10 border-primary/20' : 'border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  {convo.participant?.avatar_url ? (
                    <img src={convo.participant.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/5" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg border border-white/5">
                      {convo.participant?.full_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold truncate">{convo.participant?.full_name || 'User'}</p>
                    {convo.last_message_at && (
                      <p className="text-[10px] text-muted-foreground font-bold">
                        {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: false })}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate italic">
                    {convo.last_message_text ? `"${convo.last_message_text}"` : 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      {activeConvo ? (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-white/[0.01]">
          {/* Chat Header */}
          <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-background/30 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveConvo(null)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5"
              >
                ←
              </button>
              <div className="relative shrink-0">
                {activeConvo.participant?.avatar_url ? (
                  <img src={activeConvo.participant.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/5" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold border border-white/5">
                    {activeConvo.participant?.full_name?.[0] || '?'}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold">{activeConvo.participant?.full_name || 'User'}</h3>
                {activeConvo.participant?.username && (
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1">
                    @{activeConvo.participant.username}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleStartCall('audio')} className="p-2.5 rounded-xl hover:bg-green-500/10 text-green-500 transition-all group relative">
                <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => handleStartCall('video')} className="p-2.5 rounded-xl hover:bg-blue-500/10 text-blue-500 transition-all group relative">
                <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground transition-all"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </header>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar relative">
            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground italic">No messages yet. Say hi!</p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group ${msg.sender_id === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${
                        msg.sender_id === user?.id 
                          ? 'bg-primary text-white rounded-tr-none shadow-primary/10' 
                          : 'bg-white/5 text-foreground rounded-tl-none border border-white/5'
                      }`}>
                        {msg.message_type === 'image' && msg.media_url && (
                          <img src={msg.media_url} alt="Shared image" className="max-w-[200px] rounded-lg mb-2" />
                        )}
                        {msg.message_type === 'audio' && msg.media_url && (
                          <audio src={msg.media_url} controls className="max-w-[200px] h-10 mb-2" />
                        )}
                        {msg.message_type === 'call' && (
                          <div className="italic font-bold flex items-center gap-2">
                            <Phone className="w-4 h-4" /> Call Ended
                          </div>
                        )}
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-2 mt-2 px-1">
                        <p className="text-[10px] text-muted-foreground font-black uppercase opacity-60 font-mono">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {msg.sender_id === user?.id && <CheckCheck className="w-3 h-3 text-primary opacity-60" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
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
                placeholder="Type your message..."
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
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 animate-pulse">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your Conversations</h2>
          <p className="text-sm text-muted-foreground max-w-sm italic">&quot;Select a chat to start messaging or search for new peers.&quot;</p>
          <button 
            onClick={() => setShowNewChat(true)}
            className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Start a Chat
          </button>
        </div>
      )}

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">New Conversation</h2>
                <button onClick={() => setShowNewChat(false)} className="p-2 rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startConversation(u.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all"
                  >
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold">
                        {u.full_name?.[0] || '?'}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-bold">{u.full_name || 'User'}</p>
                      {u.username && <p className="text-[10px] text-muted-foreground">@{u.username}</p>}
                    </div>
                  </button>
                ))}
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 italic">No users found</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Call Modals */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="absolute top-8 right-8 bg-[#0f172a] border border-white/10 shadow-2xl rounded-3xl p-6 z-50 flex flex-col items-center min-w-[300px]">
             <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center animate-pulse mb-4">
                <Phone className="w-8 h-8 text-primary" />
             </div>
             <h3 className="text-lg font-bold mb-1">Incoming {incomingCall.call_type} call...</h3>
             <p className="text-sm text-muted-foreground mb-6">Someone is calling you</p>
             <div className="flex items-center gap-4 w-full">
               <button onClick={() => handleEndCall(incomingCall.id)} className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all">Decline</button>
               <button onClick={handleAnswerCall} className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 animate-bounce">Answer</button>
             </div>
          </motion.div>
        )}

        {activeCall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
             <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 mb-8 relative">
               <img src={activeConvo?.participant?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-primary/20 animate-pulse" />
             </div>
             <h2 className="text-3xl font-bold mb-2">{activeConvo?.participant?.full_name || 'Calling...'}</h2>
             <p className="text-sm font-medium text-muted-foreground mb-12">{activeCall.status === 'RINGING' ? 'Ringing...' : '00:00 Connected'}</p>
             <button onClick={() => handleEndCall(activeCall.id)} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-xl shadow-red-500/20">
               <Phone className="w-8 h-8 rotate-[135deg]" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
