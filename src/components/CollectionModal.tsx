"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Bookmark,
  FolderLock,
  Globe,
  Check,
  Loader2,
  Sparkles,
  LogIn
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { Tool } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Collection {
  _id: string;
  name: string;
  tools: string[];
  isPublic: boolean;
}

interface CollectionModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
}

export default function CollectionModal({ tool, isOpen, onClose }: CollectionModalProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // SSR safety — portal requires document
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll + fetch
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (isAuthenticated) {
        fetchCollections();
        setError(null);
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, isAuthenticated]);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchApi("/collections/me");
      if (res.success) {
        setCollections(res.data.collections);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to fetch collections";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (collectionId: string) => {
    const collection = collections.find(c => c._id === collectionId);
    if (!collection) return;

    const wasInCollection = collection.tools.includes(tool._id);
    const optimisticTools = wasInCollection
      ? collection.tools.filter(id => id !== tool._id)
      : [...collection.tools, tool._id];

    setCollections(prev => prev.map(c =>
      c._id === collectionId ? { ...c, tools: optimisticTools } : c
    ));

    try {
      setProcessingId(collectionId);
      const res = await fetchApi(`/collections/${collectionId}/tools/${tool._id}`, {
        method: "POST"
      });
      if (res.success) {
        setCollections(prev => prev.map(c =>
          c._id === collectionId ? res.data.collection : c
        ));
      }
    } catch {
      // Revert on failure
      setCollections(prev => prev.map(c =>
        c._id === collectionId ? { ...c, tools: collection.tools } : c
      ));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim() || isCreating) return;
    try {
      setIsCreating(true);
      setError(null);
      const res = await fetchApi("/collections", {
        method: "POST",
        body: JSON.stringify({ name: newCollectionName })
      });
      if (res.success) {
        setCollections(prev => [res.data.collection, ...prev]);
        setNewCollectionName("");
        await handleToggle(res.data.collection._id);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] cursor-pointer"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-lg glass rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-[90vh] pointer-events-auto"
            >
              {/* Header */}
              <div className="p-10 border-b border-primary/10 relative flex-shrink-0">
                <div className="absolute top-8 right-8">
                  <button
                    onClick={onClose}
                    className="p-3 text-muted-foreground hover:text-white transition-colors rounded-xl hover:bg-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-primary mb-6">
                  <Sparkles size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Curation Core v1.0</span>
                </div>

                <h2 className="text-4xl font-black tracking-tight leading-tight">
                  Save to toolkit
                </h2>
                <div className="flex items-center gap-2 mt-4 text-muted-foreground/60">
                  <Bookmark size={14} className="text-primary" />
                  <span className="text-sm font-bold truncate max-w-[280px]">Organizing &quot;{tool.name}&quot;</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto no-scrollbar flex-1 min-h-0">
                {/* NOT AUTHENTICATED STATE */}
                {!isAuthenticated ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-6 text-center">
                    <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center">
                      <LogIn size={32} className="text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-black text-foreground">Login Required</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        Sign in to save tools to your personal toolkit collections.
                      </p>
                    </div>
                    <button
                      onClick={() => { onClose(); router.push("/auth/login"); }}
                      className="px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                    >
                      Sign In to Continue
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexing Personal Kits...</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {collections.length > 0 ? (
                      collections.map((collection) => {
                        const isInCollection = collection.tools.includes(tool._id);
                        const isProcessing = processingId === collection._id;

                        return (
                          <button
                            key={collection._id}
                            onClick={() => handleToggle(collection._id)}
                            disabled={isProcessing}
                            className={cn(
                              "flex items-center justify-between p-6 rounded-3xl transition-all border-2 group",
                              isInCollection
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-white/5 border-white/5 text-muted-foreground hover:border-primary/40 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              {collection.isPublic ? <Globe size={18} /> : <FolderLock size={18} />}
                              <div className="text-left">
                                <p className="text-sm font-black tracking-tight capitalize">{collection.name}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">{collection.tools.length} Tools Indexed</p>
                              </div>
                            </div>

                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                              isInCollection ? "bg-primary text-white" : "bg-white/5 group-hover:bg-primary/20"
                            )}>
                              {isProcessing ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : isInCollection ? (
                                <Check size={18} />
                              ) : (
                                <Plus size={18} />
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center space-y-4">
                        <FolderLock size={40} className="mx-auto text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground">Your collection library is empty.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer: Create New (only when authenticated) */}
              {isAuthenticated && (
                <div className="p-8 bg-black/20 border-t border-white/5 space-y-4 flex-shrink-0">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}
                  <form onSubmit={handleCreate} className="relative">
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Create New Toolkit..."
                      className="w-full bg-white/5 border-2 border-white/5 focus:border-primary/40 focus:bg-primary/5 rounded-2xl px-6 py-4 outline-none transition-all text-sm font-medium text-white placeholder:text-muted-foreground/40"
                    />
                    <button
                      type="submit"
                      disabled={!newCollectionName.trim() || isCreating}
                      className="absolute right-2 top-2 p-3 bg-primary text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:bg-muted-foreground/20"
                    >
                      {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
