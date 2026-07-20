"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, LayoutDashboard, FilePlus, Search, Settings, LogOut, User, GraduationCap, Smartphone, Award, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Issue Credentials", href: "/issue", icon: FilePlus, adminOnly: true },
  { name: "Certificates", href: "/certificates", icon: Award, adminOnly: true },
  { name: "Verify", href: "/verify", icon: Search },
  { name: "Settings", href: "/settings", icon: Settings, adminOnly: true },
]

const studentNavItems = [
  { name: "My Credentials", href: "/student", icon: Award },
  { name: "Verify", href: "/verify", icon: Search },
  { name: "Wallet", href: "/wallet", icon: Smartphone },
]

export default function Sidebar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-slate-200"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: mobileOpen ? 0 : -256 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 z-50 h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm lg:translate-x-0 lg:static lg:z-auto lg:block lg:animate-none ${mobileOpen ? "w-64 block" : "-translate-x-full lg:translate-x-0 lg:w-64 xl:w-72 2xl:w-80 hidden lg:block"}`}
      >
      <div className="p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-lg tracking-tight text-slate-900">EduCerts<span className="text-sky-600">.io</span></h1>
            <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-semibold">OpenAttestation Proto</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1.5 sm:space-y-2">
        {user?.is_admin ? (
          // Admin Navigation
          navItems.map((item) => {
            if (item.adminOnly && !user?.is_admin) return null

            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-sky-50 text-sky-700 shadow-sm shadow-sky-500/5"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-sky-600" : "text-slate-400 group-hover:text-sky-500"}`} />
                <span className="font-medium text-sm sm:text-base">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500"
                  />
                )}
              </Link>
            )
          })
        ) : (
          // Student Navigation
          studentNavItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-sky-50 text-sky-700 shadow-sm shadow-sky-500/5"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-sky-600" : "text-slate-400 group-hover:text-sky-500"}`} />
                <span className="font-medium text-sm sm:text-base">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500"
                  />
                )}
              </Link>
            )
          })
        )}
      </nav>

      <div className="p-3 sm:p-4 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
              {user ? <User className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" /> : <div className="w-full h-full bg-sky-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold truncate text-slate-900">{user?.name || "Guest User"}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">{user?.email || "Connect your account"}</p>
            </div>
          </div>

          {user ? (
            <div className="space-y-1.5 sm:space-y-2">
              {!user.is_admin && (
                <Link
                  href="/wallet"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 transition-all text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-sky-600/20"
                >
                  <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Open Student Wallet
                </Link>
              )}
              <button
                onClick={() => { onLogout(); setMobileOpen(false) }}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 transition-all text-[10px] sm:text-xs font-semibold text-slate-400 border border-slate-700 hover:border-red-500/20"
              >
                <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 transition-all text-[10px] sm:text-xs font-semibold text-white">
              Login to EduCerts
            </Link>
          )}
        </div>
      </div>
    </motion.div>
    </>
  )
}
