import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear database
  await prisma.expenseLog.deleteMany({})
  await prisma.fuelLog.deleteMany({})
  await prisma.maintenanceLog.deleteMany({})
  await prisma.trip.deleteMany({})
  await prisma.driver.deleteMany({})
  await prisma.vehicle.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Cleared existing data.')

  // Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const operatorPasswordHash = await bcrypt.hash('operator123', 10)

  await prisma.user.create({
    data: {
      email: 'admin@transitops.com',
      name: 'System Admin',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  })

  await prisma.user.create({
    data: {
      email: 'operator@transitops.com',
      name: 'John Operator',
      password: operatorPasswordHash,
      role: 'OPERATOR',
    },
  })

  console.log('Seeded Users.')

  // Create Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      licensePlate: 'TX-101-BUS',
      make: 'Volvo',
      model: '9700',
      year: 2021,
      status: 'ACTIVE',
      type: 'BUS',
      capacity: 55,
      fuelType: 'DIESEL',
      odometer: 45200.5,
    },
  })

  const vehicle2 = await prisma.vehicle.create({
    data: {
      licensePlate: 'TX-202-VAN',
      make: 'Ford',
      model: 'Transit',
      year: 2022,
      status: 'ACTIVE',
      type: 'VAN',
      capacity: 15,
      fuelType: 'PETROL',
      odometer: 18450.2,
    },
  })

  const vehicle3 = await prisma.vehicle.create({
    data: {
      licensePlate: 'TX-303-TRK',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2020,
      status: 'MAINTENANCE',
      type: 'TRUCK',
      capacity: 3,
      fuelType: 'DIESEL',
      odometer: 125300.8,
    },
  })

  const vehicle4 = await prisma.vehicle.create({
    data: {
      licensePlate: 'TX-404-SED',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      status: 'ACTIVE',
      type: 'SEDAN',
      capacity: 5,
      fuelType: 'ELECTRIC',
      odometer: 12100.0,
    },
  })

  console.log('Seeded Vehicles.')

  // Create Drivers
  const driver1 = await prisma.driver.create({
    data: {
      firstName: 'David',
      lastName: 'Miller',
      licenseNo: 'DL-987654321',
      licenseExpiry: new Date('2027-12-31T00:00:00Z'),
      status: 'AVAILABLE',
      email: 'david.miller@transitops.com',
      phone: '+1-555-0199',
    },
  })

  const driver2 = await prisma.driver.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Connor',
      licenseNo: 'DL-123456789',
      licenseExpiry: new Date('2028-06-15T00:00:00Z'),
      status: 'AVAILABLE',
      email: 'sarah.connor@transitops.com',
      phone: '+1-555-0188',
    },
  })

  const driver3 = await prisma.driver.create({
    data: {
      firstName: 'James',
      lastName: 'Smith',
      licenseNo: 'DL-555666777',
      // Expired license for validation testing
      licenseExpiry: new Date('2026-05-01T00:00:00Z'),
      status: 'SUSPENDED',
      email: 'james.smith@transitops.com',
      phone: '+1-555-0177',
    },
  })

  console.log('Seeded Drivers.')

  // Create completed and scheduled Trips
  const trip1 = await prisma.trip.create({
    data: {
      driverId: driver1.id,
      vehicleId: vehicle1.id,
      route: 'Dallas Hub to Austin Station',
      scheduledStart: new Date('2026-07-10T08:00:00Z'),
      scheduledEnd: new Date('2026-07-10T12:00:00Z'),
      actualStart: new Date('2026-07-10T08:05:00Z'),
      actualEnd: new Date('2026-07-10T11:55:00Z'),
      status: 'COMPLETED',
      distance: 310.5,
    },
  })

  const trip2 = await prisma.trip.create({
    data: {
      driverId: driver2.id,
      vehicleId: vehicle2.id,
      route: 'Local Delivery Loop A',
      scheduledStart: new Date('2026-07-11T10:00:00Z'),
      scheduledEnd: new Date('2026-07-11T16:00:00Z'),
      actualStart: new Date('2026-07-11T10:02:00Z'),
      actualEnd: new Date('2026-07-11T15:45:00Z'),
      status: 'COMPLETED',
      distance: 180.2,
    },
  })

  const trip3 = await prisma.trip.create({
    data: {
      driverId: driver1.id,
      vehicleId: vehicle4.id,
      route: 'Executive Shuttle Service',
      scheduledStart: new Date('2026-07-13T09:00:00Z'),
      scheduledEnd: new Date('2026-07-13T11:00:00Z'),
      status: 'SCHEDULED',
    },
  })

  console.log('Seeded Trips.')

  // Create Maintenance logs
  const maint1 = await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicle3.id,
      serviceType: 'ENGINE_REPAIR',
      description: 'Transmission gear replacement and fluid flush.',
      cost: 1550.0,
      startDate: new Date('2026-07-08T09:00:00Z'),
      status: 'IN_PROGRESS',
    },
  })

  const maint2 = await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicle1.id,
      serviceType: 'OIL_CHANGE',
      description: 'Regular engine oil and filter change.',
      cost: 120.0,
      startDate: new Date('2026-07-01T08:00:00Z'),
      endDate: new Date('2026-07-01T10:00:00Z'),
      status: 'COMPLETED',
    },
  })

  console.log('Seeded Maintenance Logs.')

  // Create Fuel logs
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle1.id,
      tripId: trip1.id,
      fillDate: new Date('2026-07-10T12:05:00Z'),
      liters: 75.4,
      cost: 110.5,
      odometer: 45200.5,
    },
  })

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle2.id,
      tripId: trip2.id,
      fillDate: new Date('2026-07-11T16:00:00Z'),
      liters: 30.2,
      cost: 45.0,
      odometer: 18450.2,
    },
  })

  console.log('Seeded Fuel Logs.')

  // Create Expense logs
  await prisma.expenseLog.create({
    data: {
      tripId: trip1.id,
      category: 'TOLL',
      amount: 22.5,
      date: new Date('2026-07-10T10:00:00Z'),
      description: 'Highway 130 Express Tolls',
    },
  })

  await prisma.expenseLog.create({
    data: {
      tripId: trip1.id,
      category: 'FOOD',
      amount: 15.75,
      date: new Date('2026-07-10T09:30:00Z'),
      description: 'Driver Meal reimbursement',
    },
  })

  await prisma.expenseLog.create({
    data: {
      tripId: trip2.id,
      category: 'PARKING',
      amount: 10.0,
      date: new Date('2026-07-11T12:00:00Z'),
      description: 'Downtown Station Parking fee',
    },
  })

  console.log('Seeded Expense Logs.')
  console.log('Database seeding finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
