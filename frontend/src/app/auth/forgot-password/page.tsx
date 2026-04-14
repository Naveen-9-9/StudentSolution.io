"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetchApi("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        setSent(true);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Account recovery failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 py-12 bg-background text-foreground">
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
        className="w-full max-w-[480px] relative px-4 sm:px-6"
      >
        {/* Floating Brand Elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 glass rounded-3xl flex items-center justify-center text-primary shadow-2xl animate-float -rotate-12 hidden md:flex">
          <Sparkles size={40} className="opacity-80" />
        </div>
        <div className="absolute -bottom-8 -right-8 w-20 h-20 glass rounded-[24px] flex items-center justify-center text-primary/60 shadow-2xl animate-float-delayed rotate-12 hidden md:flex">
           <ShieldCheck size={32} className="opacity-80" />
        </div>

        <div className="glass p-8 md:p-12 rounded-[48px] relative overflow-hidden">
          {/* Internal Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-[60px] opacity-50" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-10">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary to-primary-dark p-[1px] mb-8 shadow-2xl shadow-primary/40 group cursor-pointer"
              >
                <div className="w-full h-full rounded-[27px] bg-background/50 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
                  {sent ? <Send size={36} strokeWidth={2.5} /> : <ShieldCheck size={36} strokeWidth={2.5} />}
                </div>
              </motion.div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-3 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                {sent ? "Check Inbox" : "Account Recovery"}
              </h1>
              <p className="text-muted-foreground font-medium max-w-sm">
                {sent 
                  ? "We've sent a secure link to your email to reset your passcode." 
                  : "Enter your email to receive a secure link to reset your passcode."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && !sent && (
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

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-8 mt-8">
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
                      className="w-full pl-14 pr-6 py-5 rounded-3xl bg-background/50 border border-border/10 focus:bg-background/80 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-base sm:text-lg placeholder:font-medium placeholder:text-muted-foreground/30 text-foreground"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] text-primary-foreground transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group",
                    loading ? "bg-primary/50 cursor-not-allowed" : "bg-primary shadow-primary/30"
                  )}
                >
                  {!loading && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform" />
                  )}
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" /> : "Send Reset Link"}
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </form>
            ) : (
              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSent(false)}
                  className="w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] text-primary transition-all flex items-center justify-center gap-4 glass border border-primary/20"
                >
                  Try another email
                </motion.button>
              </div>
            )}

            <div className="mt-12 flex justify-center">
              <Link href="/auth/login" className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 hover:text-primary transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
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
