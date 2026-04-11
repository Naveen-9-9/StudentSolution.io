"use client";

import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={cn(outfit.className, "h-full")}>
      <body className="h-full bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 glass p-12 rounded-[48px] border-primary/20 bg-primary/5">
          <div className="w-20 h-20 bg-primary/20 rounded-[32px] flex items-center justify-center text-primary mx-auto animate-pulse">
            <span className="text-4xl font-black">!</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight text-white leading-none">Critical Error</h2>
            <p className="text-blue-100/60 font-medium leading-relaxed">
              A system-level error occurred during rendering. Our team has been notified.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <button
              onClick={() => reset()}
              className="w-full bg-primary text-white font-black px-10 py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-sm"
            >
              Attempt Recovery
            </button>
            <a 
              href="/"
              className="block w-full glass text-white/70 font-black px-10 py-5 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
            >
              Return Home
            </a>
          </div>

          {process.env.NODE_ENV !== "production" && (
            <div className="mt-8 p-4 bg-black/40 rounded-2xl text-left overflow-auto max-h-32">
              <p className="text-[10px] font-mono text-primary/70 mb-2 uppercase font-black">Debug Info</p>
              <pre className="text-[10px] font-mono text-muted-foreground break-all white-space-pre-wrap">
                {error.message}
              </pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
