"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  action?: () => void
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(pathname)

  useEffect(() => {
    setActiveTab(pathname)
  }, [pathname])

  return (
    <div
      className={cn(
        "fixed bottom-6 sm:bottom-auto sm:top-0 left-1/2 -translate-x-1/2 z-50 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-black/10 dark:bg-card/20 border border-white/10 backdrop-blur-[60px] p-1.5 rounded-full shadow-2xl">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url || (pathname === "/" && item.url === "/")
          const hasAction = !!item.action

          const commonClasses = cn(
            "relative cursor-pointer text-[13px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full transition-all duration-300",
            "text-foreground/50 hover:text-foreground",
            isActive && "text-foreground",
          )

          const content = (
            <>
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-brand-violet/10 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyber-pulse rounded-t-full">
                    <div className="absolute w-12 h-6 bg-brand-violet/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-brand-cyan/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-brand-indigo/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </>
          )

          if (hasAction) {
            return (
              <button
                key={item.name}
                onClick={() => {
                  item.action?.()
                  setActiveTab(item.name)
                }}
                className={commonClasses}
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={commonClasses}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
