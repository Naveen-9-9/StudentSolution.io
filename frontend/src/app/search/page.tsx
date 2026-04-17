"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, User, LayoutGrid, ListFilter, Sparkles, ChevronDown } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Tool, PaginationData } from "@/lib/types";
import ToolCard from "@/components/ToolCard";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const sortBy = searchParams.get("sortBy") || "relevant";

  const [tools, setTools] = useState<Tool[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());
  const [intentMatched, setIntentMatched] = useState<string | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [highlightedToolId, setHighlightedToolId] = useState<string | null>(null);

  const sortOptions = [
    { id: "relevant", label: "Most Relevant" },
    { id: "popular", label: "Most Popular" },
    { id: "recent", label: "Newest First" },
  ];

  const categories = [
    { id: "", label: "All Categories" },
    { id: "pdf-converter", label: "PDF Converter" },
    { id: "ppt-maker", label: "PPT Maker" },
    { id: "api", label: "API" },
    { id: "file-converter", label: "File Converter" },
    { id: "productivity", label: "Productivity" },
    { id: "education", label: "Education" },
    { id: "other", label: "Other" },
  ];

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (q) params.append("q", q);
        if (category) params.append("category", category);
        params.append("page", page.toString());
        params.append("sortBy", sortBy);
        params.append("limit", "12");

        const res = await fetchApi(`/search?${params.toString()}`);
        if (res.success) {
          setTools(res.data.tools);
          setPagination(res.data.pagination);
          setIntentMatched(res.data.intentMatched);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [q, category, page, sortBy]);

  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (highlight) {
      setHighlightedToolId(highlight);
      
      // Automatic cleanup after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedToolId(null);
        // Clean the URL param without full reload
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("highlight");
        router.replace(`/search?${newParams.toString()}`, { scroll: false });
      }, 3000);

      // Scroll to element after a short delay to ensure rendering
      setTimeout(() => {
        const el = document.getElementById(`tool-${highlight}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== "page") {
      newParams.set("page", "1");
    }
    setFiltersOpen(false); // Close filters after selection on mobile
    router.push(`/search?${newParams.toString()}`);
  };

  const handleUpvote = async (toolId: string) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (upvotingIds.has(toolId)) return;
    try {
      setUpvotingIds(prev => new Set(prev).add(toolId));
      const res = await fetchApi(`/tools/${toolId}/upvote`, { method: "POST" });
      if (res.success) {
        setTools(prev => prev.map(t =>
          t._id === toolId ? {
            ...t,
            upvoteCount: res.data.upvoteCount,
            hasUpvoted: res.data.upvoted
          } : t
        ));
      }
    } catch (error) {
      console.error("Upvote failed:", error);
    } finally {
      setUpvotingIds(prev => {
        const next = new Set(prev);
        next.delete(toolId);
        return next;
      });
    }
  };

  return (
    <div className="w-full px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Premium Sidebar Filters */}
        <aside className={cn(
          "w-full lg:w-72 space-y-8",
          filtersOpen ? "block" : "hidden lg:block", 
          filtersOpen && "lg:hidden mb-8"
        )}>
          <div className={cn("glass p-8 rounded-[32px]", !filtersOpen && "lg:sticky lg:top-24")}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <Filter size={14} /> Filter Results
              </h3>
              {filtersOpen && (
                <button onClick={() => setFiltersOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-sm font-bold block mb-4 text-foreground/80 flex items-center gap-2">
                  <Search size={14} className="text-primary" /> Search
                </label>
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search tools..."
                    value={q}
                    onChange={(e) => handleFilterChange("q", e.target.value)}
                    className="w-full bg-background/50 border border-border/40 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all placeholder:font-medium placeholder:text-muted-foreground/50"
                  />
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold block mb-4 text-foreground/80 flex items-center gap-2">
                  <LayoutGrid size={14} className="text-primary" /> Category
                </label>
                <div className="flex flex-col gap-1">
                  {categories.map((cat) => {
                    const categoryStyles: Record<string, { active: string, inactiveBullet: string, hoverBullet: string }> = {
                      "pdf-converter": { active: "bg-cat-pdf text-primary-foreground shadow-lg shadow-cat-pdf/30", inactiveBullet: "bg-cat-pdf/40", hoverBullet: "group-hover/cat:bg-cat-pdf" },
                      "ppt-maker": { active: "bg-cat-presentation text-primary-foreground shadow-lg shadow-cat-presentation/30", inactiveBullet: "bg-cat-presentation/40", hoverBullet: "group-hover/cat:bg-cat-presentation" },
                      "api": { active: "bg-cat-api text-primary-foreground shadow-lg shadow-cat-api/30", inactiveBullet: "bg-cat-api/40", hoverBullet: "group-hover/cat:bg-cat-api" },
                      "file-converter": { active: "bg-cat-file-converter text-primary-foreground shadow-lg shadow-cat-file-converter/30", inactiveBullet: "bg-cat-file-converter/40", hoverBullet: "group-hover/cat:bg-cat-file-converter" },
                      "productivity": { active: "bg-cat-productivity text-primary-foreground shadow-lg shadow-cat-productivity/30", inactiveBullet: "bg-cat-productivity/40", hoverBullet: "group-hover/cat:bg-cat-productivity" },
                      "education": { active: "bg-cat-education text-primary-foreground shadow-lg shadow-cat-education/30", inactiveBullet: "bg-cat-education/40", hoverBullet: "group-hover/cat:bg-cat-education" },
                      "ai": { active: "bg-cat-ai text-primary-foreground shadow-lg shadow-cat-ai/30", inactiveBullet: "bg-cat-ai/40", hoverBullet: "group-hover/cat:bg-cat-ai" },
                    };

                    const style = categoryStyles[cat.id.toLowerCase()] || { active: "bg-primary text-primary-foreground shadow-lg shadow-primary/30", inactiveBullet: "bg-primary/40", hoverBullet: "group-hover/cat:bg-primary" };
                    const isActive = category === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleFilterChange("category", cat.id)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 group/cat",
                          isActive
                            ? style.active
                            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          isActive ? "bg-primary-foreground scale-125 shadow-[0_0_8px_hsl(var(--primary-foreground))]" : cn(style.inactiveBullet, "group-hover/cat:scale-125 shadow-sm", style.hoverBullet)
                        )} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold block mb-4 text-foreground/80 flex items-center gap-2">
                  <ListFilter size={14} className="text-primary" /> Sort By
                </label>
                <div className="relative group/sort">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full flex items-center justify-between bg-card border border-border/40 hover:border-primary/40 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-foreground shadow-sm"
                  >
                    <span>{sortOptions.find(opt => opt.id === sortBy)?.label || "Most Relevant"}</span>
                    <ChevronDown size={16} className={cn("text-muted-foreground transition-transform duration-300", isSortOpen && "rotate-180 text-primary")} />
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, rotateX: -10 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, y: -10, rotateX: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 py-2 glass bg-background/[0.98] dark:bg-background/[0.98] rounded-xl border border-primary/20 shadow-xl origin-top backdrop-blur-md"
                      >
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              handleFilterChange("sortBy", opt.id);
                              setIsSortOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 text-sm font-bold transition-colors flex items-center justify-between",
                              sortBy === opt.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                            )}
                          >
                            {opt.label}
                            {sortBy === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Results Area */}
        <main className="flex-1">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl sm:text-4xl font-black tracking-tight text-foreground"
              >
                {isLoading ? "Searching Tools..." : q ? `Results for "${q}"` : "All Tools"}
              </motion.h2>
              {category && (
                <p className="text-primary font-bold mt-2 uppercase tracking-widest text-xs">
                  Category: {category.replace('-', ' ')}
                </p>
              )}
            </div>
            {!isLoading && pagination && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFiltersOpen(!filtersOpen)} 
                  className="lg:hidden flex items-center justify-center min-w-[40px] min-h-[40px] px-3 py-2 glass border border-primary/20 rounded-full text-xs font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Filter size={16} className="mr-2" /> Filters
                </button>
                <div className="bg-primary/5 px-4 py-2.5 rounded-full border border-primary/10">
                  <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-wider">
                    {pagination.totalItems} Discoveries
                  </p>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 gap-8"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 rounded-[32px] border border-border/40 animate-pulse bg-muted/20" />
                ))}
              </motion.div>
            ) : !isAuthenticated ? (
              <motion.div
                key="auth-required"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 text-center glass-adaptive rounded-[40px] flex flex-col items-center justify-center space-y-8 px-8"
              >
                <div className="bg-primary/20 w-24 h-24 rounded-[32px] flex items-center justify-center text-primary shadow-2xl">
                  <User className="w-12 h-12" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-3xl font-black text-foreground mb-4">Member Access Only</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Personalized search and full tool access are reserved for our community. Join thousands of students today.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/login" className="bg-primary text-primary-foreground font-black px-10 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="bg-foreground text-background font-black px-10 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl">
                    Create Account
                  </Link>
                </div>
              </motion.div>
            ) : tools.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                {/* Milestone 9: Smart Match Banner */}
                {intentMatched && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 glass rounded-[32px] border-primary/20 bg-primary/5 flex items-center gap-8 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={120} className="text-primary" />
                    </div>

                    <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                      <Sparkles size={32} className="animate-pulse" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">AI Smart Match</span>
                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 capitalize">{intentMatched} Intent</span>
                      </div>
                      <h4 className="text-2xl font-black tracking-tight text-foreground">
                        Looking for {intentMatched === 'writing' ? 'academic writing' :
                          intentMatched === 'presentation' ? 'slide deck' :
                            intentMatched === 'file' ? 'document' :
                              intentMatched === 'math' ? 'problem solving' : 'specialized'} tools?
                      </h4>
                      <p className="text-sm font-medium text-muted-foreground/80 mt-1">
                        Our semantic engine has prioritized verified resources matching your task.
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="grid sm:grid-cols-2 gap-8">
                  {tools.map((tool, idx) => (
                    <motion.div
                      key={tool._id}
                      id={`tool-${tool._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ToolCard
                        tool={tool}
                        onUpvote={handleUpvote}
                        isUpvoting={upvotingIds.has(tool._id)}
                        isHighlighted={highlightedToolId === tool._id}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Premium Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => handleFilterChange("page", (page - 1).toString())}
                      disabled={!pagination.hasPrev}
                      className="p-3 glass rounded-2xl disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-all text-foreground shadow-lg active:scale-95"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="glass px-6 py-3 rounded-2xl font-black text-sm tracking-widest text-primary">
                      {pagination.page} / {pagination.totalPages}
                    </div>
                    <button
                      onClick={() => handleFilterChange("page", (page + 1).toString())}
                      disabled={!pagination.hasNext}
                      className="p-3 glass rounded-2xl disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-all text-foreground shadow-lg active:scale-95"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-32 glass rounded-[40px] border-2 border-dashed border-primary/20"
              >
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                  <Search size={32} />
                </div>
                <h3 className="text-2xl font-black mb-3">No tools found</h3>
                <p className="text-muted-foreground font-medium mb-8 max-w-sm mx-auto">Try adjusting your filters or searching for more general terms like &quot;PDF&quot; or &quot;Design&quot;.</p>
                <button
                  onClick={() => router.push("/search")}
                  className="bg-primary/10 text-primary px-8 py-4 rounded-2xl font-black hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
