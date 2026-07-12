'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  TrendingUp,
  DollarSign,
  Truck,
  Users,
  Route,
  Activity,
  Calendar,
  AlertTriangle,
  Plus,
  Wrench,
  Fuel
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import Link from 'next/link'

interface Metrics {
  activeVehicles: number
  maintenanceVehicles: number
  availableDrivers: number
  activeTrips: number
  totalTrips: number
  totalExpense: number
  avgFuelEfficiency: number
}

interface ChartData {
  expensePieData: Array<{ name: string; value: number }>
  modelBarData: Array<{ model: string; efficiency: number }>
  trendData: Array<{ date: string; amount: number }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [charts, setCharts] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to load metrics')
      const data = await res.json()
      setMetrics(data.metrics)
      setCharts(data.charts)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4']

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-zinc-450 text-sm font-medium">Aggregating operational statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 max-w-lg mx-auto mt-12 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="font-bold text-rose-300">Operational Aggregation Error</h3>
        <p className="text-sm text-rose-400 mt-1">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all"
        >
          Retry Load
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Operations Console
          </h1>
          <p className="text-zinc-450 text-sm mt-1">
            Real-time telemetry and dispatch status for {user?.name || 'Operator'} ({user?.role})
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-zinc-900/60 border border-zinc-800 px-4 py-2.5 rounded-xl text-zinc-400 font-medium">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Card 1 */}
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Total Costs</span>
              <span className="text-2xl font-black text-white">${metrics.totalExpense.toLocaleString()}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Active Fleet</span>
              <span className="text-2xl font-black text-white">{metrics.activeVehicles} <span className="text-xs text-zinc-500 font-medium">/ {metrics.activeVehicles + metrics.maintenanceVehicles}</span></span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-sky-500/5 rounded-full blur-xl" />
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Active Drivers</span>
              <span className="text-2xl font-black text-white">{metrics.availableDrivers} <span className="text-xs text-zinc-500 font-medium">avail.</span></span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-violet-500/5 rounded-full blur-xl" />
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Dispatched</span>
              <span className="text-2xl font-black text-white">{metrics.activeTrips} <span className="text-xs text-zinc-500 font-medium">active</span></span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Route className="w-5 h-5 text-violet-400" />
            </div>
          </div>

          {/* Card 5 */}
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Avg Fuel Econ</span>
              <span className="text-2xl font-black text-white">{metrics.avgFuelEfficiency.toFixed(1)} <span className="text-xs text-zinc-500 font-medium">km/L</span></span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Row */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Area Chart (Span 2) */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Operational Expense Trend (Last 30 Days)</h2>
              </div>
              <p className="text-zinc-500 text-xs mb-6">Aggregated fuel costs, maintenance invoices, and driver expenses.</p>
            </div>
            <div className="w-full h-[260px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#52525b" strokeWidth={1} tickLine={false} />
                  <YAxis stroke="#52525b" strokeWidth={1} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Pie Chart */}
          <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Expense Distribution</h2>
              </div>
              <p className="text-zinc-500 text-xs mb-6">Operating expenses broken down by category.</p>
            </div>
            <div className="h-[200px] relative flex items-center justify-center text-xs">
              {charts.expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {charts.expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-zinc-550 italic">No logged expenses.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-850/60 text-[10px]">
              {charts.expensePieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-1.5 text-zinc-450 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate">{entry.name}:</span>
                  <span className="font-bold text-zinc-300 ml-auto">${entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Secondary Dashboard Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Economy Bar Chart */}
        {charts && charts.modelBarData.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">Fuel Economy by Vehicle Model</h2>
            </div>
            <p className="text-zinc-500 text-xs mb-6">Average fuel economy in km/L computed from completed trip mileage.</p>
            <div className="w-full h-[220px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.modelBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="model" stroke="#52525b" tickLine={false} />
                  <YAxis stroke="#52525b" tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="efficiency" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {charts.modelBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Dispatch Panel */}
        <div className={`glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between ${!charts?.modelBarData.length ? 'lg:col-span-3' : ''}`}>
          <div>
            <h2 className="text-base font-bold text-white mb-2">Quick Actions</h2>
            <p className="text-zinc-500 text-xs mb-6">Instantly dispatch vehicles or record operational costs.</p>
          </div>
          <div className="space-y-3">
            <Link
              href="/trips"
              className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 group transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Route className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-zinc-200">Dispatch Trip</span>
                  <span className="block text-[10px] text-zinc-550">Assign drivers & route vehicles</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-zinc-550 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/maintenance"
              className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 group transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-zinc-200">Schedule Service</span>
                  <span className="block text-[10px] text-zinc-550">Book vehicle inspection & repairs</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-zinc-550 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/fuel-expenses"
              className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 group transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Fuel className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-zinc-200">Log Fuel Fill-up</span>
                  <span className="block text-[10px] text-zinc-550">Record liters, odometer & costs</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-zinc-550 group-hover:text-white transition-colors" />
            </Link>
          </div>
          <div className="mt-6 text-center text-[10px] text-zinc-550 font-medium">
            System uptime 100% • Next backup scheduled tonight
          </div>
        </div>
      </div>
    </div>
  )
}
