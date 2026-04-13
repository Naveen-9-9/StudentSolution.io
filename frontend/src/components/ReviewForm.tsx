"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, MessageSquare, Send, X, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface ReviewFormProps {
  toolId: string;
  onSuccess: () => void;
  initialData?: {
    _id: string;
    text: string;
    rating: number;
  };
  onCancel?: () => void;
}

export default function ReviewForm({ toolId, onSuccess, initialData, onCancel }: ReviewFormProps) {
  const { isAuthenticated, user } = useAuth();
  const [text, setText] = useState(initialData?.text || "");
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (text.trim().length < 5) {
      setError("Review must be at least 5 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const endpoint = initialData 
        ? `/comments/${initialData._id}` 
        : `/comments/tools/${toolId}`;
      const method = initialData ? "PUT" : "POST";

      const res = await fetchApi(endpoint, {
        method,
        body: { text, rating }
      });

      if (res.success) {
        onSuccess();
        if (!initialData) {
          setText("");
          setRating(0);
        }
      } else {
        setError(res.message || "Failed to submit review");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      // Attempt to extract specific error from API response
      const serverMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(serverMessage || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full glass p-8 rounded-[38px] border-primary/20 bg-primary/5 relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <MessageSquare size={80} className="text-primary" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              {initialData ? <Edit3 size={18} className="text-primary" /> : <Star size={18} className="text-primary fill-primary" />}
              {initialData ? "Refine Your Review" : "Share Your Experience"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              {initialData ? "Update your insights for the community." : "How has this tool helped your academic journey?"}
            </p>
          </div>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Star Rating */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  size={32}
                  className={cn(
                    "transition-all duration-200",
                    (hoverRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-500 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                      : "text-muted-foreground/30"
                  )}
                />
              </motion.button>
            ))}
            <span className="ml-4 text-sm font-black text-yellow-500/80">
              {rating > 0 ? `${rating}.0 / 5.0` : "Select Rating"}
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your experience here... (What did you like? What could be better?)"
            className="w-full min-h-[140px] bg-black/20 border border-white/10 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground/30 resize-none"
          />
          <div className="flex justify-between items-center px-1">
             {error ? (
              <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">{error}</p>
            ) : (
                <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Minimum 5 characters</p>
            )}
            <p className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                text.length > 900 ? "text-yellow-500" : "text-muted-foreground/40"
            )}>
              {text.length} / 1000
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          type="submit"
          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing Identity Link...
            </>
          ) : (
            <>
              <Send size={16} />
              {initialData ? "Save Global Update" : "Publish to Community"}
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
