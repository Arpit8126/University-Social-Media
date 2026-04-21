'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FolderOpen, 
  Shield, 
  Bell, 
  LogOut,
  Search,
  GraduationCap,
  BarChart4,
  Shuffle,
  User,
  Loader2
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Feed', href: '/dashboard' },
  { icon: Users, label: 'Groups', href: '/dashboard/groups' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: Users, label: 'Directory', href: '/dashboard/directory' },
  { icon: Shield, label: 'Anonymous', href: '/dashboard/anonymous' },
  { icon: FolderOpen, label: 'Resources', href: '/dashboard/resources' },
  { icon: BarChart4, label: 'Polls', href: '/dashboard/polls' },
  { icon: Shuffle, label: 'Random Chat', href: '/dashboard/random-chat' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSidebarOpen = true;
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();

  // Auth guard - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#020617] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) return null;

  const displayName = profile?.full_name || 'Student';
  const universityName = profile?.universities?.name || 'University';
  const userInitial = displayName[0]?.toUpperCase() || 'S';

  return (
    <div className="flex h-screen bg-[#020617] text-foreground overflow-hidden">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden md:flex flex-col border-r border-white/5 bg-background/50 backdrop-blur-xl z-20 relative"
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold tracking-tight"
              >
                Swastik
              </motion.span>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Visuals */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-background/30 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search users, groups, or notes..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    router.push(`/dashboard/directory?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground transition-all relative group">
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </Link>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <Link href="/dashboard/profile" className="flex items-center gap-3 p-1 pr-3 rounded-xl hover:bg-white/5 transition-all group">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName} 
                  className="w-9 h-9 rounded-lg object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                  {userInitial}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold leading-tight">{displayName}</p>
                <p className="text-[10px] text-muted-foreground leading-tight uppercase font-bold tracking-wider">{universityName}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
