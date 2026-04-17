"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check, Shield } from "lucide-react";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Wait a bit before showing to make it feel deliberate
    const hasConsent = localStorage.getItem("cookie-consent");
    if (!hasConsent) {
      const timer = setTimeout(() => setShowConsent(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowConsent(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[420px] z-[9999]"
        >
          <div className="glass p-6 md:p-8 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -z-10 group-hover:bg-primary/20 transition-colors" />
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Cookie size={24} />
                </div>
                <button 
                  onClick={() => setShowConsent(false)}
                  className="p-2 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  Cookie Settings
                  <Shield size={16} className="text-primary/60" />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  We use cookies to enhance your experience, manage your secure session, and analyze our traffic. No identity-sensitive data is shared.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAccept}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group/btn"
                >
                  <Check size={14} className="group-hover:scale-110 transition-transform" />
                  Accept All
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReject}
                  className="px-6 py-4 glass border-white/5 text-muted-foreground hover:text-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  Reject
                </motion.button>
              </div>
              
              <p className="text-[9px] font-bold text-muted-foreground/30 leading-tight uppercase tracking-widest text-center">
                Check our <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a> for more details.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
