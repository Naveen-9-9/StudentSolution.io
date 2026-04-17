"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Calendar, UserPlus, Trophy, Check, X, ShieldAlert } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { cn } from "@/lib/utils";

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upvotingId, setUpvotingId] = useState<string | null>(null);

  const handleUpvote = async (toolId: string) => {
    if (!isAuthenticated) return router.push("/auth/login");
    try {
      setUpvotingId(toolId);
      const res = await fetchApi(`/tools/${toolId}/upvote`, { method: "POST" });
      if (res.success) {
        setProfile((prev: any) => ({
          ...prev,
          tools: prev.tools.map((t: any) =>
            t._id === toolId ? { ...t, upvoteCount: res.data.upvoteCount, hasUpvoted: res.data.hasUpvoted } : t
          )
        }));
      }
    } catch (err) {
      console.error("Failed to upvote", err);
    } finally {
      setUpvotingId(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadProfile = async () => {
      try {
        const profileRes = await fetchApi(`/users/${id}/profile`);
        if (profileRes.success) {
          setProfile(profileRes.data.profile);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id, isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-[120px] pb-24 flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card border border-foreground/10 rounded-2xl max-w-sm">
           <ShieldAlert size={48} className="mx-auto mb-4 text-destructive" />
           <h2 className="text-2xl font-bold font-display mb-2">Login Required</h2>
           <p className="text-muted-foreground text-sm">You must be logged in to view community profiles.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-[120px] pb-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-[120px] pb-24 flex items-center justify-center text-muted-foreground">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[120px] pb-24 px-4 md:px-8 bg-[url('/mesh.svg')] bg-cover bg-fixed">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="bg-card backdrop-blur-3xl rounded-3xl p-8 md:p-12 border border-foreground/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-brand-pink/20 to-brand-cyan/20 blur-2xl -z-10" />
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
            <div className="w-32 h-32 rounded-full border-4 border-background bg-background shadow-xl overflow-hidden shrink-0">
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${profile.avatarId}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black font-display tracking-tight text-foreground">{profile.name}</h1>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto md:mx-0">{profile.bio || "No bio provided."}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <Trophy size={16} className="text-primary" /> {profile.impactScore} Impact
                </span>
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <Calendar size={16} className="text-muted-foreground" /> Joined {new Date(profile.registeredAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Showcase */}
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground mb-6 flex items-center gap-2">
            Tools by {profile.name.split(' ')[0]}
            <span className="text-sm font-medium px-3 py-1 bg-foreground/5 rounded-full">{profile.totalTools}</span>
          </h2>

          {profile.tools && profile.tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.tools.map((tool: any) => (
                <div 
                  key={tool._id}
                  onClick={() => router.push(`/search?highlight=${tool._id}`)}
                  className="cursor-pointer"
                >
                  <ToolCard 
                    tool={tool} 
                    onUpvote={handleUpvote}
                    isUpvoting={upvotingId === tool._id}
                    variant="minimal"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-foreground/10 rounded-3xl bg-card/50">
              <p className="text-muted-foreground">This user hasn't submitted any tools yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
