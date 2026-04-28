"use client";

import { ReactLenis, useLenis } from 'lenis/react';
import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

function LenisUpdate() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      // Small delay to ensure DOM has updated
      const timer = setTimeout(() => {
        lenis.resize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, lenis]);

  return null;
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.1, 
        duration: 1.5, 
        smoothWheel: true,
        syncTouch: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      <LenisUpdate />
      {children}
    </ReactLenis>
  );
}
