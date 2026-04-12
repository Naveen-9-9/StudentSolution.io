"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { 
  User, 
  Settings as SettingsIcon, 
  Palette, 
  ShieldCheck, 
  Trash2, 
  Github, 
  Linkedin, 
  Twitter, 
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  Laptop,
  Paintbrush
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Tab = "profile" | "appearance" | "security";

const AVATARS = [
  { id: "default-1", icon: User },
  { id: "default-2", icon: ShieldCheck },
  { id: "default-3", icon: Palette },
  { id: "default-4", icon: Globe },
  { id: "default-5", icon: Github },
  { id: "default-6", icon: Linkedin },
  { id: "default-7", icon: Twitter },
  { id: "default-8", icon: SettingsIcon },
];

const ACCENTS = [
  { id: "violet", label: "Violet Pulse", color: "bg-[#8b5cf6]" },
  { id: "emerald", label: "Emerald Pulse", color: "bg-[#10b981]" },
  { id: "ruby", label: "Ruby Pulse", color: "bg-[#e11d48]" },
  { id: "amber", label: "Amber Pulse", color: "bg-[#f59e0b]" },
];

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth();
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    socialLinks: {
      github: user?.socialLinks?.github || "",
      linkedin: user?.socialLinks?.linkedin || "",
      twitter: user?.socialLinks?.twitter || "",
    },
    avatarId: user?.avatarId || "default-1",
    themePreference: user?.themePreference || "system"
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        socialLinks: {
          github: user.socialLinks?.github || "",
          linkedin: user.socialLinks?.linkedin || "",
          twitter: user.socialLinks?.twitter || "",
        },
        avatarId: user.avatarId || "default-1",
        themePreference: user.themePreference || "system"
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const success = await updateProfile(profileData);

      if (success) {
        setMessage({ type: "success", text: "Identity updated successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network interference detected." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetchApi("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (res.success) {
        setMessage({ type: "success", text: "Security credentials updated." });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: res.message || "Password change failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Secure channel failure." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    // Current theme format: "mode-accent" or just "mode"
    const currentFull = profileData.themePreference;
    const [currentMode, currentAccent] = currentFull.split("-");

    let finalTheme = newTheme;

    // If newTheme is just a mode (light, dark, system)
    if (["light", "dark", "system"].includes(newTheme)) {
      finalTheme = currentAccent ? `${newTheme}-${currentAccent}` : newTheme;
    } 
    // If newTheme is an accent change (from ACCENTS buttons)
    else if (newTheme.includes("-")) {
      // In settings, accent buttons might pass "mode-accent" or just "accent"
      // Looking at the JSX: handleThemeChange(`${theme}-${accent.id}`)
      // So newTheme is already mode-accent. We use it directly.
      finalTheme = newTheme;
    } else {
      // Just an accent name
      finalTheme = `${currentMode || "system"}-${newTheme}`;
    }

    // Update form state
    setProfileData(prev => ({ ...prev, themePreference: finalTheme }));

    // Apply immediate UI feedback
    const [mode, accent] = finalTheme.split("-");
    if (mode) setTheme(mode);
    
    const body = document.body;
    body.classList.remove("theme-violet", "theme-emerald", "theme-ruby", "theme-amber");
    if (accent) {
      body.classList.add(`theme-${accent}`);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 pb-32">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter">Settings</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              Configure your digital identity and hub preferences.
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            {(["profile", "appearance", "security"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab 
                    ? "bg-primary text-secondary shadow-lg shadow-primary/20" 
                    : "glass text-foreground/60 hover:text-foreground hover:bg-white/10"
                )}
              >
                {tab === "profile" && <User size={16} />}
                {tab === "appearance" && <Palette size={16} />}
                {tab === "security" && <ShieldCheck size={16} />}
                {tab}
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-primary/10">
             <div className="glass p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 -z-10 group-hover:scale-110 transition-transform duration-700" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">System Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-muted-foreground">Encryption Active</span>
                </div>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleUpdateProfile} className="space-y-10">
                   <div className="space-y-6">
                      <h2 className="text-3xl font-black tracking-tight">Identity Profile</h2>
                      <div className="grid gap-8 p-8 glass rounded-[40px] border-primary/10">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Name</label>
                            <input 
                              type="text" 
                              value={profileData.name}
                              onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-white/5 border border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                              placeholder="Enter your name"
                            />
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bio / Slogan</label>
                            <textarea 
                              value={profileData.bio}
                              onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                              className="w-full bg-white/5 border border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
                              placeholder="Tell the community who you are..."
                            />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h2 className="text-3xl font-black tracking-tight">Social Integrations</h2>
                      <div className="grid sm:grid-cols-3 gap-6">
                         {[
                           { id: "github", label: "GitHub", icon: Github },
                           { id: "linkedin", label: "LinkedIn", icon: Linkedin },
                           { id: "twitter", label: "Twitter / X", icon: Twitter }
                         ].map(social => (
                           <div key={social.id} className="space-y-3">
                              <div className="flex items-center gap-2 ml-1 text-muted-foreground">
                                 <social.icon size={14} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">{social.label}</span>
                              </div>
                              <input 
                                type="text"
                                value={profileData.socialLinks[social.id as keyof typeof profileData.socialLinks]}
                                onChange={e => setProfileData(prev => ({ 
                                  ...prev, 
                                  socialLinks: { ...prev.socialLinks, [social.id]: e.target.value } 
                                }))}
                                className="w-full bg-white/5 border border-primary/20 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                                placeholder={`@handle or URL`}
                              />
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                      {message && (
                        <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", message.type === "success" ? "text-emerald-500" : "text-destructive")}>
                          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {message.text}
                        </div>
                      )}
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="ml-auto flex items-center gap-3 px-10 py-5 bg-primary text-secondary rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 shadow-2xl shadow-primary/30"
                      >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        Flash Update
                      </button>
                   </div>
                </form>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className="space-y-12">
                   <div className="space-y-8">
                      <h2 className="text-3xl font-black tracking-tight">Theme Matrix</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         {[
                           { id: "light", icon: Sun, label: "Technical White" },
                           { id: "dark", icon: Moon, label: "Moody Obsidian" },
                           { id: "system", icon: Laptop, label: "Quantum Sync" }
                         ].map((t) => (
                           <button
                             key={t.id}
                             onClick={() => handleThemeChange(t.id)}
                             className={cn(
                               "relative overflow-hidden p-8 rounded-[40px] glass border transition-all group",
                               (theme === t.id || (t.id === "system" && !theme)) ? "border-primary bg-primary/5" : "border-primary/10 hover:border-primary/30"
                             )}
                           >
                             <div className="flex flex-col items-center gap-4 relative z-10">
                                <t.icon size={32} className={cn("transition-transform group-hover:scale-110", (theme === t.id) ? "text-primary" : "text-muted-foreground/60")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                             </div>
                             {(theme === t.id) && <motion.div layoutId="theme-active" className="absolute right-4 top-4 text-primary"><CheckCircle2 size={16} /></motion.div>}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-8">
                      <h2 className="text-3xl font-black tracking-tight">Accent Pulse</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                         {ACCENTS.map((accent) => (
                           <button
                             key={accent.id}
                             onClick={() => handleThemeChange(`${theme}-${accent.id}`)}
                             className={cn(
                               "p-6 rounded-3xl glass border transition-all flex flex-col items-center gap-4 group",
                               document.body.classList.contains(`theme-${accent.id}`) ? "border-primary" : "border-primary/10 hover:border-primary/30"
                             )}
                           >
                             <div className={cn("w-12 h-12 rounded-2xl shadow-xl transition-transform group-hover:scale-110", accent.color)} />
                             <span className="text-[9px] font-black uppercase tracking-widest">{accent.label}</span>
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-8">
                      <h2 className="text-3xl font-black tracking-tight">Identity Icon</h2>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                         {AVATARS.map((avatar) => (
                           <button
                             key={avatar.id}
                             onClick={() => setProfileData(prev => ({ ...prev, avatarId: avatar.id }))}
                             className={cn(
                               "w-full aspect-square rounded-2xl glass border flex items-center justify-center transition-all group",
                               profileData.avatarId === avatar.id ? "border-primary bg-primary/10" : "border-primary/5 hover:border-primary/20"
                             )}
                           >
                             <avatar.icon size={20} className={cn(profileData.avatarId === avatar.id ? "text-primary" : "text-muted-foreground/40")} />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="pt-6 border-t border-primary/10 flex justify-end">
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                        className="flex items-center gap-3 px-10 py-5 bg-primary text-secondary rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl shadow-primary/30"
                      >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        Apply Identity
                      </button>
                   </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-12">
                   <form onSubmit={handleChangePassword} className="space-y-8">
                      <h2 className="text-3xl font-black tracking-tight">Secure Channel</h2>
                      <div className="glass p-10 rounded-[48px] border-primary/10 space-y-6">
                         <div className="grid sm:grid-cols-3 gap-6">
                            {[
                              { id: "oldPassword", label: "Current Password", placeholder: "••••••••" },
                              { id: "newPassword", label: "New Credentials", placeholder: "••••••••" },
                              { id: "confirmPassword", label: "Confirm New", placeholder: "••••••••" }
                            ].map((f) => (
                              <div key={f.id} className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{f.label}</label>
                                 <input 
                                   type="password"
                                   value={passwordData[f.id as keyof typeof passwordData]}
                                   onChange={e => setPasswordData(prev => ({ ...prev, [f.id]: e.target.value }))}
                                   className="w-full bg-white/5 border border-primary/20 rounded-xl px-4 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                                   placeholder={f.placeholder}
                                 />
                              </div>
                            ))}
                         </div>
                         <div className="flex justify-end pt-4">
                            <button 
                              type="submit"
                              className="px-8 py-4 bg-white/5 border border-primary/30 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all"
                            >
                              Update Security
                            </button>
                         </div>
                      </div>
                   </form>

                   <div className="space-y-6">
                      <div className="flex items-center gap-3 text-destructive">
                         <Trash2 size={24} />
                         <h2 className="text-3xl font-black tracking-tight">Danger Zone</h2>
                      </div>
                      <div className="glass p-10 rounded-[48px] border-destructive/20 bg-destructive/5 space-y-6">
                         <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">
                           Deleting your account will permanently remove your contribution record, saved tools, and reputation points. This action is **irreversible**.
                         </p>
                         <button className="px-8 py-4 bg-destructive text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive/90 transition-all shadow-xl shadow-destructive/20">
                           Initialize Account Purge
                         </button>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
