'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  IndianRupeeIcon,
  FileBarChart,
  LogOut,
  User as UserIcon
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Drivers', href: '/drivers', icon: Users },
    { name: 'Trips', href: '/trips', icon: Route },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Fuel & Expenses', href: '/fuel-expenses', icon: IndianRupeeIcon },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
  ]

  return (
    <aside className="w-20 shrink-0 h-screen relative z-30 group/sidebar">
      <div className="w-20 hover:w-64 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 ease-in-out absolute left-0 top-0 bottom-0 z-50 glass-panel border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md flex flex-col justify-between overflow-hidden">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-zinc-850">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-md border border-zinc-800 bg-white group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Transitops Icon"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 max-w-0 group-hover/sidebar:max-w-40 overflow-hidden whitespace-nowrap">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  Transitops
                </span>
                <span className="block text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                  Fleet Management
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative active:scale-[0.98] glass-shine ${isActive
                    ? 'bg-gradient-to-r from-indigo-500/15 to-transparent text-indigo-400 font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                    }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`} />
                  <span className="text-sm transition-all duration-300 group-hover:translate-x-1 opacity-0 group-hover/sidebar:opacity-100 max-w-0 group-hover/sidebar:max-w-40 overflow-hidden whitespace-nowrap">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User profile / Footer */}
        {user && (
          <div className="p-4 border-t border-zinc-850 bg-zinc-900/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0">
                <UserIcon className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 max-w-0 group-hover/sidebar:max-w-40 overflow-hidden whitespace-nowrap">
                <p className="text-sm font-semibold text-zinc-200 truncate">
                  {user.name || 'Operator'}
                </p>
                <p className="text-xs text-zinc-500 truncate mb-1">
                  {user.email}
                </p>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${user.role === 'ADMIN'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-800/20 text-zinc-400 hover:text-rose-400 transition-all text-sm font-medium glass-shine"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 max-w-0 group-hover/sidebar:max-w-40 overflow-hidden whitespace-nowrap">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
