"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function BackgroundMesh() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // High-performance motion values (avoids React re-renders on mouse move)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for buttery tracking without lag
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30, mass: 0.5 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Initialize to screen center
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  if (!mounted) {
    return <div className="fixed inset-0 -z-50 bg-background pointer-events-none" />;
  }

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background transition-colors duration-700">
      
      {/* Primary Light Tracking Outline */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-[100px] md:blur-[140px] transition-opacity duration-700 will-change-transform"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: 'var(--pulse-1)',
          opacity: isDark ? 0.35 : 0.15,
        }}
      />

      {/* Secondary Light Tracking - Offset for dynamic depth */}
      <motion.div
        className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] transition-opacity duration-700 will-change-transform"
        style={{
          x: springX,
          y: springY,
          translateX: "-20%",
          translateY: "-20%",
          backgroundColor: 'var(--pulse-2)',
          opacity: isDark ? 0.25 : 0.1,
        }}
      />

      {/* Fixed Ambient Glow (ensures the screen isn't completely black when mouse is away) */}
      <motion.div 
        animate={{ 
          opacity: isDark ? [0.1, 0.15, 0.1] : [0.05, 0.08, 0.05],
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[150px]"
        style={{ backgroundColor: 'var(--pulse-1)' }}
      />

      {/* Global Noise Overlay (Performance friendly 3% opacity) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
    </div>
  );
}
