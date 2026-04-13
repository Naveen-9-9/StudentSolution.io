import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import GlobalNavbar from "@/components/Navbar";
import BackgroundMesh from "@/components/BackgroundMesh";
import { cn } from "@/lib/utils";
import RouteTransition from "@/components/RouteTransition";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "StudentSolution.ai | Discover the Best Tools for Students",
  description: "A community-driven platform where students discover, share, and discuss the best tools for solving common problems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        geistSans.variable,
        geistMono.variable,
        outfit.variable,
        "h-full antialiased scroll-smooth"
      )}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col font-sans relative transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {/* overflow-x-hidden on a wrapper div, NOT body — body overflow breaks position:fixed modals */}
            <div className="flex flex-col min-h-full overflow-x-hidden">
            <BackgroundMesh />
            <GlobalNavbar />
            <main className="flex-1 pt-12 sm:pt-20 min-h-screen">
               <RouteTransition>
                {children}
               </RouteTransition>
            </main>
            
            {/* Simple Premium Footer */}
            <footer className="border-t bg-card/10 backdrop-blur-md py-12 mt-20">
              <div className="w-full px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-xl font-black tracking-tight text-foreground font-display uppercase">
                    StudentSolution<span className="text-cyber-gradient">.ai</span>
                  </span>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                    Built for students, by students.
                  </p>
                </div>
                <div className="flex gap-8 text-sm font-bold text-muted-foreground">
                  <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms</a>
                  <a href="https://github.com/nbunn" className="hover:text-primary transition-colors">GitHub</a>
                </div>
                <div className="text-xs font-bold text-muted-foreground/50">
                  © 2026 StudentSolution.ai. All rights reserved.
                </div>
              </div>
            </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
