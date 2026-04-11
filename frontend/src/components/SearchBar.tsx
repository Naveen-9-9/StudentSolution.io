"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sparkles, Command, ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Suggestion {
  id: string;
  name: string;
  category: string;
  url?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetchApi(`/search/suggest?q=${encodeURIComponent(query)}&limit=5`);
        if (res.success) {
          setSuggestions(res.data.suggestions);
        }
      } catch (error) {
        console.error("Suggestion fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.url) {
      window.open(suggestion.url, "_blank");
    } else {
      router.push(`/tools/${suggestion.id}`);
    }
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl mx-auto z-50">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-[28px] blur-2xl opacity-0 group-focus-within:opacity-40 transition-opacity duration-500 -z-10" />
        
        <div className="relative flex items-center glass p-1.5 rounded-[28px] border-primary/20 group-focus-within:border-primary/40 shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-center w-12 h-full absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="What are you working on today? (e.g. lab report help)"
            className="w-full pl-14 pr-32 py-5 rounded-[22px] bg-transparent focus:outline-none text-lg font-bold tracking-tight text-foreground placeholder:text-muted-foreground/50 placeholder:font-medium"
          />
          
          <div className="absolute right-4 flex items-center gap-3">
             <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground uppercase tracking-widest pointer-events-none">
               <Command size={10} /> K
             </div>
             <button
              type="submit"
              className="bg-primary text-white p-3 rounded-2xl hover:bg-primary/90 transition-all shadow-lg active:scale-95 group-hover:px-6 flex items-center gap-2 overflow-hidden"
            >
              <span className="hidden group-hover:inline text-xs font-black uppercase tracking-widest">Search</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>

      {/* Premium Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-4 glass p-3 rounded-[32px] border-primary/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden z-50 backdrop-blur-3xl"
          >
            <div className="p-2 space-y-1">
              <div className="px-4 py-2 flex items-center gap-2 text-primary">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Matches</span>
              </div>
              
              {/* Milestone 9: AI Intent Hint */}
              {query.length > 2 && (
                <div className="mx-2 mb-4 p-4 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-primary">
                      <Sparkles size={12} className="animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Semantic Recognition</span>
                   </div>
                   <p className="text-xs font-bold text-foreground leading-tight">
                     {query.toLowerCase().includes('report') || query.toLowerCase().includes('essay') 
                        ? "Are you writing a paper? We've found specialized tools for citations and grammar."
                        : query.toLowerCase().includes('ppt') || query.toLowerCase().includes('slide')
                        ? "Presenting soon? Check out our top-rated AI slide deck generators."
                        : query.toLowerCase().includes('pdf') || query.toLowerCase().includes('convert')
                        ? "Need to transform documents? Our converters are students' #1 choice."
                        : "Discovering curated tools matching your specific academic need..."}
                   </p>
                </div>
              )}
              
              {suggestions.map((s, idx) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full flex items-center justify-between p-4 hover:bg-primary/10 rounded-2xl transition-all text-left group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:bg-primary/5 transition-all">
                      <Search size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-foreground group-hover/item:text-primary transition-colors">{s.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{s.category.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity text-primary">
                     <ArrowRight size={16} />
                  </div>
                </motion.button>
              ))}
            </div>
            
            <button
              onClick={() => handleSearch()}
              className="w-full mt-2 p-5 bg-primary/5 hover:bg-primary/10 rounded-2xl flex items-center justify-center gap-3 text-xs font-black text-primary uppercase tracking-[0.1em] transition-all"
            >
              Explore all tools for &quot;{query}&quot; <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
