'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
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
  Fuel,
  Map,
  X,
  Play,
  CheckCircle,
  Trash2,
  Edit,
  Phone,
  Mail,
  FileText,
  Clock,
  Gauge,
  Navigation,
  Search,
  ArrowRight,
  Info,
  ChevronRight,
  Tag
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
  Bar
} from 'recharts'

// Global styling constants
const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#6366f1']

// =================================================================
// 1. DASHBOARD VIEW
// =================================================================
interface DashboardMetrics {
  activeVehicles: number
  maintenanceVehicles: number
  availableDrivers: number
  activeTrips: number
  totalTrips: number
  totalExpense: number
  avgFuelEfficiency: number
}

interface DashboardChartData {
  expensePieData: Array<{ name: string; value: number }>
  modelBarData: Array<{ model: string; efficiency: number }>
  trendData: Array<{ date: string; amount: number }>
}

function DashboardView() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [charts, setCharts] = useState<DashboardChartData | null>(null)
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

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-zinc-450 text-xs">Aggregating telemetry statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 max-w-lg mx-auto text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="font-bold text-rose-300">Operational Error</h3>
        <p className="text-xs text-rose-450 mt-1">{error}</p>
        <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold">Retry Load</button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Operations Console</h1>
          <p className="text-zinc-450 text-sm mt-1">Real-time telemetry and dispatch status for {user?.name || 'Operator'} ({user?.role})</p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-zinc-900/60 border border-zinc-800 px-4 py-2.5 rounded-xl text-zinc-400 font-medium">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-555 uppercase tracking-wider block">Total Costs</span>
              <span className="text-2xl font-black text-white">${metrics.totalExpense.toLocaleString()}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center"><DollarSign className="w-5 h-5 text-cyan-400" /></div>
          </div>
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-555 uppercase tracking-wider block">Active Fleet</span>
              <span className="text-2xl font-black text-white">{metrics.activeVehicles} <span className="text-xs text-zinc-500 font-medium">/ {metrics.activeVehicles + metrics.maintenanceVehicles}</span></span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Truck className="w-5 h-5 text-emerald-400" /></div>
          </div>
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-555 uppercase tracking-wider block">Active Drivers</span>
              <span className="text-2xl font-black text-white">{metrics.availableDrivers} <span className="text-xs text-zinc-500 font-medium">avail.</span></span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-sky-400" /></div>
          </div>
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-555 uppercase tracking-wider block">Dispatched</span>
              <span className="text-2xl font-black text-white">{metrics.activeTrips} <span className="text-xs text-zinc-500 font-medium">active</span></span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"><Route className="w-5 h-5 text-violet-400" /></div>
          </div>
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-555 uppercase tracking-wider block">Avg Fuel Econ</span>
              <span className="text-2xl font-black text-white">{metrics.avgFuelEfficiency.toFixed(1)} <span className="text-xs text-zinc-500 font-medium">km/L</span></span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Activity className="w-5 h-5 text-amber-400" /></div>
          </div>
        </div>
      )}

      {/* Main Charts Row */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Expense Trend (Last 30 Days)</h2>
              </div>
              <p className="text-zinc-500 text-xs mb-6">Aggregated fuel costs, maintenance, and logistics expenses.</p>
            </div>
            <div className="w-full h-[240px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#52525b" strokeWidth={1} tickLine={false} />
                  <YAxis stroke="#52525b" strokeWidth={1} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-450" />
                <h2 className="text-base font-bold text-white">Expense Distribution</h2>
              </div>
              <p className="text-zinc-500 text-xs mb-6">Operating expenses broken down by category.</p>
            </div>
            <div className="h-[180px] relative flex items-center justify-center text-xs">
              {charts.expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.expensePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                      {charts.expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-zinc-555 italic">No logged expenses.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-850/60 text-[10px]">
              {charts.expensePieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-1.5 text-zinc-450 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate">{entry.name}:</span>
                  <span className="font-bold text-zinc-350 ml-auto">${entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Telemetry Map Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Map className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Live Fleet Telemetry Map</h2>
              </div>
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Tracking</span>
              </span>
            </div>
            <p className="text-zinc-500 text-xs mb-6">Real-time status of active trips and routes across regional hubs.</p>
          </div>
          
          <div className="w-full h-[280px] bg-zinc-950/40 rounded-xl border border-zinc-850/60 overflow-hidden relative flex items-center justify-center p-4">
            <svg viewBox="0 0 800 400" className="w-full h-full text-zinc-650 opacity-90" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapGrid)" />
              <path d="M 250,50 L 550,50 L 570,120 L 700,200 L 730,300 L 600,380 L 520,380 L 400,320 L 300,340 L 220,220 L 150,230 L 140,160 L 250,160 Z" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 380,100 L 375,230" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" style={{ strokeDasharray: '6 6', animation: 'dashMove 1s linear infinite' }} />
              <path d="M 520,290 L 375,230" fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" />
              <path d="M 375,230 L 310,300" fill="none" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="1.5" strokeDasharray="5,5" style={{ strokeDasharray: '6 6', animation: 'dashMove 1.5s linear infinite' }} />

              <circle cx="380" cy="100" r="6" fill="#06b6d4" />
              <text x="392" y="104" fill="#e2f1f5" fontSize="10" className="font-extrabold select-none">Dallas Hub</text>

              <circle cx="375" cy="230" r="6" fill="#06b6d4" />
              <text x="387" y="234" fill="#e2f1f5" fontSize="10" className="font-extrabold select-none">Austin Station</text>

              <circle cx="520" cy="290" r="5" fill="#52525b" />
              <text x="532" y="294" fill="#94aeb5" fontSize="10" className="font-bold select-none">Houston Terminal</text>

              <circle cx="310" cy="300" r="5" fill="#52525b" />
              <text x="250" y="315" fill="#94aeb5" fontSize="10" className="font-bold select-none">San Antonio Depot</text>

              <g transform="translate(378, 150)">
                <circle cx="0" cy="0" r="5" fill="#10b981" />
                <circle cx="0" cy="0" r="9" fill="none" stroke="#10b981" strokeWidth="1" />
                <rect x="8" y="-12" width="65" height="18" rx="4" fill="rgba(7, 10, 15, 0.85)" stroke="rgba(165, 243, 252, 0.15)" strokeWidth="1" />
                <text x="12" y="0" fill="#10b981" fontSize="8" className="font-extrabold select-none">TX-101-BUS</text>
              </g>

              <g transform="translate(342, 265)">
                <circle cx="0" cy="0" r="4" fill="#06b6d4" />
                <rect x="8" y="-12" width="65" height="18" rx="4" fill="rgba(7, 10, 15, 0.85)" stroke="rgba(165, 243, 252, 0.15)" strokeWidth="1" />
                <text x="12" y="0" fill="#06b6d4" fontSize="8" className="font-extrabold select-none">TX-202-VAN</text>
              </g>
            </svg>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2">Live Operations Feed</h2>
            <p className="text-zinc-500 text-xs mb-6">Real-time alerts and telemetry reports from the road.</p>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-ping" />
              <div>
                <span className="block text-zinc-300 font-bold">Vehicle TX-101-BUS Dispatched</span>
                <span className="block text-zinc-550 text-[10px] mt-0.5">{"Dallas Hub -> Austin Station • 4 mins ago"}</span>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-cyan-450 mt-1.5 shrink-0" />
              <div>
                <span className="block text-zinc-300 font-bold">Driver Sarah Connor Available</span>
                <span className="block text-zinc-550 text-[10px] mt-0.5">Completed Delivery Loop A • 28 mins ago</span>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <span className="block text-zinc-300 font-bold">Maintenance In Progress</span>
                <span className="block text-zinc-550 text-[10px] mt-0.5">TX-303-TRK: Engine repair scheduled • 2 hours ago</span>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-555 shrink-0" />
              <div>
                <span className="block text-zinc-300 font-bold">Database Sync Complete</span>
                <span className="block text-zinc-550 text-[10px] mt-0.5">All 22 telemetry nodes active • 4 hours ago</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-850/60 flex items-center justify-between text-[10px] text-zinc-555">
            <span>Updates hourly</span>
            <span className="text-cyan-400 font-bold hover:underline cursor-pointer">View Archives</span>
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {charts && charts.modelBarData.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">Fuel Economy by Vehicle Model</h2>
            </div>
            <p className="text-zinc-500 text-xs mb-6">Average fuel economy in km/L computed from completed trip mileage.</p>
            <div className="w-full h-[200px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.modelBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="model" stroke="#52525b" tickLine={false} />
                  <YAxis stroke="#52525b" tickLine={false} />
                  <Tooltip contentStyle={{ background: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} />
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

        <div className={`glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between ${!charts?.modelBarData.length ? 'lg:col-span-3' : ''}`}>
          <div>
            <h2 className="text-base font-bold text-white mb-2">Quick Actions</h2>
            <p className="text-zinc-500 text-xs mb-6">Instantly dispatch vehicles or record operational costs.</p>
          </div>
          <div className="space-y-3">
            <Link href="/trips" className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 group transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Route className="w-4 h-4 text-cyan-400" /></div>
                <div>
                  <span className="block text-sm font-semibold text-zinc-200">Dispatch Trip</span>
                  <span className="block text-[10px] text-zinc-555">Assign drivers & route vehicles</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-zinc-555 group-hover:text-white transition-colors" />
            </Link>
            <Link href="/maintenance" className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 group transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center"><Wrench className="w-4 h-4 text-rose-400" /></div>
                <div>
                  <span className="block text-sm font-semibold text-zinc-200">Schedule Service</span>
                  <span className="block text-[10px] text-zinc-555">Book vehicle inspection & repairs</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-zinc-555 group-hover:text-white transition-colors" />
            </Link>
            <Link href="/fuel-expenses" className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 group transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><Fuel className="w-4 h-4 text-amber-400" /></div>
                <div>
                  <span className="block text-sm font-semibold text-zinc-200">Log Fuel Fill-up</span>
                  <span className="block text-[10px] text-zinc-555">Record liters, odometer & costs</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-zinc-555 group-hover:text-white transition-colors" />
            </Link>
          </div>
          <div className="mt-6 text-center text-[10px] text-zinc-555 font-medium">System uptime 100% • Network synchronized</div>
        </div>
      </div>
    </div>
  )
}

// =================================================================
// 2. VEHICLES VIEW
// =================================================================
interface Vehicle {
  id: string
  licensePlate: string
  make: string
  model: string
  year: number
  status: string
  type: string
  capacity: number
  fuelType: string
  odometer: number
}

interface MaintenanceRecord {
  id: string
  serviceType: string
  description: string
  cost: number
  startDate: string
  endDate: string | null
  status: string
}

interface VehicleDetail extends Vehicle {
  maintenanceLogs: MaintenanceRecord[]
  fuelLogs: any[]
}

function VehiclesView() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [vehicleDetail, setVehicleDetail] = useState<VehicleDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    type: 'VAN',
    capacity: '15',
    fuelType: 'DIESEL',
    status: 'ACTIVE',
    odometer: '0'
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    id: '',
    licensePlate: '',
    make: '',
    model: '',
    year: '',
    type: '',
    capacity: '',
    fuelType: '',
    status: '',
    odometer: ''
  })

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles')
      if (!res.ok) throw new Error('Failed to load vehicles')
      const data = await res.json()
      setVehicles(data.vehicles)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleDetail = async (id: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/vehicles/${id}`)
      if (!res.ok) throw new Error('Failed to load vehicle details')
      const data = await res.json()
      setVehicleDetail(data.vehicle)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    if (selectedVehicleId) {
      fetchVehicleDetail(selectedVehicleId)
    } else {
      setVehicleDetail(null)
    }
  }, [selectedVehicleId])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSubmitting(true)
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create vehicle')
      }
      await fetchVehicles()
      setIsCreateOpen(false)
      setFormData({
        licensePlate: '',
        make: '',
        model: '',
        year: '2026',
        type: 'VAN',
        capacity: '15',
        fuelType: 'DIESEL',
        status: 'ACTIVE',
        odometer: '0'
      })
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleEditOpen = (vehicle: Vehicle) => {
    setEditFormData({
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      type: vehicle.type,
      capacity: vehicle.capacity.toString(),
      fuelType: vehicle.fuelType,
      status: vehicle.status,
      odometer: vehicle.odometer.toString()
    })
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSubmitting(true)
    try {
      const res = await fetch(`/api/vehicles/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update vehicle')
      }
      await fetchVehicles()
      if (selectedVehicleId === editFormData.id) {
        await fetchVehicleDetail(editFormData.id)
      }
      setIsEditOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle? All related trip and fuel records will be deleted as well.')) return
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete vehicle')
      }
      setSelectedVehicleId(null)
      await fetchVehicles()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter
    const matchesType = typeFilter === 'ALL' || v.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
      case 'MAINTENANCE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default: return 'bg-rose-500/10 text-rose-450 border-rose-500/20'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Vehicle Fleet</h1>
          <p className="text-zinc-450 text-sm mt-1">Manage vehicles, monitor service status, and inspect odometers.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-550 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all self-start md:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 glass-panel rounded-2xl">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-550" />
          <input type="text" placeholder="Search make, model, license..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-cyan-500/60" />
        </div>
        <div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/60">
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
          </select>
        </div>
        <div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-4 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/60">
            <option value="ALL">All Vehicle Types</option>
            <option value="BUS">BUS</option>
            <option value="VAN">VAN</option>
            <option value="TRUCK">TRUCK</option>
            <option value="SEDAN">SEDAN</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center p-12 glass-panel rounded-2xl text-zinc-500 max-w-md mx-auto">
          <Truck className="w-12 h-12 mx-auto mb-4 text-zinc-650" />
          <p className="font-bold text-zinc-400">No Vehicles Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} onClick={() => setSelectedVehicleId(vehicle.id)} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between cursor-pointer border border-zinc-800/80 group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">{vehicle.type}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusColor(vehicle.status)}`}>{vehicle.status}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{vehicle.make} {vehicle.model}</h3>
                <span className="block text-zinc-500 text-xs mt-0.5">Plate: {vehicle.licensePlate} • Year: {vehicle.year}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-zinc-850/60 text-xs">
                <div className="flex items-center space-x-2 text-zinc-450"><Gauge className="w-4 h-4 text-cyan-500/80" /><span>{vehicle.odometer.toLocaleString()} km</span></div>
                <div className="flex items-center space-x-2 text-zinc-450"><Users className="w-4 h-4 text-cyan-500/80" /><span>Cap: {vehicle.capacity} kg</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedVehicleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-4xl rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{loadingDetail ? 'Loading details...' : `${vehicleDetail?.make} ${vehicleDetail?.model}`}</h2>
                {!loadingDetail && vehicleDetail && (
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">Plate: {vehicleDetail.licensePlate} • Year: {vehicleDetail.year} • Fuel: {vehicleDetail.fuelType}</p>
                )}
              </div>
              <button onClick={() => setSelectedVehicleId(null)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            {!loadingDetail && vehicleDetail && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Type</span>
                    <span className="block text-lg font-bold text-white mt-1">{vehicleDetail.type}</span>
                  </div>
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Odometer</span>
                    <span className="block text-lg font-bold text-white mt-1">{vehicleDetail.odometer.toLocaleString()} km</span>
                  </div>
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Max Capacity</span>
                    <span className="block text-lg font-bold text-white mt-1">{vehicleDetail.capacity} kg</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Service Log History</h3>
                  {vehicleDetail.maintenanceLogs.length === 0 ? (
                    <p className="text-xs text-zinc-550 italic">No maintenance history recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {vehicleDetail.maintenanceLogs.map((log) => (
                        <div key={log.id} className="p-4 bg-zinc-900/40 border border-zinc-850/60 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-zinc-300">{log.serviceType.replace('_', ' ')}</span>
                            <p className="text-zinc-500 text-[10px] mt-0.5">{log.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-white">${log.cost}</span>
                            <span className="block text-[10px] text-zinc-555 mt-0.5">{new Date(log.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="pt-6 border-t border-zinc-850 flex justify-end space-x-3">
                    <button onClick={() => handleEditOpen(vehicleDetail)} className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-350 hover:text-white transition-all text-xs font-semibold">Edit Vehicle</button>
                    <button onClick={() => handleDelete(vehicleDetail.id)} className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all text-xs font-semibold">Delete Vehicle</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Register New Vehicle</h2>
              <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            {formError && <div className="p-4 mx-6 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-350 text-xs">{formError}</div>}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">License Plate</label>
                  <input type="text" required placeholder="TX-808-TRK" value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Vehicle Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="VAN">VAN</option>
                    <option value="TRUCK">TRUCK</option>
                    <option value="BUS">BUS</option>
                    <option value="SEDAN">SEDAN</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Make</label>
                  <input type="text" required placeholder="Ford" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Model</label>
                  <input type="text" required placeholder="Transit" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Year</label>
                  <input type="number" required value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Cargo Cap (kg)</label>
                  <input type="number" required value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Odometer (km)</label>
                  <input type="number" required value={formData.odometer} onChange={(e) => setFormData({ ...formData, odometer: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Fuel Type</label>
                <select value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                  <option value="DIESEL">DIESEL</option>
                  <option value="PETROL">PETROL</option>
                  <option value="ELECTRIC">ELECTRIC</option>
                </select>
              </div>
              <button type="submit" disabled={formSubmitting} className="w-full py-3 bg-cyan-600 hover:bg-cyan-550 text-white font-semibold rounded-xl text-sm transition-all">{formSubmitting ? 'Registering...' : 'Register Vehicle'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit Vehicle</h2>
              <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">License Plate</label>
                  <input type="text" required value={editFormData.licensePlate} onChange={(e) => setEditFormData({ ...editFormData, licensePlate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Status</label>
                  <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Make</label>
                  <input type="text" required value={editFormData.make} onChange={(e) => setEditFormData({ ...editFormData, make: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Model</label>
                  <input type="text" required value={editFormData.model} onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-550 text-white font-semibold rounded-xl text-sm transition-all">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// =================================================================
// 3. DRIVERS VIEW
// =================================================================
interface Driver {
  id: string
  firstName: string
  lastName: string
  licenseNo: string
  licenseExpiry: string
  status: string
  email: string
  phone: string
}

interface DriverDetail extends Driver {
  trips: Array<{
    id: string
    route: string
    scheduledStart: string
    scheduledEnd: string
    status: string
  }>
}

function DriversView() {
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [driverDetail, setDriverDetail] = useState<DriverDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licenseNo: '',
    licenseExpiry: '',
    status: 'AVAILABLE',
    email: '',
    phone: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    licenseNo: '',
    licenseExpiry: '',
    status: '',
    email: '',
    phone: ''
  })

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers')
      if (!res.ok) throw new Error('Failed to load drivers')
      const data = await res.json()
      setDrivers(data.drivers)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDriverDetail = async (id: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/drivers/${id}`)
      if (!res.ok) throw new Error('Failed to load driver details')
      const data = await res.json()
      setDriverDetail(data.driver)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  useEffect(() => {
    if (selectedDriverId) {
      fetchDriverDetail(selectedDriverId)
    } else {
      setDriverDetail(null)
    }
  }, [selectedDriverId])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSubmitting(true)
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create driver')
      }
      await fetchDrivers()
      setIsCreateOpen(false)
      setFormData({
        firstName: '',
        lastName: '',
        licenseNo: '',
        licenseExpiry: '',
        status: 'AVAILABLE',
        email: '',
        phone: ''
      })
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleEditOpen = (driver: Driver) => {
    const date = new Date(driver.licenseExpiry)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    setEditFormData({
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNo: driver.licenseNo,
      licenseExpiry: formattedDate,
      status: driver.status,
      email: driver.email,
      phone: driver.phone
    })
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSubmitting(true)
    try {
      const res = await fetch(`/api/drivers/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update driver')
      }
      await fetchDrivers()
      if (selectedDriverId === editFormData.id) {
        await fetchDriverDetail(editFormData.id)
      }
      setIsEditOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver? Completed trip records will be cascade deleted, and active assignments will block deletion.')) return
    try {
      const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete driver')
      }
      setSelectedDriverId(null)
      await fetchDrivers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const getLicenseStatus = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      return { label: 'EXPIRED', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
    } else if (diffDays <= 30) {
      return { label: 'EXPIRING SOON', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    } else {
      return { label: 'VALID', color: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' }
    }
  }

  const filteredDrivers = drivers.filter((d) => {
    const fullName = `${d.firstName} ${d.lastName}`.toLowerCase()
    return (
      fullName.includes(search.toLowerCase()) ||
      d.licenseNo.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
    ) && (statusFilter === 'ALL' || d.status === statusFilter)
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/10 text-emerald-455 border-emerald-500/20'
      case 'ON_TRIP': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default: return 'bg-rose-500/10 text-rose-455 border-rose-500/20'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Drivers Roster</h1>
          <p className="text-zinc-450 text-sm mt-1">Manage personnel, review certifications, and track driver availability.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-555 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all self-start md:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 glass-panel rounded-2xl">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-550" />
          <input type="text" placeholder="Search name, email, license number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-cyan-500/60" />
        </div>
        <div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/60">
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ON_TRIP">ON TRIP</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="text-center p-12 glass-panel rounded-2xl text-zinc-500 max-w-md mx-auto">
          <Users className="w-12 h-12 mx-auto mb-4 text-zinc-650" />
          <p className="font-bold text-zinc-400">No Drivers Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => {
            const licenseInfo = getLicenseStatus(driver.licenseExpiry)
            return (
              <div key={driver.id} onClick={() => setSelectedDriverId(driver.id)} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between cursor-pointer border border-zinc-800/80 group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${licenseInfo.color}`}>{licenseInfo.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusColor(driver.status)}`}>{driver.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{driver.firstName} {driver.lastName}</h3>
                  <span className="block text-zinc-500 text-xs mt-0.5">License: {driver.licenseNo}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-6 pt-4 border-t border-zinc-850/60 text-xs text-zinc-450">
                  <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-cyan-500/80" /><span className="truncate">{driver.email}</span></div>
                  <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-cyan-500/80" /><span>{driver.phone}</span></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Driver Detail Modal */}
      {selectedDriverId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-4xl rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{loadingDetail ? 'Loading Details...' : `${driverDetail?.firstName} ${driverDetail?.lastName}`}</h2>
                {!loadingDetail && driverDetail && <p className="text-xs text-zinc-550 mt-0.5">License: {driverDetail.licenseNo} • Email: {driverDetail.email}</p>}
              </div>
              <button onClick={() => setSelectedDriverId(null)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            {!loadingDetail && driverDetail && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">License Expiry</span>
                    <span className="block text-sm font-semibold text-white mt-1">{new Date(driverDetail.licenseExpiry).toLocaleDateString()}</span>
                  </div>
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Phone number</span>
                    <span className="block text-sm font-semibold text-white mt-1">{driverDetail.phone}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Assigned Trip Log History</h3>
                  {driverDetail.trips.length === 0 ? (
                    <p className="text-xs text-zinc-550 italic">No assigned trips on file.</p>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {driverDetail.trips.map((trip) => (
                        <div key={trip.id} className="p-4 bg-zinc-900/40 border border-zinc-850/60 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-zinc-300">{trip.route}</span>
                            <span className="block text-[10px] text-zinc-555 mt-0.5">{new Date(trip.scheduledStart).toLocaleDateString()} - {new Date(trip.scheduledEnd).toLocaleDateString()}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{trip.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="pt-6 border-t border-zinc-850 flex justify-end space-x-3">
                    <button onClick={() => handleEditOpen(driverDetail)} className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-350 hover:text-white transition-all text-xs font-semibold">Edit Driver</button>
                    <button onClick={() => handleDelete(driverDetail.id)} className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-505 text-white transition-all text-xs font-semibold">Delete Driver</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add New Driver Profile</h2>
              <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            {formError && <div className="p-4 mx-6 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-350 text-xs">{formError}</div>}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" required placeholder="David" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" required placeholder="Miller" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">License Number</label>
                  <input type="text" required placeholder="DL-9876543" value={formData.licenseNo} onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">License Expiry Date</label>
                  <input type="date" required value={formData.licenseExpiry} onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-zinc-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" required placeholder="david.miller@transitops.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Phone Number</label>
                  <input type="text" required placeholder="+1-555-0199" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>
              <button type="submit" disabled={formSubmitting} className="w-full py-3 bg-cyan-600 hover:bg-cyan-550 text-white font-semibold rounded-xl text-sm transition-all">{formSubmitting ? 'Saving Profile...' : 'Save Driver Profile'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit Driver Profile</h2>
              <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" required value={editFormData.firstName} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" required value={editFormData.lastName} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Status</label>
                  <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ON_TRIP">ON TRIP</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">License Expiry</label>
                  <input type="date" required value={editFormData.licenseExpiry} onChange={(e) => setEditFormData({ ...editFormData, licenseExpiry: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-zinc-300" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-555 text-white font-semibold rounded-xl text-sm transition-all">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// =================================================================
// 4. TRIPS VIEW
// =================================================================
interface TripDriver {
  id: string
  firstName: string
  lastName: string
  status: string
  licenseExpiry: string
}

interface TripVehicle {
  id: string
  licensePlate: string
  make: string
  model: string
  status: string
  odometer: number
  capacity: number
}

interface TripRecord {
  id: string
  driverId: string
  driver: TripDriver
  vehicleId: string
  vehicle: TripVehicle
  route: string
  scheduledStart: string
  scheduledEnd: string
  actualStart: string | null
  actualEnd: string | null
  status: string
  distance: number | null
}

function TripsView() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<TripRecord[]>([])
  const [drivers, setDrivers] = useState<TripDriver[]>([])
  const [vehicles, setVehicles] = useState<TripVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [driverId, setDriverId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [plannedDistance, setPlannedDistance] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')
  const [scheduledEnd, setScheduledEnd] = useState('')

  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null)

  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [completeTripId, setCompleteTripId] = useState<string | null>(null)
  const [completeDistance, setCompleteDistance] = useState('0')

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips')
      if (!res.ok) throw new Error('Failed to load trips')
      const data = await res.json()
      setTrips(data.trips)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fetchDriversAndVehicles = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/vehicles')
      ])
      const driversData = await driversRes.json()
      const vehiclesData = await vehiclesRes.json()
      setDrivers(driversData.drivers)
      setVehicles(vehiclesData.vehicles)
    } catch (err) {
      console.error(err)
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([fetchTrips(), fetchDriversAndVehicles()])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const refreshAllData = async () => {
    const prevSelectedId = selectedTrip?.id
    await Promise.all([fetchTrips(), fetchDriversAndVehicles()])
    if (prevSelectedId) {
      const res = await fetch(`/api/trips/${prevSelectedId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedTrip(data.trip)
      }
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSubmitting(true)
    try {
      const routeStr = `${source} -> ${destination}`
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          vehicleId,
          route: routeStr,
          scheduledStart,
          scheduledEnd,
          distance: plannedDistance ? parseFloat(plannedDistance) : null
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create trip')
      }
      await refreshAllData()
      handleResetForm()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleStartTrip = async (id: string) => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start trip')
      }
      await refreshAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleOpenCompleteModal = (id: string) => {
    setCompleteTripId(id)
    setCompleteDistance('0')
    setIsCompleteOpen(true)
  }

  const handleCompleteTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!completeTripId) return
    try {
      const res = await fetch(`/api/trips/${completeTripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED', distance: parseFloat(completeDistance) })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to complete trip')
      }
      setIsCompleteOpen(false)
      await refreshAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCancelTrip = async (id: string) => {
    if (!confirm('Cancel this trip?')) return
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to cancel trip')
      }
      await refreshAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('Permanently delete this assignment?')) return
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete trip')
      }
      if (selectedTrip?.id === id) setSelectedTrip(null)
      await refreshAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleResetForm = () => {
    setSource('')
    setDestination('')
    setDriverId('')
    setVehicleId('')
    setCargoWeight('')
    setPlannedDistance('')
    setScheduledStart('')
    setScheduledEnd('')
    setFormError(null)
  }

  const availableDrivers = drivers.filter(d => {
    const isLicenseValid = new Date(d.licenseExpiry) > new Date()
    return d.status === 'AVAILABLE' && isLicenseValid
  })

  const availableVehicles = vehicles.filter(v => v.status === 'ACTIVE')

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId)
  const parsedCargoWeight = parseFloat(cargoWeight) || 0
  const isCapacityExceeded = selectedVehicle ? parsedCargoWeight > selectedVehicle.capacity : false
  const capacityDiff = selectedVehicle ? Math.max(0, parsedCargoWeight - selectedVehicle.capacity) : 0

  const filteredTrips = trips.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const searchLower = searchQuery.toLowerCase()
    return matchesStatus && (
      t.route.toLowerCase().includes(searchLower) ||
      `${t.driver.firstName} ${t.driver.lastName}`.toLowerCase().includes(searchLower) ||
      `${t.vehicle.make} ${t.vehicle.model}`.toLowerCase().includes(searchLower)
    )
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return { bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400', label: 'Draft / Scheduled', dot: 'bg-amber-500' }
      case 'ACTIVE': return { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400', label: 'Dispatched', dot: 'bg-blue-500 animate-pulse' }
      case 'COMPLETED': return { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450', label: 'Completed', dot: 'bg-emerald-500' }
      default: return { bg: 'bg-rose-500/10 border-rose-500/20 text-rose-455', label: 'Cancelled', dot: 'bg-rose-500' }
    }
  }

  const parseRoute = (route: string) => {
    const parts = route.split(' -> ')
    return parts.length >= 2 ? { source: parts[0], destination: parts.slice(1).join(' -> ') } : { source: route, destination: '' }
  }

  const renderLifecyclePipeline = (status: string) => {
    const isDraft = status === 'DRAFT' || status === 'SCHEDULED'
    const isActive = status === 'ACTIVE'
    const isCompleted = status === 'COMPLETED'
    const isCancelled = status === 'CANCELLED'

    return (
      <div className="space-y-4 p-5 glass-panel rounded-2xl border border-zinc-855">
        <span className="block text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Trip Dispatch Timeline</span>
        {isCancelled ? (
          <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-450 text-xs font-bold rounded-xl text-center">THIS DISPATCH HAS BEEN CANCELLED</div>
        ) : (
          <div className="flex items-center justify-between relative px-4 text-xs">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-800 -translate-y-1/2 z-0" />
            <div className="flex flex-col items-center z-10 relative">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDraft ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}><span className="text-[10px] font-bold">1</span></div>
              <span className="text-[9px] font-bold mt-1.5 text-zinc-400">Scheduled</span>
            </div>
            <div className="flex flex-col items-center z-10 relative">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}><span className="text-[10px] font-bold">2</span></div>
              <span className="text-[9px] font-bold mt-1.5 text-zinc-400">Active</span>
            </div>
            <div className="flex flex-col items-center z-10 relative">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}><span className="text-[10px] font-bold">3</span></div>
              <span className="text-[9px] font-bold mt-1.5 text-zinc-400">Completed</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Trips Dispatcher</h1>
          <p className="text-zinc-455 text-sm mt-1">Book logistics runs, allocate fleet slots, and track transit logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create Dispatch Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl shadow-xl border border-zinc-850/80">
            <h2 className="text-base font-bold text-white mb-4">Assign New Dispatch</h2>
            {formError && <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-350 text-xs">{formError}</div>}
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Source Depot</label>
                  <input type="text" required placeholder="Dallas Hub" value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-3 py-2 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Destination</label>
                  <input type="text" required placeholder="Austin Station" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full px-3 py-2 rounded-xl glass-input text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Allocate Vehicle (Active Only)</label>
                <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-zinc-950">
                  <option value="">Choose Vehicle</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.licensePlate} ({v.make} {v.model}) - Cap: {v.capacity} kg</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Cargo Load (kg)</label>
                  <input type="number" required placeholder="e.g. 500" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} className="w-full px-3 py-2 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Est. Distance (km)</label>
                  <input type="number" placeholder="Optional" value={plannedDistance} onChange={(e) => setPlannedDistance(e.target.value)} className="w-full px-3 py-2 rounded-xl glass-input text-sm" />
                </div>
              </div>
              {selectedVehicle && (
                <div className={`p-3 rounded-xl border flex items-start space-x-2.5 transition-all duration-300 ${
                  isCapacityExceeded 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-455'
                }`}>
                  {isCapacityExceeded ? (
                    <>
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold uppercase tracking-wide text-[10px]">Overloaded Hazard</span>
                        <span className="block text-[10px] opacity-90 mt-0.5">Cargo weight exceeds safety limits by {capacityDiff} kg!</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold uppercase tracking-wide text-[10px]">Weight Approved</span>
                        <span className="block text-[10px] opacity-90 mt-0.5">Cargo fits comfortably within vehicle capacity.</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div>
                <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Assign Driver (Available Only)</label>
                <select required value={driverId} onChange={(e) => setDriverId(e.target.value)} className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-zinc-950">
                  <option value="">Choose Driver</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Scheduled Start</label>
                  <input type="datetime-local" required value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-300" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Scheduled End</label>
                  <input type="datetime-local" required value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)} className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-300" />
                </div>
              </div>
              <button type="submit" disabled={formSubmitting || isCapacityExceeded} className={`w-full py-3 font-semibold rounded-xl text-sm transition-all shadow-md ${
                isCapacityExceeded 
                  ? 'bg-zinc-800 text-zinc-555 cursor-not-allowed border border-zinc-755' 
                  : 'bg-cyan-600 hover:bg-cyan-550 text-white shadow-cyan-500/15'
              }`}>{formSubmitting ? 'Creating Dispatch...' : 'Dispatch Trip'}</button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Dispatch Board */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-550" />
              <input type="text" placeholder="Search route, driver, plate..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-cyan-500/60" />
            </div>
            <div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-zinc-950/40 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/60">
                <option value="ALL">All Trip Statuses</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="ACTIVE">DISPATCHED (ACTIVE)</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center p-12 glass-panel rounded-2xl text-zinc-500 max-w-md mx-auto">
              <Route className="w-12 h-12 mx-auto mb-4 text-zinc-650" />
              <p className="font-bold text-zinc-400">No Dispatches Scheduled</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTrips.map((trip) => {
                const statusConfig = getStatusConfig(trip.status)
                const routeInfo = parseRoute(trip.route)
                const isSelected = selectedTrip?.id === trip.id
                return (
                  <div key={trip.id} onClick={() => setSelectedTrip(trip)} className={`glass-panel p-5 rounded-2xl border cursor-pointer group transition-all duration-300 relative flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-zinc-900/60 border-cyan-500/40 shadow-lg shadow-cyan-500/5' 
                      : 'border-zinc-800/80 hover:border-zinc-700/80'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${statusConfig.bg}`}>{statusConfig.label}</span>
                        {user?.role === 'ADMIN' && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id) }} className="p-1 rounded bg-zinc-900 border border-zinc-850 hover:border-rose-500/20 text-zinc-555 hover:text-rose-455 hover:bg-rose-500/5 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0"><Navigation className="w-4 h-4 text-cyan-400" /></div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">{routeInfo.source}</h3>
                          <span className="block text-[10px] text-zinc-500 font-semibold truncate mt-0.5">Destination: {routeInfo.destination}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-450 border-t border-zinc-850/60 pt-3">
                        <div className="flex items-center space-x-1.5"><Users className="w-3.5 h-3.5 text-cyan-500/80 shrink-0" /><span className="truncate">{trip.driver.firstName} {trip.driver.lastName}</span></div>
                        <div className="flex items-center space-x-1.5"><Truck className="w-3.5 h-3.5 text-cyan-500/80 shrink-0" /><span className="truncate">{trip.vehicle.licensePlate}</span></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedTrip && (
            <div className="glass-panel p-6 rounded-2xl border border-zinc-850 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Active Dispatch Details</h3>
                  <p className="text-zinc-555 text-[10px] mt-0.5">Trip ID: {selectedTrip.id}</p>
                </div>
                <button onClick={() => setSelectedTrip(null)} className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-855 hover:bg-zinc-800 text-zinc-500 hover:text-white flex items-center justify-center transition-all"><X className="w-4 h-4" /></button>
              </div>

              {renderLifecyclePipeline(selectedTrip.status)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2.5 p-4 bg-zinc-950/20 border border-zinc-850/60 rounded-xl">
                  <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Scheduled Times</span>
                  <div className="flex items-center justify-between"><span className="text-zinc-555">Scheduled Start:</span><span className="text-zinc-300 font-semibold">{new Date(selectedTrip.scheduledStart).toLocaleString()}</span></div>
                  <div className="flex items-center justify-between"><span className="text-zinc-555">Scheduled End:</span><span className="text-zinc-300 font-semibold">{new Date(selectedTrip.scheduledEnd).toLocaleString()}</span></div>
                </div>

                <div className="space-y-2.5 p-4 bg-zinc-950/20 border border-zinc-850/60 rounded-xl">
                  <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Actual Telemetry</span>
                  <div className="flex items-center justify-between"><span className="text-zinc-555">Actual Start:</span><span className="text-zinc-300 font-semibold">{selectedTrip.actualStart ? new Date(selectedTrip.actualStart).toLocaleString() : 'Not Dispatched'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-zinc-555">Actual End:</span><span className="text-zinc-300 font-semibold">{selectedTrip.actualEnd ? new Date(selectedTrip.actualEnd).toLocaleString() : 'In Progress / Open'}</span></div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                {selectedTrip.status === 'SCHEDULED' && (
                  <>
                    <button onClick={() => handleCancelTrip(selectedTrip.id)} className="px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 text-zinc-400 hover:text-white transition-all text-xs font-semibold">Cancel Dispatch</button>
                    <button onClick={() => handleStartTrip(selectedTrip.id)} className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-550 text-white font-semibold text-xs transition-all shadow-md"><Play className="w-3.5 h-3.5" /><span>Start Run</span></button>
                  </>
                )}
                {selectedTrip.status === 'ACTIVE' && (
                  <button onClick={() => handleOpenCompleteModal(selectedTrip.id)} className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"><CheckCircle className="w-3.5 h-3.5" /><span>Complete Run</span></button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Run Modal */}
      {isCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log Trip Mileage</h2>
              <button onClick={() => setIsCompleteOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCompleteTripSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Final Distance Traveled (km)</label>
                <input type="number" required min="0" step="0.1" value={completeDistance} onChange={(e) => setCompleteDistance(e.target.value)} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all">Submit Mileage & Close Trip</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// =================================================================
// 5. MAINTENANCE VIEW
// =================================================================
interface MaintVehicle {
  id: string
  licensePlate: string
  make: string
  model: string
}

interface MaintenanceRecord {
  id: string
  vehicleId: string
  vehicle: MaintVehicle
  serviceType: string
  description: string
  cost: number
  startDate: string
  endDate: string | null
  status: string
}

function MaintenanceView() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<MaintenanceRecord[]>([])
  const [vehicles, setVehicles] = useState<MaintVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: 'OIL_CHANGE',
    description: '',
    cost: '0',
    startDate: '',
    status: 'SCHEDULED'
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/maintenance')
      if (!res.ok) throw new Error('Failed to load maintenance logs')
      const data = await res.json()
      setLogs(data.logs)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles')
      const data = await res.json()
      setVehicles(data.vehicles)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    if (isCreateOpen) {
      fetchVehicles()
    }
  }, [isCreateOpen])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSubmitting(true)
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to schedule maintenance')
      }
      await fetchLogs()
      setIsCreateOpen(false)
      setFormData({
        vehicleId: '',
        serviceType: 'OIL_CHANGE',
        description: '',
        cost: '0',
        startDate: '',
        status: 'SCHEDULED'
      })
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleStartService = async (id: string) => {
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start maintenance')
      }
      await fetchLogs()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCompleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to complete maintenance')
      }
      await fetchLogs()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Revert ongoing maintenance status?')) return
    try {
      const res = await fetch(`/api/maintenance/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete record')
      }
      await fetchLogs()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'IN_PROGRESS': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default: return 'bg-emerald-500/10 text-emerald-455 border-emerald-500/20'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Service Maintenance</h1>
          <p className="text-zinc-450 text-sm mt-1">Schedule servicing, track garage visits, and maintain fleet integrity.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-550 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all self-start md:self-auto">
          <Plus className="w-4 h-4" />
          <span>Schedule Service</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center p-12 glass-panel rounded-2xl text-zinc-500 max-w-md mx-auto">
          <Wrench className="w-12 h-12 mx-auto mb-4 text-zinc-655" />
          <p className="font-bold text-zinc-400">No Services Scheduled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {logs.map((log) => (
            <div key={log.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between border border-zinc-850/80 gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusColor(log.status)}`}>{log.status}</span>
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">{log.serviceType.replace('_', ' ')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Vehicle: {log.vehicle.make} {log.vehicle.model} ({log.vehicle.licensePlate})</h3>
                    <p className="text-xs text-zinc-450 mt-1 max-w-2xl">{log.description}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-xs text-zinc-400 border-t md:border-t-0 md:border-l border-zinc-850 pt-4 md:pt-0 md:pl-6 shrink-0 min-w-[260px]">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between"><span className="text-zinc-555">Service Cost:</span><span className="font-bold text-white">${log.cost.toLocaleString()}</span></div>
                  <div className="flex items-center justify-between"><span className="text-zinc-555">Start Date:</span><span className="text-zinc-300 font-semibold">{new Date(log.startDate).toLocaleDateString()}</span></div>
                  <div className="flex items-center justify-between"><span className="text-zinc-555">Completion:</span><span className="text-zinc-300 font-semibold">{log.endDate ? new Date(log.endDate).toLocaleDateString() : 'Ongoing'}</span></div>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-850">
                {log.status === 'SCHEDULED' && (
                  <button onClick={() => handleStartService(log.id)} className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-555 text-white font-semibold text-xs transition-all shadow-md"><Play className="w-3.5 h-3.5" /><span>Start Work</span></button>
                )}
                {log.status === 'IN_PROGRESS' && (
                  <button onClick={() => handleCompleteService(log.id)} className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-555 text-white font-semibold text-xs transition-all shadow-md"><CheckCircle className="w-3.5 h-3.5" /><span>Complete Work</span></button>
                )}
                {user?.role === 'ADMIN' && (
                  <button onClick={() => handleDelete(log.id)} className="p-2 rounded-xl border border-zinc-800 hover:border-rose-505 bg-zinc-950/20 text-zinc-555 hover:text-rose-455 transition-all"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Schedule Vehicle Service</h2>
              <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            {formError && <div className="p-4 mx-6 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-350 text-xs">{formError}</div>}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Select Vehicle</label>
                  <select required value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="">Choose Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.licensePlate} ({v.make} {v.model})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Service Type</label>
                  <select value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="OIL_CHANGE">OIL CHANGE</option>
                    <option value="TIRE_ROTATION">TIRE ROTATION</option>
                    <option value="BRAKE_SERVICE">BRAKE SERVICE</option>
                    <option value="ENGINE_REPAIR">ENGINE REPAIR</option>
                    <option value="INSPECTION">INSPECTION</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Estimated Cost ($)</label>
                  <input type="number" required min="0" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Scheduled Start Date</label>
                  <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-zinc-300" />
                </div>
              </div>
              <div>
                <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Service Description</label>
                <textarea required placeholder="Identify service triggers (e.g. oil shift, brake pads, inspections)." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
              </div>
              <button type="submit" disabled={formSubmitting} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition-all">{formSubmitting ? 'Scheduling...' : 'Schedule Service'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// =================================================================
// 6. FUEL & EXPENSES VIEW
// =================================================================
interface FuelVehicle {
  id: string
  licensePlate: string
  make: string
  model: string
  odometer: number
}

interface FuelTrip {
  id: string
  route: string
}

interface FuelLog {
  id: string
  vehicle: FuelVehicle
  trip: FuelTrip | null
  fillDate: string
  liters: number
  cost: number
  odometer: number
}

interface ExpenseRecord {
  id: string
  trip: (FuelTrip & { vehicle: FuelVehicle }) | null
  category: string
  amount: number
  date: string
  description: string
}

function FuelExpensesView() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel')
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [expenseLogs, setExpenseLogs] = useState<ExpenseRecord[]>([])
  const [vehicles, setVehicles] = useState<FuelVehicle[]>([])
  const [trips, setTrips] = useState<FuelTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFuelOpen, setIsFuelOpen] = useState(false)
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)

  const [fuelFormData, setFuelFormData] = useState({
    vehicleId: '',
    tripId: '',
    fillDate: '',
    liters: '',
    cost: '',
    odometer: ''
  })

  const [expenseFormData, setExpenseFormData] = useState({
    tripId: '',
    category: 'TOLL',
    amount: '',
    date: '',
    description: ''
  })

  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [fuelRes, expenseRes, vehiclesRes, tripsRes] = await Promise.all([
        fetch('/api/fuel'),
        fetch('/api/expenses'),
        fetch('/api/vehicles'),
        fetch('/api/trips')
      ])
      const fuelData = await fuelRes.json()
      const expenseData = await expenseRes.json()
      const vehiclesData = await vehiclesRes.json()
      const tripsData = await tripsRes.json()

      setFuelLogs(fuelData.logs || [])
      setExpenseLogs(expenseData.logs || [])
      setVehicles(vehiclesData.vehicles || [])
      setTrips(tripsData.trips || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (fuelFormData.vehicleId) {
      const v = vehicles.find(veh => veh.id === fuelFormData.vehicleId)
      if (v) {
        setFuelFormData(prev => ({ ...prev, odometer: v.odometer.toString() }))
      }
    }
  }, [fuelFormData.vehicleId, vehicles])

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSubmitting(true)
    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fuelFormData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to log fuel')
      }
      await fetchData()
      setIsFuelOpen(false)
      setFuelFormData({ vehicleId: '', tripId: '', fillDate: '', liters: '', cost: '', odometer: '' })
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSubmitting(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseFormData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to log expense')
      }
      await fetchData()
      setIsExpenseOpen(false)
      setExpenseFormData({ tripId: '', category: 'TOLL', amount: '', date: '', description: '' })
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'
    if (activeTab === 'fuel') {
      csvContent += 'Date,Vehicle,Liters,Cost,Cost/L,Odometer,Trip Route\n'
      fuelLogs.forEach(log => {
        const costPerL = (log.cost / log.liters).toFixed(2)
        const date = new Date(log.fillDate).toLocaleDateString()
        const route = log.trip ? log.trip.route.replace(',', ';') : 'N/A'
        csvContent += `"${date}","${log.vehicle.licensePlate}",${log.liters},${log.cost},${costPerL},${log.odometer},"${route}"\n`
      })
    } else {
      csvContent += 'Date,Category,Amount,Description,Trip Route,Vehicle\n'
      expenseLogs.forEach(log => {
        const date = new Date(log.date).toLocaleDateString()
        const route = log.trip ? log.trip.route.replace(',', ';') : 'N/A'
        const plate = log.trip ? log.trip.vehicle.licensePlate : 'N/A'
        csvContent += `"${date}","${log.category}",${log.amount},"${log.description.replace('"', '""')}","${route}","${plate}"\n`
      })
    }
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', activeTab === 'fuel' ? 'fuel_ledger_report.csv' : 'operating_expenses_report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'TOLL': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      case 'PARKING': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'FOOD': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'MAINTENANCE': return 'bg-rose-500/10 text-rose-450 border-rose-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Fuel & Expenses Ledger</h1>
          <p className="text-zinc-450 text-sm mt-1">Audit fuel fillups, track transit tolls, driver stipends, and download reports.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleDownloadCSV} className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-350 hover:text-white transition-all text-xs font-semibold">Export CSV</button>
          <button onClick={() => setIsFuelOpen(true)} className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-550 text-white font-semibold text-xs transition-all shadow-lg"><Fuel className="w-4 h-4" /><span>Log Fuel</span></button>
          <button onClick={() => setIsExpenseOpen(true)} className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-555 text-white font-semibold text-xs transition-all shadow-lg"><DollarSign className="w-4 h-4" /><span>Log Expense</span></button>
        </div>
      </div>

      <div className="flex border-b border-zinc-850">
        <button onClick={() => setActiveTab('fuel')} className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[2px] ${activeTab === 'fuel' ? 'border-cyan-500 text-cyan-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Fuel Fill-ups</button>
        <button onClick={() => setActiveTab('expenses')} className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[2px] ${activeTab === 'expenses' ? 'border-cyan-500 text-cyan-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Operating Expenses</button>
      </div>

      {loading ? (
        <div className="flex h-48 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      ) : activeTab === 'fuel' ? (
        fuelLogs.length === 0 ? (
          <div className="text-center p-12 glass-panel rounded-2xl text-zinc-500 max-w-md mx-auto">
            <Fuel className="w-12 h-12 mx-auto mb-4 text-zinc-650" />
            <p className="font-bold text-zinc-400">No Fuel Logs Found</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-zinc-850 rounded-2xl bg-zinc-950/20 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-850 text-zinc-450">
                  <th className="p-4">Fill Date</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Liters</th>
                  <th className="p-4">Total Cost</th>
                  <th className="p-4">Price / Liter</th>
                  <th className="p-4">Odometer</th>
                  <th className="p-4">Trip Route</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-850/60 text-zinc-300">
                    <td className="p-4 flex items-center space-x-2"><Calendar className="w-4 h-4 text-cyan-400/80" /><span>{new Date(log.fillDate).toLocaleDateString()}</span></td>
                    <td className="p-4 font-bold text-white">{log.vehicle.licensePlate}</td>
                    <td className="p-4">{log.liters} L</td>
                    <td className="p-4 font-semibold text-white">${log.cost.toFixed(2)}</td>
                    <td className="p-4 text-zinc-500">${(log.cost / log.liters).toFixed(2)} / L</td>
                    <td className="p-4">{log.odometer.toLocaleString()} km</td>
                    <td className="p-4 text-zinc-500 truncate max-w-xs">{log.trip ? log.trip.route : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        expenseLogs.length === 0 ? (
          <div className="text-center p-12 glass-panel rounded-2xl text-zinc-500 max-w-md mx-auto">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-zinc-650" />
            <p className="font-bold text-zinc-400">No Expenses Recorded</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-zinc-850 rounded-2xl bg-zinc-950/20 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-850 text-zinc-450">
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Trip Route</th>
                </tr>
              </thead>
              <tbody>
                {expenseLogs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-850/60 text-zinc-300">
                    <td className="p-4 flex items-center space-x-2"><Calendar className="w-4 h-4 text-cyan-400/80" /><span>{new Date(log.date).toLocaleDateString()}</span></td>
                    <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getCategoryColor(log.category)}`}>{log.category}</span></td>
                    <td className="p-4 font-bold text-white">${log.amount.toFixed(2)}</td>
                    <td className="p-4 text-zinc-300">{log.description}</td>
                    <td className="p-4 font-semibold text-zinc-500">{log.trip ? log.trip.vehicle.licensePlate : 'N/A'}</td>
                    <td className="p-4 text-zinc-500 truncate max-w-xs">{log.trip ? log.trip.route : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Log Fuel Modal */}
      {isFuelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log Fuel Fill-up</h2>
              <button onClick={() => setIsFuelOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            {formError && <div className="p-4 mx-6 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-350 text-xs">{formError}</div>}
            <form onSubmit={handleFuelSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Select Vehicle</label>
                  <select required value={fuelFormData.vehicleId} onChange={(e) => setFuelFormData({ ...fuelFormData, vehicleId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="">Choose Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.licensePlate} ({v.make} {v.model})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Associate Trip Run</label>
                  <select value={fuelFormData.tripId} onChange={(e) => setFuelFormData({ ...fuelFormData, tripId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="">N/A / Offline</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>{t.route}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Liters Filled</label>
                  <input type="number" required min="0.1" step="0.1" value={fuelFormData.liters} onChange={(e) => setFuelFormData({ ...fuelFormData, liters: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Total Invoice ($)</label>
                  <input type="number" required min="0.01" step="0.01" value={fuelFormData.cost} onChange={(e) => setFuelFormData({ ...fuelFormData, cost: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Current Odo (km)</label>
                  <input type="number" required min="0" value={fuelFormData.odometer} onChange={(e) => setFuelFormData({ ...fuelFormData, odometer: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Fill-up Date</label>
                <input type="date" required value={fuelFormData.fillDate} onChange={(e) => setFuelFormData({ ...fuelFormData, fillDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-zinc-300" />
              </div>
              <button type="submit" disabled={formSubmitting} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition-all">Submit Fuel Log</button>
            </form>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log Operating Expense</h2>
              <button onClick={() => setIsExpenseOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            {formError && <div className="p-4 mx-6 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-350 text-xs">{formError}</div>}
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Select Trip</label>
                  <select required value={expenseFormData.tripId} onChange={(e) => setExpenseFormData({ ...expenseFormData, tripId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="">Choose Trip Run</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>{t.route}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Category</label>
                  <select value={expenseFormData.category} onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-zinc-950">
                    <option value="TOLL">TOLL</option>
                    <option value="PARKING">PARKING</option>
                    <option value="FOOD">FOOD</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Amount ($)</label>
                  <input type="number" required min="0.01" step="0.01" value={expenseFormData.amount} onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Expense Date</label>
                  <input type="date" required value={expenseFormData.date} onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-zinc-300" />
                </div>
              </div>
              <div>
                <label className="block text-zinc-555 font-bold uppercase tracking-wider mb-2">Description / Purpose</label>
                <input type="text" required placeholder="Driver lunch stipends, toll tag balance..." value={expenseFormData.description} onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
              </div>
              <button type="submit" disabled={formSubmitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all">Submit Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// =================================================================
// MAIN COMBINED DASHBOARD PAGE COMPONENT
// =================================================================
export default function ConsolidatedConsolePage() {
  const { user } = useAuth()
  const params = useParams()
  const tab = (params?.tab as string) || 'dashboard'

  if (!user) return null

  switch (tab) {
    case 'dashboard':
      return <DashboardView />
    case 'vehicles':
      return <VehiclesView />
    case 'drivers':
      return <DriversView />
    case 'trips':
      return <TripsView />
    case 'maintenance':
      return <MaintenanceView />
    case 'fuel-expenses':
      return <FuelExpensesView />
    default:
      return <DashboardView />
  }
}
