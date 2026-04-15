"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, XCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { setTokensAndUser } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isProcessing = useRef(false);

  useEffect(() => {
    const handleAuthSuccess = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        // If we are already authenticated via state (standard flow), we can skip the exchange
        const isAlreadyAuthenticated = localStorage.getItem("accessToken");

        if (!code && !isAlreadyAuthenticated) {
          throw new Error("Missing secure identity session.");
        }

        // Simulating a brief "Verification" delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (code) {
          // Exchange short-lived code for tokens
          const response = await fetchApi("/auth/exchange", {
            method: "POST",
            body: { code }
          });

          if (response.success && response.data) {
            const { tokens } = response.data;
            await setTokensAndUser(tokens.accessToken, tokens.refreshToken);
          } else {
            throw new Error("Exchange failed. Please try again.");
          }
        }
        
        setStatus("success");
        
        // Final transition delay
        setTimeout(() => router.replace("/"), 1200);
      } catch (error) {
        console.error("Auth success error:", error);
        setStatus("error");
        setErrorMsg((error as Error).message || "Verification failed");
        setTimeout(() => router.replace("/auth/login?error=auth_failed"), 3000);
      }
    };

    handleAuthSuccess();
  }, [router, setTokensAndUser]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md px-6 text-center"
      >
        <AnimatePresence mode="wait">
          {status === "processing" && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="space-y-8"
            >
              <div className="relative inline-flex items-center justify-center">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="w-32 h-32 rounded-full border-2 border-dashed border-primary/30"
                />
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <ShieldCheck size={48} className="animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter text-white">Verifying Identity</h2>
                <div className="flex items-center justify-center gap-3 text-muted-foreground/60 text-xs font-black uppercase tracking-[0.4em]">
                   <Loader2 size={14} className="animate-spin" />
                   Security Handshake
                </div>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="relative inline-flex items-center justify-center">
                <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1.5, opacity: 0 }}
                   transition={{ duration: 1 }}
                   className="absolute inset-0 bg-primary/40 rounded-full"
                />
                <div className="w-24 h-24 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-[0_0_40px_var(--color-brand-cyan)] border border-brand-cyan/30">
                  <CheckCircle2 size={48} />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-4xl font-black tracking-tighter text-white flex items-center justify-center gap-3">
                  <Sparkles className="text-yellow-400" size={24} /> 
                  Welcome Back
                </h2>
                <p className="text-muted-foreground font-medium text-lg">Identity confirmed. Accessing the Hub...</p>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="w-24 h-24 rounded-full bg-destructive/20 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
                <XCircle size={48} />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tighter text-white">Verification Failed</h2>
                <p className="text-destructive font-bold uppercase tracking-widest text-[10px] bg-destructive/10 py-2 px-4 rounded-full inline-block">
                  {errorMsg}
                </p>
                <p className="text-muted-foreground text-sm pt-4">Returning to security checkpoint...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decorative Brand Text */}
      <div className="absolute bottom-12 left-0 w-full text-center opacity-10">
        <p className="text-[10px] font-black uppercase tracking-[1.5em] text-white">SYSTEM AUTHENTICATED</p>
      </div>
    </div>
  );
}
