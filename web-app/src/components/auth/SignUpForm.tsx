'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, GraduationCap, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if domain is valid as user types
  useEffect(() => {
    const checkDomain = async () => {
      const parts = email.trim().split('@');
      const domain = parts.length > 1 ? parts[1].toLowerCase() : null;

      if (!domain || !domain.includes('.')) {
        setUniversity(null);
        return;
      }

      setIsCheckingDomain(true);
      console.log('Checking domain:', domain); // Cache debug

      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('domain', domain)
        .single();

      if (error) console.error('Domain check error:', error);

      if (data && !error) {
        setUniversity(data);
        setMessage(null);
      } else if (
        email.trim().toLowerCase() === 'admin_arpit_8395@codeshastra.tech' || 
        email.trim().toLowerCase() === 'arpit.pandey_bca.ds24@gla.ac.in'
      ) {
        setUniversity({ id: '00000000-0000-0000-0000-000000000000', name: 'Owner Account' });
        setMessage(null);
      } else {
        setUniversity(null);
      }
      setIsCheckingDomain(false);
    };

    const timer = setTimeout(checkDomain, 500);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!university) {
      setMessage({ type: 'error', text: 'Please use a valid university email address.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          university_id: university.id,
        },
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ 
        type: 'success', 
        text: 'Verification link sent! Please check your university email.' 
      });
    }
    setIsLoading(false);
  };

  if (message?.type === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-2xl text-center max-w-md w-full"
      >
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-primary animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Check your Inbox</h2>
        <p className="text-muted-foreground mb-8">
          We&apos;ve sent a verification link to <span className="text-foreground font-medium">{email}</span>. 
          Please click it to activate your campus account.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
        >
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
      
      <div className="mb-8 items-center flex flex-col">
        <h1 className="text-3xl font-bold gradient-text">Join Campus</h1>
        <p className="text-muted-foreground mt-2">Verified university students only</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              required
              placeholder="Arpit Pandey"
              className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">University Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="you@university.edu"
              className={`w-full bg-background/50 border rounded-xl py-3 pl-10 pr-4 focus:ring-2 outline-none transition-all ${
                university ? 'border-green-500/50 focus:ring-green-500/30' : 'border-border focus:ring-primary/50'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCheckingDomain && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              {university && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
          </div>
          
          <AnimatePresence>
            {university && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-green-500 mt-1 ml-1"
              >
                <GraduationCap className="w-3 h-3" />
                University Detected: {university.name}
              </motion.div>
            )}
            {!university && email.includes('@') && !isCheckingDomain && (
              <motion.div className="flex items-center gap-2 text-xs text-amber-500 mt-1 ml-1">
                <AlertCircle className="w-3 h-3" />
                Waiting for a valid university domain...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {message?.type === 'error' && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !university}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Verify Identity
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
