"use client"
import { signIn } from "next-auth/react"

export default function LoginPage() {
    const handleGoogleLogin = async () => {
        await signIn("google", { redirectTo: "/dashboard" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-obsidian relative overflow-hidden selection:bg-brand/30">
            
            {/* Background Ambient Glows for depth */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* The Glassmorphism Card */}
            <div className="w-full max-w-md p-10 rounded-4xl bg-white/3 backdrop-blur-2xl border border-white/8 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] relative overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Inner subtle top-glow for the card border */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-brand/50 to-transparent"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand/10 blur-[80px] rounded-full pointer-events-none"></div>

                {/* Header Section */}
                <div className="relative z-10 text-center mb-10 mt-2">
                    {/* Logo/Icon Placeholder (Optional: makes it look more complete) */}
                    <div className="w-16 h-16 mx-auto mb-6 bg-linear-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                        <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>

                    <h1 className="text-4xl font-extrabold bg-linear-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent tracking-tight mb-3">
                        Vidyavriksha
                    </h1>
                    <p className="text-secondary/80 text-sm font-medium tracking-wide">
                        The Engineer's Academic Command Center
                    </p>
                </div>

                {/* The Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="group relative w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white/4 hover:bg-white/8 text-primary text-sm font-semibold rounded-xl border border-white/8 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-brand/5 overflow-hidden"
                >
                    {/* Subtle hover gradient inside the button */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/2 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    {/* Google SVG Icon with slight scale on hover */}
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 relative z-10" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 21.53 7.7 24 12 24z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 4.8c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.43 14.97 0 12 0 7.7 0 3.99 2.47 2.18 5.51l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="relative z-10">Continue with Google</span>
                </button>

                {/* Footer terms / privacy placeholder */}
                <p className="text-center text-xs text-secondary/50 mt-8 font-medium">
                    By securely signing in, you agree to our <br className="hidden sm:block"/> Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}