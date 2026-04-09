"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Establishing your digital signature...");

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("Digital signature missing. Unable to verify identity.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetchApi(`/auth/verify?token=${token}`);
        if (res.success) {
          setStatus('success');
          setMessage("Identity established. Profile verified successfully.");
          // Redirect to dashboard after a delay
          setTimeout(() => router.push("/dashboard"), 3000);
        }
      } catch (err: unknown) {
        setStatus('error');
        setMessage((err as Error).message || "Identity verification failed. Token may be expired.");
      }
    };

    // Small artificial delay for "premium" scanning feel
    const timer = setTimeout(verify, 1500);
    return () => clearTimeout(timer);
  }, [token, router]);

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 py-12 bg-background text-white">
      {/* Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-0 left-0 w-full h-full bg-primary/10 rounded-full blur-[120px] -z-10" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[480px] glass p-10 md:p-14 rounded-[56px] border-primary/20 text-center relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="relative w-24 h-24 mx-auto">
                  <Loader2 className="w-full h-full text-primary animate-spin" strokeWidth={1} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="text-primary/40" size={32} />
                  </div>
               </div>
               <div className="space-y-2">
                 <h1 className="text-3xl font-black tracking-tight">Processing Signature</h1>
                 <p className="text-muted-foreground font-medium">{message}</p>
               </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
               <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 mx-auto animate-float">
                  <CheckCircle2 size={48} />
               </div>
               <div className="space-y-4">
                 <h1 className="text-4xl font-black tracking-tighter">Identity Pure</h1>
                 <p className="text-muted-foreground font-medium text-lg">{message}</p>
               </div>
               <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500/60 pt-4">
                  <Sparkles size={14} /> Redirection in progress
               </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
               <div className="w-24 h-24 bg-destructive/10 rounded-[32px] flex items-center justify-center text-destructive mx-auto animate-float">
                  <XCircle size={48} />
               </div>
               <div className="space-y-4">
                 <h1 className="text-4xl font-black tracking-tighter">Access Denied</h1>
                 <p className="text-muted-foreground font-medium text-lg leading-relaxed">{message}</p>
               </div>
               <button 
                 onClick={() => router.push("/dashboard")}
                 className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 group"
               >
                 Return to Base <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="text-primary animate-spin" size={40} />
       </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
