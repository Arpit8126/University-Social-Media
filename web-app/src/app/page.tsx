import Link from 'next/link';
import { ArrowRight, GraduationCap, Users, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden bg-[#020617]">
      {/* Background Aesthetic Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />

      {/* Navigation */}
      <nav className="w-full max-w-7xl flex items-center justify-between p-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Swastik</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Log In</Link>
          <Link href="/signup" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all shadow-xl">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 max-w-4xl py-20">
        <div className="animate-float flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8">
          <Zap className="w-3 h-3 fill-current" />
          <span>NOW LIVE FOR TOP UNIVERSITIES</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          The Digital Home for <br />
          <span className="gradient-text">Unified University Life</span>
        </h1>
        
        <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
          The first university-exclusive platform that blends the connectivity of a messenger, the engagement of a social network, and the soul of your campus.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/signup" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 group">
            Create Your Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="glass-panel px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            Explore Features
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          {[
            { icon: ShieldCheck, title: "Verified Only", desc: "Only students with university emails can join." },
            { icon: Users, title: "Campus Groups", desc: "Automatic enrollment in your university's ecosystem." },
            { icon: Zap, title: "Real-time Hub", desc: "Instant notifications for events, clubs, and tasks." }
          ].map((feature, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl text-left border-white/5 hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 mt-20 flex flex-col items-center gap-6 px-6">
        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Instagram</Link>
        </div>
        <p className="text-xs text-muted-foreground opacity-50">© 2026 Swastik. All rights reserved.</p>
      </footer>
    </div>
  );
}
