"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X,
  Type,
  Link as LinkIcon,
  Layout,
  FileText,
  Loader2,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = [
  { id: 'pdf-converter', name: 'PDF Converter', icon: '📄' },
  { id: 'productivity', name: 'Productivity', icon: '⚡' },
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'ppt-maker', name: 'PPT Maker', icon: '🎨' },
  { id: 'api', name: 'Developer API', icon: '💻' },
  { id: 'file-converter', name: 'File Converter', icon: '📁' },
  { id: 'other', name: 'Other', icon: '✨' },
];

export default function SubmitToolPage() {
  const { isAuthenticated, user } = useAuth(); 
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "productivity",
    description: "",
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleAddTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.toLowerCase()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetchApi("/tools", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if ((res as { success: boolean }).success) {
        setSubmitted(true);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to submit tool. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
           className="glass p-12 rounded-[40px] max-w-lg border-primary/20 shadow-2xl"
         >
           <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6" />
           <h1 className="text-3xl font-black mb-4">Authentication Required</h1>
           <p className="text-muted-foreground font-medium mb-8">You need to be part of the community to share new student tools.</p>
           <Link href="/auth/login" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
             Sign In to Continue
           </Link>
         </motion.div>
       </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors mb-10 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> BACK TO DISCOVERY
      </Link>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
                  <Plus size={12} /> Share Your Tool
                </div>
                <h1 className="text-5xl font-black tracking-tight leading-none">Contribute to Community</h1>
                <p className="text-muted-foreground font-medium text-lg">Help other students find the best tools by sharing your discoveries.</p>
              </div>
              <Sparkles className="w-12 h-12 text-primary/40 hidden md:block animate-pulse" />
            </div>

            {user && !user.isVerified && (
              <div className="mb-10 p-6 md:p-8 glass rounded-[32px] border border-primary/40 bg-primary/5 flex max-md:flex-col items-center justify-between gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/20 flex items-center justify-center text-primary shrink-0">
                       <ShieldAlert size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-foreground mb-1 tracking-tight">Identity Verification Required</h3>
                       <p className="text-sm font-medium text-muted-foreground">To maintain community trust, please verify your email before submitting tools.</p>
                    </div>
                 </div>
                 <Link href="/auth/verify" className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/40 whitespace-nowrap text-center max-md:w-full">
                   Verify Email Now
                 </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Primary Info */}
              <div className="glass p-8 md:p-12 rounded-[40px] border-primary/20 shadow-2xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                      <Type size={14} className="text-primary" /> Tool Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PDF Wizard"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                      <LinkIcon size={14} className="text-primary" /> Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Layout size={14} className="text-primary" /> Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat.id})}
                        className={cn(
                          "px-4 py-4 rounded-2xl border text-sm font-black transition-all flex flex-col items-center gap-2",
                          formData.category === cat.id 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                            : "bg-white/5 border-border/40 text-muted-foreground hover:bg-white/10 hover:border-border"
                        )}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="uppercase tracking-tighter text-[10px]">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <FileText size={14} className="text-primary" /> Short Description
                  </label>
                  <textarea
                    placeholder="Describe what this tool does in 1-2 powerful sentences..."
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" /> Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        {tag} <X size={12} className="cursor-pointer hover:text-foreground transition-colors" onClick={() => removeTag(tag)} />
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Add tags like 'pdf', 'productivity'... (Press Enter)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold"
                    />
                    <button 
                      type="button"
                      onClick={handleAddTag}
                      aria-label="Add tag"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-3">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting || (!!user && !user.isVerified)}
                    className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : "Submit for Verification"}
                    {!isSubmitting && <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  </button>
                  {!!user && !user.isVerified && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <ShieldAlert size={14} /> Verify email to enable submission
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest max-w-50 leading-relaxed">
                  Submissions are reviewed by our community team within 24 hours.
                </p>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-[32px] bg-primary/10 text-primary flex items-center justify-center mb-8 animate-float">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tight">Submission Received!</h1>
            <p className="text-muted-foreground font-medium text-lg max-w-md mb-12">
              Thanks for contributing! Your tool is now in the queue for moderation. We&apos;ll verify the link and details shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="px-8 py-4 glass rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all">
                Track Status on Dashboard
              </Link>
              <button 
                onClick={() => { setSubmitted(false); setFormData({name: "", url: "", category: "productivity", description: "", tags: []}); }} 
                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                Submit Another Tool
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
