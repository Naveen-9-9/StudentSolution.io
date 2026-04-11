"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi, API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Chrome, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setTokensAndUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      if (response.success) {
        const { tokens, user } = response.data;
        await setTokensAndUser(tokens.accessToken, tokens.refreshToken, user);
        router.push("/");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Identity verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 py-12 bg-background text-white">
      {/* Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] bg-primary/20 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 20, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[100px] -z-10" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 100 }}
        className="w-full max-w-[480px] relative"
      >
        {/* Floating Brand Elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl flex items-center justify-center text-primary shadow-2xl animate-float -rotate-12 hidden md:flex">
          <Sparkles size={40} className="opacity-80" />
        </div>
        <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[24px] flex items-center justify-center text-primary/60 shadow-2xl animate-float-delayed rotate-12 hidden md:flex">
           <ShieldCheck size={32} className="opacity-80" />
        </div>

        <div className="bg-white/5 backdrop-blur-3xl p-8 md:p-12 rounded-[48px] border border-white/10 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Internal Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-[60px] opacity-50" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-10">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary to-primary-dark p-[1px] mb-8 shadow-2xl shadow-primary/40 group cursor-pointer"
              >
                <div className="w-full h-full rounded-[27px] bg-white/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
                  <LogIn size={36} strokeWidth={2.5} />
                </div>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                Unlock Hub
              </h1>
              <p className="text-muted-foreground font-medium max-w-sm">
                Enter your credentials to access the world&apos;s most versatile student ecosystem.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-8 p-5 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-black uppercase tracking-widest flex items-center gap-4 overflow-hidden"
                >
                  <div className="w-2 h-2 rounded-full bg-destructive animate-ping shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4">Access ID (Email)</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white/5 border border-white/5 focus:bg-white/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg placeholder:font-medium placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Passcode</label>
                  <Link href="#" className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Recover Account?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white/5 border border-white/5 focus:bg-white/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg placeholder:font-medium placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] text-white transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group",
                  loading ? "bg-primary/50 cursor-not-allowed" : "bg-primary shadow-primary/30"
                )}
              >
                {!loading && (
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform" />
                )}
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Initiate Session"}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </form>

            <div className="relative my-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.4em] bg-transparent">
                <span className="px-6 text-white/30 bg-background rounded-full">Secure SSO</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-5 glass rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] text-foreground transition-all flex items-center justify-center gap-4 border-white/5"
            >
              <Chrome size={20} className="text-blue-500" />
              Continue with Google
            </motion.button>

            <div className="mt-12 text-center">
              <span className="text-xs font-bold text-muted-foreground/60">No account assigned?</span>
              <Link href="/auth/register" className="ml-3 text-xs font-black text-primary hover:text-primary-dark transition-colors border-b-2 border-primary/20 hover:border-primary pb-1">
                Establish Identity
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[1em] text-muted-foreground">STUDENTSOLUTION.AI</p>
      </div>
    </div>
  );
}
