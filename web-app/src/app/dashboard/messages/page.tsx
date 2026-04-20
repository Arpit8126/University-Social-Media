'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Smile,
  CheckCheck,
  UserPlus,
  MessageSquare
} from 'lucide-react';

const chats = [
  { id: 1, name: 'Deepak Sharma', lastMsg: 'Did you check the OS notes?', time: '2m ago', unread: 2, online: true },
  { id: 2, name: 'Siya Sharma', lastMsg: 'The hackathon starts at 9!', time: '1h ago', unread: 0, online: false },
  { id: 3, name: 'GLA Tech Group', lastMsg: 'Arpit: New resource uploaded.', time: 'Yesterday', unread: 0, online: true },
];

const messages = [
  { id: 1, sender: 'them', text: 'Hey, did you finish the assignment for BCA semester 4?', time: '10:30 AM' },
  { id: 2, sender: 'me', text: 'Almost done, just working on the last 2 questions of PYQ.', time: '10:35 AM' },
  { id: 3, sender: 'them', text: 'Great, can you share the PDF once you finish?', time: '10:36 AM' },
];

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [input, setInput] = useState('');

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      
      {/* Sidebar: Chat List */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
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
          {chats.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/5 group relative ${
                activeChat.id === chat.id ? 'bg-primary/10 border-primary/20' : 'border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg border border-white/5">
                  {chat.name[0]}
                </div>
                {chat.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-4 border-[#020617] rounded-full" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-bold truncate">{chat.name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{chat.time}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate italic">&quot;{chat.lastMsg}&quot;</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-primary/20">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="hidden md:flex flex-1 flex-col relative overflow-hidden bg-white/[0.01]">
        {/* Chat Header */}
        <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-background/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold border border-white/5">
                {activeChat.name[0]}
              </div>
              {activeChat.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-[3px] border-[#020617] rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold">{activeChat.name}</h3>
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest leading-none mt-1">
                {activeChat.online ? 'Online Now' : 'Last seen 2h ago'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground transition-all"><Phone className="w-5 h-5" /></button>
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground transition-all"><Video className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground transition-all"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar relative">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] group ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${
                    msg.sender === 'me' 
                      ? 'bg-primary text-white rounded-tr-none shadow-primary/10' 
                      : 'bg-white/5 text-foreground rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <p className="text-[10px] text-muted-foreground font-black uppercase opacity-60 font-mono">{msg.time}</p>
                    {msg.sender === 'me' && <CheckCheck className="w-3 h-3 text-primary opacity-60" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-background/50 backdrop-blur-xl border-t border-white/5">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2.5 shadow-inner group transition-all focus-within:border-primary/50">
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground group-focus-within:text-foreground transition-all"><Smile className="w-5 h-5" /></button>
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground group-focus-within:text-foreground transition-all"><ImageIcon className="w-5 h-5" /></button>
            <input 
              type="text" 
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              className={`p-2.5 rounded-xl transition-all ${
                input.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-muted-foreground opacity-50'
              }`}
              disabled={!input.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* No Chat Selected State (Mobile/Initial) */}
      {!activeChat && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 animate-pulse">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your Conversations</h2>
          <p className="text-sm text-muted-foreground max-w-sm italic">&quot;Select a friend to start chatting or search for new communities.&quot;</p>
          <button className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
            <UserPlus className="w-4 h-4" />
            Find Peers
          </button>
        </div>
      )}
    </div>
  );
}
