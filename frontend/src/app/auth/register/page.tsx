"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi, API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, Lock, User, ArrowRight, Chrome, Sparkles, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setTokensAndUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Secure passcodes do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Passcode must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      if (response.success) {
        const { tokens, user } = response.data;
        await setTokensAndUser(tokens.accessToken, tokens.refreshToken, user);
        router.push("/auth/success"); // Redirect to success page for premium feel
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Identity establishment failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-12 md:py-20 bg-background text-foreground">
      {/* Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-600/10 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 25, repeat: Infinity, delay: 1 }}
        className="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] bg-secondary/10 rounded-full blur-[100px] -z-10" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 100 }}
        className="w-full max-w-[540px] relative"
      >
        {/* Floating Brand Elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 glass rounded-[28px] flex items-center justify-center text-primary/60 shadow-2xl animate-float-delayed rotate-12 hidden lg:flex">
          <Zap size={32} className="opacity-80" />
        </div>
        <div className="absolute -bottom-6 -left-10 w-24 h-24 glass rounded-[32px] flex items-center justify-center text-primary/60 shadow-2xl animate-float -rotate-6 hidden lg:flex">
           <Sparkles size={40} className="opacity-80" />
        </div>

        <div className="glass p-8 md:p-14 rounded-[56px] relative overflow-hidden">
          {/* Internal Accent Glow */}
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full blur-[80px] opacity-30" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-12">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -10 }}
                className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-secondary to-secondary-dark p-[1px] mb-8 shadow-2xl shadow-secondary/30 group cursor-pointer"
              >
                <div className="w-full h-full rounded-[27px] bg-background/50 flex items-center justify-center text-secondary transition-colors group-hover:bg-secondary/10 border-border/10">
                  <UserPlus size={36} strokeWidth={2.5} />
                </div>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Join Community
              </h1>
              <p className="text-muted-foreground font-medium max-w-sm text-base">
                Establish your identity to begin collaborating and sharing expertise.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-10 p-5 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-black uppercase tracking-widest flex items-center gap-4"
                >
                  <div className="w-2 h-2 rounded-full bg-destructive animate-ping shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 ml-4">Full Legal Name</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-all">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl bg-background/50 border border-border/10 focus:bg-background/80 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 ml-4">Academic Email</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-all">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@institution.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl bg-background/50 border border-border/10 focus:bg-background/80 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 ml-4">Passcode</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-secondary transition-all">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full pl-14 pr-6 py-5 rounded-3xl bg-background/50 border border-border/10 focus:bg-background/80 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg text-foreground"
                    />
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground/40 ml-4 uppercase tracking-widest">Use a unique, strong passcode</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 ml-4">Verification</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-secondary transition-all">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="w-full pl-14 pr-6 py-5 rounded-3xl bg-background/50 border border-border/10 focus:bg-background/80 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg text-foreground"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-6 mt-4 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] text-primary-foreground transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group",
                  loading ? "bg-primary/50 cursor-not-allowed" : "bg-primary shadow-primary/30"
                )}
              >
                {!loading && (
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform" />
                )}
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" /> : "Deploy Identity"}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </form>

            <div className="relative my-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.4em] bg-transparent">
                <span className="px-6 text-muted-foreground/40 bg-background rounded-full">One-Tap Auth</span>
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
              Sign up with Google
            </motion.button>

            <div className="mt-12 text-center">
              <span className="text-sm font-bold text-muted-foreground/60">Already established?</span>
              <Link href="/auth/login" className="ml-3 text-sm font-black text-primary hover:text-primary-dark transition-colors border-b-2 border-primary/20 hover:border-primary pb-1">
                Access Account
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
