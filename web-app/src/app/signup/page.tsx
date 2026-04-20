import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Aesthetic Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#020617]" />
      
      {/* Animated Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />

      <div className="w-full flex justify-center py-12">
        <SignUpForm />
      </div>

      {/* Footer / Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground text-xs flex items-center gap-4">
        <span>© 2026 Campus Network</span>
        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
        <span>Privacy Policy</span>
        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
        <span>Terms of Service</span>
      </div>
    </div>
  );
}
