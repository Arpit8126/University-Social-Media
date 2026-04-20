'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dices, 
  UserSearch, 
  MessageSquare, 
  X, 
  UserPlus, 
  ShieldAlert,
  Ghost,
  Zap,
  Send
} from 'lucide-react';

export default function RandomChatPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchTime, setMatchTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => {
        setMatchTime((prev) => {
          if (prev >= 5) {
            setIsSearching(false);
            setIsMatched(true);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col items-center justify-center relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {!isSearching && !isMatched && (
          <motion.div 
            key="initial"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8"
          >
            <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] animate-ping group-hover:animate-none opacity-20" />
              <Dices className="w-16 h-16 text-primary group-hover:rotate-12 transition-transform" />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight">Random Peer Chat</h1>
              <p className="text-muted-foreground italic max-w-sm mx-auto">&quot;Connect with a random peer from GLA University. Completely anonymous until you choose otherwise.&quot;</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              Guidelines: Respectful behavior is expected. Chat logs are moderated by AI.
            </div>

            <button 
              onClick={() => setIsSearching(true)}
              className="bg-primary text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 flex items-center gap-3 mx-auto group"
            >
              Start Matching
              <Zap className="w-5 h-5 group-hover:scale-125 transition-transform fill-current" />
            </button>
          </motion.div>
        )}

        {isSearching && (
          <motion.div 
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8"
          >
            <div className="relative">
              <div className="w-48 h-48 bg-primary/5 rounded-full flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/10 rounded-full"
                />
                <UserSearch className="w-16 h-16 text-primary animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold italic">Finding a match...</h2>
              <p className="text-muted-foreground font-mono">ESTIMATED TIME: 00:0{5 - matchTime}</p>
            </div>

            <button 
              onClick={() => setIsSearching(false)}
              className="text-muted-foreground hover:text-red-500 text-sm font-bold transition-colors"
            >
              Cancel Matching
            </button>
          </motion.div>
        )}

        {isMatched && (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full glass-panel rounded-[2.5rem] flex flex-col overflow-hidden border-white/5"
          >
            {/* User Meta / Match Info */}
            <div className="p-6 border-b border-white/5 bg-background/30 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 italic font-black text-primary">
                  <Ghost className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold italic">Anonymous Match</h3>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest leading-none mt-1">Chatting Now</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                  Reveal Identity
                </button>
                <button 
                  onClick={() => setIsMatched(false)}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Empty Chat History (Simulated) */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm text-muted-foreground/50 font-medium italic">&quot;The peer you matched with is typing. Say hi!&quot;</p>
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-4">
                <input 
                  type="text" 
                  placeholder="Send an anonymous message..."
                  className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium"
                />
                <button className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-center mt-4">
                <button className="text-[10px] font-black text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                  <UserPlus className="w-3 h-3" />
                  Add as Friend (Once chat ends)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
