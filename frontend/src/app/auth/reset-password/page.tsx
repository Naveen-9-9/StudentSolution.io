"use client";

import { useState, Suspense, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Loader2, EyeOff, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If no token is present, show invalid state immediately
  if (!token) {
    return (
      <div className="relative z-10 w-full flex flex-col items-center justify-center p-8 text-center space-y-6">
         <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
            <AlertCircle size={40} />
         </div>
         <h1 className="text-3xl font-black tracking-tighter">Invalid Link</h1>
         <p className="text-muted-foreground font-medium max-w-sm">
           The password reset link is invalid or missing. Please request a new one.
         </p>
         <Link href="/auth/forgot-password" className="mt-8 flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-6 py-3 rounded-full">
           Request New Link
         </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passcodes do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Passcode must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetchApi("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-6 px-4">
         <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
         >
            <CheckCircle2 size={48} />
         </motion.div>
         <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
           Password Reset
         </h1>
         <p className="text-muted-foreground font-medium max-w-sm">
           Your new passcode has been deployed securely. Redirecting to login...
         </p>
         <div className="mt-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
         </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full">
      <div className="flex flex-col items-center text-center mb-10">
        <motion.div 
          whileHover={{ rotate: -15, scale: 1.1 }}
          className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary to-primary-dark p-[1px] mb-8 shadow-2xl shadow-primary/40 group cursor-pointer"
        >
          <div className="w-full h-full rounded-[27px] bg-background/50 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
            <Lock size={36} strokeWidth={2.5} />
          </div>
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-3 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
          New Passcode
        </h1>
        <p className="text-muted-foreground font-medium max-w-sm">
          Enter a strong, unique passcode to secure your account.
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

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4">New Passcode</label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full pl-14 pr-14 py-5 rounded-3xl bg-background/50 border border-border/10 focus:bg-background/80 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-base sm:text-lg placeholder:font-medium placeholder:text-muted-foreground/30 text-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4">Confirm Passcode</label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full pl-14 pr-14 py-5 rounded-3xl bg-background/50 border border-border/10 focus:bg-background/80 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-base sm:text-lg placeholder:font-medium placeholder:text-muted-foreground/30 text-foreground"
            />
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" /> : "Deploy Passcode"}
          {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </motion.button>
      </form>

      <div className="mt-12 flex justify-center">
        <Link href="/auth/login" className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 hover:text-primary transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Notice: Changing passcode invalidates other sessions
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 py-12 bg-background text-foreground">
      {/* Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] bg-primary/20 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 20, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[100px] -z-10" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 100 }}
        className="w-full max-w-[480px] relative px-4 sm:px-6"
      >
        {/* Floating Brand Elements */}
        <div className="absolute -top-12 -right-12 w-24 h-24 glass rounded-3xl flex items-center justify-center text-primary shadow-2xl animate-float -rotate-12 hidden md:flex">
          <Sparkles size={40} className="opacity-80" />
        </div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 glass rounded-[24px] flex items-center justify-center text-primary/60 shadow-2xl animate-float-delayed rotate-12 hidden md:flex">
           <ShieldCheck size={32} className="opacity-80" />
        </div>

        <div className="glass p-8 md:p-12 rounded-[48px] relative overflow-hidden flex flex-col min-h-[400px] justify-center">
          {/* Internal Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-[60px] opacity-50" />
          
          <Suspense fallback={
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Decrypting Security Token...</p>
            </div>
          }>
             <ResetPasswordForm />
          </Suspense>
          
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[1em] text-muted-foreground">STUDENTSOLUTION.AI</p>
      </div>
    </div>
  );
}
