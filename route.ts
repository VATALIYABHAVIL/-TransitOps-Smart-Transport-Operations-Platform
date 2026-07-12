import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken, signToken } from '@/lib/auth'
import * as bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

// =================================================================
// GET ROUTE DISPATCHER
// =================================================================
export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  try {
    const { path } = await params
    if (!path || path.length === 0) {
      return NextResponse.json({ message: 'TransitOps Telemetry API Active' })
    }

    const resource = path[0]
    const subResource = path[1]

    // 1. AUTH - GET ACTIVE USER (api/auth/me)
    if (resource === 'auth' && subResource === 'me') {
      const cookieStore = await cookies()
      const token = cookieStore.get('auth_token')?.value

      if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({ user })
    }

    // 2. DASHBOARD - STATS & TELEMETRY CHARTS (api/dashboard/stats)
    if (resource === 'dashboard' && subResource === 'stats') {
      const availableVehicles = await prisma.vehicle.count({ where: { status: 'Available' } })
      const onTripVehicles = await prisma.vehicle.count({ where: { status: 'On Trip' } })
      const activeVehicles = availableVehicles + onTripVehicles
      const maintenanceVehicles = await prisma.vehicle.count({ where: { status: 'In Shop' } })
      const totalVehicles = await prisma.vehicle.count({ where: { status: { not: 'Retired' } } })
      const fleetUtilization = totalVehicles > 0 ? (onTripVehicles / totalVehicles) * 100 : 0
      
      const availableDrivers = await prisma.driver.count({ where: { status: 'Available' } })
      const driversOnDuty = await prisma.driver.count({ where: { status: 'On Trip' } })
      const activeTrips = await prisma.trip.count({ where: { status: 'Dispatched' } })
      const pendingTrips = await prisma.trip.count({ where: { status: 'Draft' } })
      const totalTrips = await prisma.trip.count()

      const totalMaintenanceCost = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } })
      const totalFuelCost = await prisma.fuelLog.aggregate({ _sum: { cost: true } })
      const totalMiscExpense = await prisma.expenseLog.aggregate({ _sum: { amount: true } })

      const maintCost = totalMaintenanceCost._sum.cost || 0
      const fuelCost = totalFuelCost._sum.cost || 0
      const miscCost = totalMiscExpense._sum.amount || 0
      const totalExpense = maintCost + fuelCost + miscCost

      const completedTripsWithDistance = await prisma.trip.findMany({
        where: { status: 'COMPLETED', distance: { not: null } },
        include: { fuelLogs: true }
      })

      let totalKm = 0
      let totalL = 0
      completedTripsWithDistance.forEach((t: any) => {
        if (t.distance) {
          t.fuelLogs.forEach((f: any) => {
            totalKm += t.distance || 0
            totalL += f.liters
          })
        }
      })

      if (totalL === 0) {
        const sumDist = await prisma.trip.aggregate({ where: { status: 'COMPLETED' }, _sum: { distance: true } })
        const sumLiters = await prisma.fuelLog.aggregate({ _sum: { liters: true } })
        totalKm = sumDist._sum.distance || 0
        totalL = sumLiters._sum.liters || 0
      }

      const avgFuelEfficiency = totalL > 0 ? (totalKm / totalL) : 0

      const categoryExpenses = { Fuel: fuelCost, Maintenance: maintCost, Tolls: 0, Food: 0, Other: 0 }
      const dbMiscExpenses = await prisma.expenseLog.groupBy({ by: ['category'], _sum: { amount: true } })

      dbMiscExpenses.forEach((exp: any) => {
        const cat = exp.category
        const amt = exp._sum.amount || 0
        if (cat === 'TOLL') categoryExpenses.Tolls += amt
        else if (cat === 'FOOD') categoryExpenses.Food += amt
        else if (cat === 'OTHER') categoryExpenses.Other += amt
        else if (cat === 'MAINTENANCE') categoryExpenses.Maintenance += amt
      })

      const expensePieData = Object.entries(categoryExpenses).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
      })).filter(d => d.value > 0)

      const vehiclesWithFuel = await prisma.vehicle.findMany({
        include: {
          fuelLogs: true,
          trips: { where: { status: 'COMPLETED', distance: { not: null } } }
        }
      })

      const modelEfficiencyMap: Record<string, { km: number; liters: number }> = {}
      vehiclesWithFuel.forEach((v: any) => {
        const key = `${v.make} ${v.model}`
        if (!modelEfficiencyMap[key]) {
          modelEfficiencyMap[key] = { km: 0, liters: 0 }
        }
        const vDistance = v.trips.reduce((acc: number, t: any) => acc + (t.distance || 0), 0)
        const vLiters = v.fuelLogs.reduce((acc: number, f: any) => acc + f.liters, 0)
        modelEfficiencyMap[key].km += vDistance
        modelEfficiencyMap[key].liters += vLiters
      })

      const modelBarData = Object.entries(modelEfficiencyMap).map(([model, data]) => {
        const efficiency = data.liters > 0 ? (data.km / data.liters) : 0
        return { model, efficiency: parseFloat(efficiency.toFixed(2)) }
      }).filter(d => d.efficiency > 0)

      const last30DaysTrend: Record<string, number> = {}
      const date30DaysAgo = new Date()
      date30DaysAgo.setDate(date30DaysAgo.getDate() - 30)

      const [recentMisc, recentFuel, recentMaint] = await Promise.all([
        prisma.expenseLog.findMany({ where: { date: { gte: date30DaysAgo } } }),
        prisma.fuelLog.findMany({ where: { fillDate: { gte: date30DaysAgo } } }),
        prisma.maintenanceLog.findMany({ where: { startDate: { gte: date30DaysAgo } } })
      ])

      recentMisc.forEach((m: any) => {
        const day = m.date.toISOString().split('T')[0]
        last30DaysTrend[day] = (last30DaysTrend[day] || 0) + m.amount
      })
      recentFuel.forEach((f: any) => {
        const day = f.fillDate.toISOString().split('T')[0]
        last30DaysTrend[day] = (last30DaysTrend[day] || 0) + f.cost
      })
      recentMaint.forEach((m: any) => {
        const day = m.startDate.toISOString().split('T')[0]
        last30DaysTrend[day] = (last30DaysTrend[day] || 0) + m.cost
      })

      const trendData = Object.entries(last30DaysTrend)
        .map(([date, amount]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawDate: date,
          amount: parseFloat(amount.toFixed(2))
        }))
        .sort((a, b) => a.rawDate.localeCompare(b.rawDate))

      return NextResponse.json({
        metrics: {
          activeVehicles,
          availableVehicles,
          maintenanceVehicles,
          activeTrips,
          pendingTrips,
          totalTrips,
          availableDrivers,
          driversOnDuty,
          fleetUtilization: parseFloat(fleetUtilization.toFixed(2)),
          totalExpense: parseFloat(totalExpense.toFixed(2)),
          avgFuelEfficiency: parseFloat(avgFuelEfficiency.toFixed(2)),
        },
        charts: { expensePieData, modelBarData, trendData }
      })
    }

    // 3. DRIVERS (GET /api/drivers and GET /api/drivers/[id])
    if (resource === 'drivers') {
      if (subResource) {
        const driver = await prisma.driver.findUnique({
          where: { id: subResource },
          include: { trips: { orderBy: { scheduledStart: 'desc' } } }
        })
        if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
        return NextResponse.json({ driver })
      } else {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const where: any = {}
        if (status) where.status = status
        const drivers = await prisma.driver.findMany({
          where,
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ drivers })
      }
    }

    // 4. EXPENSES (GET /api/expenses)
    if (resource === 'expenses') {
      const logs = await prisma.expenseLog.findMany({
        include: { trip: { include: { vehicle: true, driver: true } } },
        orderBy: { date: 'desc' }
      })
      return NextResponse.json({ logs })
    }

    // 5. FUEL LOGS (GET /api/fuel)
    if (resource === 'fuel') {
      const logs = await prisma.fuelLog.findMany({
        include: { vehicle: true, trip: true },
        orderBy: { fillDate: 'desc' }
      })
      return NextResponse.json({ logs })
    }

    // 6. MAINTENANCE (GET /api/maintenance and GET /api/maintenance/[id])
    if (resource === 'maintenance') {
      if (subResource) {
        const log = await prisma.maintenanceLog.findUnique({
          where: { id: subResource },
          include: { vehicle: true }
        })
        if (!log) return NextResponse.json({ error: 'Maintenance log not found' }, { status: 404 })
        return NextResponse.json({ log })
      } else {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const where: any = {}
        if (status) where.status = status
        const logs = await prisma.maintenanceLog.findMany({
          where,
          include: { vehicle: true },
          orderBy: { startDate: 'desc' }
        })
        return NextResponse.json({ logs })
      }
    }

    // 7. TRIPS (GET /api/trips and GET /api/trips/[id])
    if (resource === 'trips') {
      if (subResource) {
        const trip = await prisma.trip.findUnique({
          where: { id: subResource },
          include: { driver: true, vehicle: true, fuelLogs: true, expenseLogs: true }
        })
        if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
        return NextResponse.json({ trip })
      } else {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const where: any = {}
        if (status) where.status = status
        const trips = await prisma.trip.findMany({
          where,
          include: { driver: true, vehicle: true },
          orderBy: { scheduledStart: 'desc' }
        })
        return NextResponse.json({ trips })
      }
    }

    // 8. VEHICLES (GET /api/vehicles and GET /api/vehicles/[id])
    if (resource === 'vehicles') {
      if (subResource) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: subResource },
          include: {
            maintenanceLogs: { orderBy: { startDate: 'desc' } },
            fuelLogs: { orderBy: { fillDate: 'desc' } }
          }
        })
        if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
        return NextResponse.json({ vehicle })
      } else {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const type = searchParams.get('type')
        const where: any = {}
        if (status) where.status = status
        if (type) where.type = type
        const vehicles = await prisma.vehicle.findMany({
          where,
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ vehicles })
      }
    }
    // 9. REPORTS (GET /api/reports/analytics)
    if (resource === 'reports' && subResource === 'analytics') {
      const vehicles = await prisma.vehicle.findMany({
        include: {
          fuelLogs: true,
          maintenanceLogs: true,
          trips: true
        }
      })

      const analytics = vehicles.map((v: any) => {
        const totalFuelCost = v.fuelLogs.reduce((sum: number, f: any) => sum + f.cost, 0)
        const totalMaintCost = v.maintenanceLogs.reduce((sum: number, m: any) => sum + m.cost, 0)
        const totalOperationalCost = totalFuelCost + totalMaintCost
        const totalRevenue = v.trips.reduce((sum: number, t: any) => sum + (t.revenue || 0), 0)
        const totalDistance = v.trips.reduce((sum: number, t: any) => sum + (t.distance || 0), 0)
        const totalLiters = v.fuelLogs.reduce((sum: number, f: any) => sum + f.liters, 0)
        
        const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters) : 0
        const roi = v.acquisitionCost > 0 ? (totalRevenue - totalOperationalCost) / v.acquisitionCost : 0

        return {
          id: v.id,
          licensePlate: v.licensePlate,
          make: v.make,
          model: v.model,
          acquisitionCost: v.acquisitionCost,
          totalOperationalCost,
          totalRevenue,
          fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
          roi: parseFloat(roi.toFixed(2))
        }
      })
      
      const { searchParams } = new URL(request.url)
      const format = searchParams.get('format')
      
      if (format === 'csv') {
        let csv = 'License Plate,Make,Model,Acquisition Cost,Total Operational Cost,Total Revenue,Fuel Efficiency,ROI\n'
        analytics.forEach((a: any) => {
          csv += `${a.licensePlate},${a.make},${a.model},${a.acquisitionCost},${a.totalOperationalCost},${a.totalRevenue},${a.fuelEfficiency},${a.roi}\n`
        })
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="vehicle_analytics.csv"'
          }
        })
      }

      return NextResponse.json({ analytics })
    }

    return NextResponse.json({ error: 'Endpoint Not Found' }, { status: 404 })
  } catch (error) {
    console.error('API Router GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// =================================================================
// POST ROUTE DISPATCHER
// =================================================================
export async function POST(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  try {
    const { path } = await params
    if (!path || path.length === 0) {
      return NextResponse.json({ error: 'Endpoint Not Found' }, { status: 404 })
    }

    const resource = path[0]
    const subResource = path[1]

    // 1. AUTH - LOGIN (api/auth/login)
    if (resource === 'auth' && subResource === 'login') {
      const { email, password } = await request.json()
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
      }

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      if (user.isLocked) {
        return NextResponse.json({ error: 'Account locked after 5 failed attempts.' }, { status: 403 })
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        const newFailedAttempts = user.failedAttempts + 1
        const shouldLock = newFailedAttempts >= 5
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: newFailedAttempts, isLocked: shouldLock }
        })

        if (shouldLock) {
          return NextResponse.json({ error: 'Invalid credentials. Account locked after 5 failed attempts.' }, { status: 403 })
        }
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      if (user.failedAttempts > 0) {
        await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0 } })
      }

      const token = signToken({ userId: user.id, email: user.email, role: user.role })
      const response = NextResponse.json({
        message: 'Login successful',
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      })

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      })
      return response
    }

    // 2. AUTH - LOGOUT (api/auth/logout)
    if (resource === 'auth' && subResource === 'logout') {
      const response = NextResponse.json({ message: 'Logged out successfully' })
      response.cookies.delete('auth_token')
      return response
    }

    // 3. AUTH - REGISTER (api/auth/register)
    if (resource === 'auth' && subResource === 'register') {
      const { email, password, name, role } = await request.json()
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
      }

      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const userRole = role === 'ADMIN' ? 'ADMIN' : 'OPERATOR'

      const user = await prisma.user.create({
        data: { email, name: name || null, password: hashedPassword, role: userRole }
      })

      const token = signToken({ userId: user.id, email: user.email, role: user.role })
      const response = NextResponse.json(
        { message: 'Registration successful', user: { id: user.id, email: user.email, name: user.name, role: user.role } },
        { status: 201 }
      )

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      })
      return response
    }

    // Standard session validation middleware for resource creation
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 4. DRIVERS - CREATE (api/drivers)
    if (resource === 'drivers') {
      const { firstName, lastName, licenseNo, licenseExpiry, status, email, phone, licenseCategory, safetyScore } = await request.json()
      if (!firstName || !lastName || !licenseNo || !licenseExpiry || !email || !phone) {
        return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
      }

      const existingLicense = await prisma.driver.findUnique({ where: { licenseNo } })
      if (existingLicense) return NextResponse.json({ error: 'Driver with this license number already exists' }, { status: 400 })

      const existingEmail = await prisma.driver.findUnique({ where: { email } })
      if (existingEmail) return NextResponse.json({ error: 'Driver with this email already exists' }, { status: 400 })

      const driver = await prisma.driver.create({
        data: { firstName, lastName, licenseNo, licenseExpiry: new Date(licenseExpiry), status: status || 'Available', email, phone, licenseCategory: licenseCategory || 'C', safetyScore: safetyScore ? parseFloat(safetyScore) : 100.0 }
      })
      return NextResponse.json({ driver }, { status: 201 })
    }

    // 5. EXPENSES - LOG (api/expenses)
    if (resource === 'expenses') {
      const { tripId, category, amount, date, description } = await request.json()
      if (!category || amount === undefined || !date || !description) {
        return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
      }

      if (tripId) {
        const trip = await prisma.trip.findUnique({ where: { id: tripId } })
        if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
      }

      const log = await prisma.expenseLog.create({
        data: { tripId: tripId || null, category, amount: parseFloat(amount), date: new Date(date), description }
      })
      return NextResponse.json({ log }, { status: 201 })
    }

    // 6. FUEL - LOG (api/fuel)
    if (resource === 'fuel') {
      const { vehicleId, tripId, fillDate, liters, cost, odometer } = await request.json()
      if (!vehicleId || !fillDate || liters === undefined || cost === undefined || odometer === undefined) {
        return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
      }

      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
      if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

      const log = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const createdLog = await tx.fuelLog.create({
          data: { vehicleId, tripId: tripId || null, fillDate: new Date(fillDate), liters: parseFloat(liters), cost: parseFloat(cost), odometer: parseFloat(odometer) }
        })
        if (parseFloat(odometer) > vehicle.odometer) {
          await tx.vehicle.update({ where: { id: vehicleId }, data: { odometer: parseFloat(odometer) } })
        }
        return createdLog
      })
      return NextResponse.json({ log }, { status: 201 })
    }

    // 7. MAINTENANCE - BOOK (api/maintenance)
    if (resource === 'maintenance') {
      const { vehicleId, serviceType, description, cost, startDate, endDate, status } = await request.json()
      if (!vehicleId || !serviceType || !description || cost === undefined || !startDate) {
        return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
      }

      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
      if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

      const logStatus = status || 'SCHEDULED'
      const log = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const createdLog = await tx.maintenanceLog.create({
          data: { vehicleId, serviceType, description, cost: parseFloat(cost), startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, status: logStatus }
        })
        // Automatically switch vehicle status to In Shop
        await tx.vehicle.update({ where: { id: vehicleId }, data: { status: 'In Shop' } })
        return createdLog
      })
      return NextResponse.json({ log }, { status: 201 })
    }

    // 8. TRIPS - CREATE (api/trips)
    if (resource === 'trips') {
      const { driverId, vehicleId, source, destination, cargoWeight, plannedDistance, scheduledStart, scheduledEnd, distance, revenue } = await request.json()
      if (!driverId || !vehicleId || !source || !destination || !scheduledStart || !scheduledEnd) {
        return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
      }

      const start = new Date(scheduledStart)
      const end = new Date(scheduledEnd)
      if (start >= end) return NextResponse.json({ error: 'Scheduled start must be before scheduled end' }, { status: 400 })

      const driver = await prisma.driver.findUnique({ where: { id: driverId } })
      if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })

      if (new Date(driver.licenseExpiry) < new Date()) {
        return NextResponse.json({ error: `Driver license expired on ${new Date(driver.licenseExpiry).toLocaleDateString()}` }, { status: 400 })
      }

      if (driver.status === 'Suspended') return NextResponse.json({ error: 'Driver is currently suspended' }, { status: 400 })

      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
      if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

      if (vehicle.status === 'In Shop' || vehicle.status === 'Retired') {
        return NextResponse.json({ error: `Vehicle is currently in status: ${vehicle.status}` }, { status: 400 })
      }

      const driverConflict = await prisma.trip.findFirst({
        where: { driverId, status: { in: ['Draft', 'Dispatched'] }, scheduledStart: { lt: end }, scheduledEnd: { gt: start } }
      })
      if (driverConflict) return NextResponse.json({ error: 'Driver is double-booked during this time range' }, { status: 400 })

      const vehicleConflict = await prisma.trip.findFirst({
        where: { vehicleId, status: { in: ['Draft', 'Dispatched'] }, scheduledStart: { lt: end }, scheduledEnd: { gt: start } }
      })
      if (vehicleConflict) return NextResponse.json({ error: 'Vehicle is double-booked during this time range' }, { status: 400 })

      const trip = await prisma.trip.create({
        data: { driverId, vehicleId, source, destination, cargoWeight: cargoWeight ? parseFloat(cargoWeight) : null, plannedDistance: plannedDistance ? parseFloat(plannedDistance) : null, scheduledStart: start, scheduledEnd: end, status: 'Draft', distance: distance ? parseFloat(distance) : null, revenue: revenue ? parseFloat(revenue) : 0.0 }
      })
      return NextResponse.json({ trip }, { status: 201 })
    }

    // 9. VEHICLES - CREATE (api/vehicles)
    if (resource === 'vehicles') {
      const { licensePlate, make, model, year, status, type, capacity, fuelType, odometer, acquisitionCost, region } = await request.json()
      if (!licensePlate || !make || !model || !year || !type || !capacity || !fuelType) {
        return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
      }

      const existing = await prisma.vehicle.findUnique({ where: { licensePlate } })
      if (existing) return NextResponse.json({ error: 'Vehicle with this license plate already exists' }, { status: 400 })

      const vehicle = await prisma.vehicle.create({
        data: { licensePlate, make, model, year: parseInt(year), status: status || 'Available', type, capacity: parseInt(capacity), fuelType, odometer: parseFloat(odometer || '0'), acquisitionCost: parseFloat(acquisitionCost || '0'), region: region || null }
      })
      return NextResponse.json({ vehicle }, { status: 201 })
    }

    return NextResponse.json({ error: 'Endpoint Not Found' }, { status: 404 })
  } catch (error) {
    console.error('API Router POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// =================================================================
// PUT ROUTE DISPATCHER
// =================================================================
export async function PUT(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  try {
    const { path } = await params
    if (!path || path.length < 2) {
      return NextResponse.json({ error: 'Endpoint Not Found' }, { status: 404 })
    }

    const resource = path[0]
    const id = path[1]

    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. DRIVERS - UPDATE (api/drivers/[id])
    if (resource === 'drivers') {
      const { firstName, lastName, licenseNo, licenseExpiry, status, email, phone, licenseCategory, safetyScore } = await request.json()

      if (licenseNo) {
        const existing = await prisma.driver.findFirst({ where: { licenseNo, NOT: { id } } })
        if (existing) return NextResponse.json({ error: 'Another driver with this license number already exists' }, { status: 400 })
      }

      if (email) {
        const existing = await prisma.driver.findFirst({ where: { email, NOT: { id } } })
        if (existing) return NextResponse.json({ error: 'Another driver with this email already exists' }, { status: 400 })
      }

      const data: any = {}
      if (firstName) data.firstName = firstName
      if (lastName) data.lastName = lastName
      if (licenseNo) data.licenseNo = licenseNo
      if (licenseExpiry) data.licenseExpiry = new Date(licenseExpiry)
      if (status) data.status = status
      if (email) data.email = email
      if (phone) data.phone = phone
      if (licenseCategory) data.licenseCategory = licenseCategory
      if (safetyScore !== undefined) data.safetyScore = parseFloat(safetyScore)

      const driver = await prisma.driver.update({ where: { id }, data })
      return NextResponse.json({ driver })
    }

    // 2. MAINTENANCE - UPDATE (api/maintenance/[id])
    if (resource === 'maintenance') {
      const currentLog = await prisma.maintenanceLog.findUnique({ where: { id } })
      if (!currentLog) return NextResponse.json({ error: 'Maintenance log not found' }, { status: 404 })

      const { serviceType, description, cost, startDate, endDate, status } = await request.json()

      const updateData: any = {}
      if (serviceType) updateData.serviceType = serviceType
      if (description) updateData.description = description
      if (cost !== undefined) updateData.cost = parseFloat(cost)
      if (startDate) updateData.startDate = new Date(startDate)
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

      const log = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (status && status !== currentLog.status) {
          updateData.status = status
          if (status === 'IN_PROGRESS') {
            await tx.vehicle.update({ where: { id: currentLog.vehicleId }, data: { status: 'MAINTENANCE' } })
          } else if (status === 'COMPLETED') {
            updateData.endDate = updateData.endDate || new Date()
            await tx.vehicle.update({ where: { id: currentLog.vehicleId }, data: { status: 'ACTIVE' } })
          }
        }
        return tx.maintenanceLog.update({ where: { id }, data: updateData, include: { vehicle: true } })
      })
      return NextResponse.json({ log })
    }

    // 3. TRIPS - UPDATE (api/trips/[id])
    if (resource === 'trips') {
      const currentTrip = await prisma.trip.findUnique({ where: { id } })
      if (!currentTrip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

      const { driverId, vehicleId, source, destination, route, cargoWeight, plannedDistance, scheduledStart, scheduledEnd, status, distance, revenue } = await request.json()

      const start = scheduledStart ? new Date(scheduledStart) : new Date(currentTrip.scheduledStart)
      const end = scheduledEnd ? new Date(scheduledEnd) : new Date(currentTrip.scheduledEnd)
      if (start >= end) return NextResponse.json({ error: 'Scheduled start must be before scheduled end' }, { status: 400 })

      const dId = driverId || currentTrip.driverId
      const vId = vehicleId || currentTrip.vehicleId

      if (driverId || scheduledStart || scheduledEnd) {
        const driver = await prisma.driver.findUnique({ where: { id: dId } })
        if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
        if (new Date(driver.licenseExpiry) < new Date()) {
          return NextResponse.json({ error: 'Driver license has expired' }, { status: 400 })
        }
        const driverConflict = await prisma.trip.findFirst({
          where: { id: { not: id }, driverId: dId, status: { in: ['Draft', 'Dispatched'] }, scheduledStart: { lt: end }, scheduledEnd: { gt: start } }
        })
        if (driverConflict) return NextResponse.json({ error: 'Driver is double-booked for another trip in this range' }, { status: 400 })
      }

      if (vehicleId || scheduledStart || scheduledEnd) {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: vId } })
        if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
        if (vehicle.status === 'In Shop' || vehicle.status === 'Retired') {
          return NextResponse.json({ error: `Vehicle is currently in ${vehicle.status} status` }, { status: 400 })
        }
        const vehicleConflict = await prisma.trip.findFirst({
          where: { id: { not: id }, vehicleId: vId, status: { in: ['Draft', 'Dispatched'] }, scheduledStart: { lt: end }, scheduledEnd: { gt: start } }
        })
        if (vehicleConflict) return NextResponse.json({ error: 'Vehicle is double-booked for another trip in this range' }, { status: 400 })
      }

      const updateData: any = {}
      if (source) updateData.source = source
      if (destination) updateData.destination = destination
      if (route) updateData.route = route
      if (cargoWeight !== undefined) updateData.cargoWeight = parseFloat(cargoWeight)
      if (plannedDistance !== undefined) updateData.plannedDistance = parseFloat(plannedDistance)
      if (scheduledStart) updateData.scheduledStart = start
      if (scheduledEnd) updateData.scheduledEnd = end
      if (driverId) updateData.driverId = driverId
      if (vehicleId) updateData.vehicleId = vehicleId
      if (distance !== undefined) updateData.distance = parseFloat(distance)
      if (revenue !== undefined) updateData.revenue = parseFloat(revenue)

      if (status && status !== currentTrip.status) {
        updateData.status = status
        if (status === 'Dispatched') {
          updateData.actualStart = new Date()
          await prisma.driver.update({ where: { id: dId }, data: { status: 'On Trip' } })
          await prisma.vehicle.update({ where: { id: vId }, data: { status: 'On Trip' } })
        } else if (status === 'Completed') {
          updateData.actualEnd = new Date()
          await prisma.driver.update({ where: { id: dId }, data: { status: 'Available' } })
          await prisma.vehicle.update({ where: { id: vId }, data: { status: 'Available' } })
          if (distance) {
            const tripDistance = parseFloat(distance)
            await prisma.vehicle.update({ where: { id: vId }, data: { odometer: { increment: tripDistance } } })
          }
        } else if (status === 'Cancelled') {
          await prisma.driver.update({ where: { id: dId }, data: { status: 'Available' } })
          await prisma.vehicle.update({ where: { id: vId }, data: { status: 'Available' } })
        }
      }

      const trip = await prisma.trip.update({
        where: { id },
        data: updateData,
        include: { driver: true, vehicle: true }
      })
      return NextResponse.json({ trip })
    }

    // 4. VEHICLES - UPDATE (api/vehicles/[id])
    if (resource === 'vehicles') {
      const { licensePlate, make, model, year, status, type, capacity, fuelType, odometer, acquisitionCost, region } = await request.json()

      if (licensePlate) {
        const existing = await prisma.vehicle.findFirst({ where: { licensePlate, NOT: { id } } })
        if (existing) return NextResponse.json({ error: 'Another vehicle with this license plate already exists' }, { status: 400 })
      }

      const data: any = {}
      if (licensePlate) data.licensePlate = licensePlate
      if (make) data.make = make
      if (model) data.model = model
      if (year) data.year = parseInt(year)
      if (status) data.status = status
      if (type) data.type = type
      if (capacity) data.capacity = parseInt(capacity)
      if (fuelType) data.fuelType = fuelType
      if (odometer !== undefined) data.odometer = parseFloat(odometer)
      if (acquisitionCost !== undefined) data.acquisitionCost = parseFloat(acquisitionCost)
      if (region) data.region = region

      const vehicle = await prisma.vehicle.update({ where: { id }, data })
      return NextResponse.json({ vehicle })
    }

    return NextResponse.json({ error: 'Endpoint Not Found' }, { status: 404 })
  } catch (error) {
    console.error('API Router PUT error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// =================================================================
// DELETE ROUTE DISPATCHER
// =================================================================
export async function DELETE(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  try {
    const { path } = await params
    if (!path || path.length < 2) {
      return NextResponse.json({ error: 'Endpoint Not Found' }, { status: 404 })
    }

    const resource = path[0]
    const id = path[1]

    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // 1. DRIVERS - DELETE (api/drivers/[id])
    if (resource === 'drivers') {
      const activeTrips = await prisma.trip.findFirst({ where: { driverId: id, status: { in: ['ACTIVE', 'SCHEDULED'] } } })
      if (activeTrips) return NextResponse.json({ error: 'Cannot delete driver with active or scheduled trips' }, { status: 400 })

      await prisma.trip.deleteMany({ where: { driverId: id } })
      await prisma.driver.delete({ where: { id } })
      return NextResponse.json({ message: 'Driver deleted successfully' })
    }

    // 2. MAINTENANCE - DELETE (api/maintenance/[id])
    if (resource === 'maintenance') {
      const log = await prisma.maintenanceLog.findUnique({ where: { id } })
      if (!log) return NextResponse.json({ error: 'Maintenance log not found' }, { status: 404 })

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (log.status === 'IN_PROGRESS') {
          await tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'ACTIVE' } })
        }
        await tx.maintenanceLog.delete({ where: { id } })
      })
      return NextResponse.json({ message: 'Maintenance log deleted successfully' })
    }

    // 3. TRIPS - DELETE (api/trips/[id])
    if (resource === 'trips') {
      const trip = await prisma.trip.findUnique({ where: { id } })
      if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

      await prisma.fuelLog.deleteMany({ where: { tripId: id } })
      await prisma.expenseLog.deleteMany({ where: { tripId: id } })

      if (trip.status === 'ACTIVE') {
        await prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } })
      }
      await prisma.trip.delete({ where: { id } })
      return NextResponse.json({ message: 'Trip deleted successfully' })
    }

    // 4. VEHICLES - DELETE (api/vehicles/[id])
    if (resource === 'vehicles') {
      const activeTrips = await prisma.trip.findFirst({ where: { vehicleId: id, status: { in: ['ACTIVE', 'SCHEDULED'] } } })
      if (activeTrips) return NextResponse.json({ error: 'Cannot delete vehicle with active or scheduled trips' }, { status: 400 })

      await prisma.maintenanceLog.deleteMany({ where: { vehicleId: id } })
      await prisma.fuelLog.deleteMany({ where: { vehicleId: id } })
      await prisma.trip.deleteMany({ where: { vehicleId: id } })
      await prisma.vehicle.delete({ where: { id } })
      return NextResponse.json({ message: 'Vehicle deleted successfully' })
    }

    return NextResponse.json({ error: 'Endpoint Not Found' }, { status: 404 })
  } catch (error) {
    console.error('API Router DELETE error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
