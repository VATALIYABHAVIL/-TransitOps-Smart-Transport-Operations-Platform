# Transitops Fleet Management Console

Transitops is a premium, high-fidelity fleet management and operations tracking console built with Next.js, Tailwind CSS v4, and Prisma ORM (SQLite). The system features real-time telemetry metrics, automated license expiry alerts, cost analysis charts, and an executive PDF reports hub.

---

## 🌟 Key Features

* **Premium Glassmorphic UI**: High-fidelity dark theme utilizing hover reflections, micro-animations, and a zero-layout-shift hover-expand sidebar.
* **Driver & License Management**: 
  - Central ledger for drivers, vehicle status, and schedules.
  - License expiry monitoring showing active alerts for licenses expired or expiring within 30 days.
  - One-click backend reminders dispatch that logs operational alert actions to `reminders.log`.
* **Operations Ledger**:
  - Trip logs with route maps, distance metrics, and dispatch tools.
  - Maintenance scheduler to record and manage service types, costs, and statuses.
  - Fuel log book tracking fill dates, liters, odometer readings, and costs in Indian Rupees (`₹`).
* **Visual Analytics & Reporting**:
  - Live cost breakdowns and area graphs displaying expense trends over the last 30 days.
  - Dedicated **Reports & Export Hub** with print-ready executive layouts.
  - Client-side PDF generator (`html2canvas` + `jsPDF`) compiling high-resolution operations summaries.

---

## 🛠️ Technology Stack

* **Frontend Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
* **Styling**: Tailwind CSS v4 (with standard utility layers and custom transitions in `globals.css`)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Charts**: [Recharts](https://recharts.org/)
* **ORM & Database**: [Prisma ORM](https://www.prisma.io/) with an embedded SQLite database
* **PDF Exporters**: `jspdf` & `html2canvas`

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Database Sync & Seeding
Prepare the SQLite database schema and seed the initial operational dataset:
```bash
# Push database schema
npx prisma db push --force-reset

# Seed demo users, drivers, vehicles, and logs
npx prisma db seed
```

### 3. Run Development Server
Start the Next.js local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the console.

---

## 🔐 Demo Credentials

Login to the platform using one of the seeded operational profiles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@transitops.com` | `admin123` |
| **Operator** | `operator@transitops.com` | `operator123` |

---

## 📂 Project Directory Structure

```text
├── prisma/
│   ├── dev.db              # SQLite Database File
│   ├── schema.prisma       # Prisma Database Models Schema
│   └── seed.ts             # Default Seeding Script
├── src/
│   ├── app/
│   │   ├── (dashboard)/    # Dashboard layout and tab rendering views
│   │   ├── api/            # REST API Routes dispatcher
│   │   ├── login/          # Authorization login view
│   │   ├── globals.css     # Glassmorphism utility styles and animations
│   │   └── layout.tsx      # Base app html wrapper
│   ├── components/
│   │   └── Sidebar.tsx     # Hover-expand zero-layout-shift Navigation
│   ├── context/
│   │   └── AuthContext.tsx # User Authentication State Manager
│   └── lib/
│       ├── auth.ts         # JWT Sign and Verification Helpers
│       └── prisma.ts       # Singleton PrismaClient client
└── reminders.log           # Output log for driver email reminder dispatches
```

---

## 📄 License Expiry Checks & Reminders
When reminders are triggered (either individually or in bulk) from the Dashboard alerts widget, the backend logs a full simulated operational email payload to `reminders.log` in the root of the project workspace. 
You can inspect this log to review recipient details, license expiration warnings, and active operational restrictions.
