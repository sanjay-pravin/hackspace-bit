# AI Campus Event Assistant

### Vision Builders | HACKSPACE Hackathon

A centralized, full-stack, responsive campus event discovery, registration, team formation, digital participant pass, and live QR attendance verification platform.

---

> [!IMPORTANT]
> **Strict System Architecture**: This platform intentionally contains **no chatbot, chat interface, conversational AI, messaging assistant, or AI chat API**. It is built from the ground up to solve campus logistics: event discovery, role-based registration, team codes, verifiable digital passes with QR codes, real-time camera check-in, and organizer administration.

---

## 🚀 Key Features

### 1. Public Event Discovery
- **Centralized Event Portal**: Search by title, organizer, description, or venue.
- **Faceted Filters**: Multi-criteria filtering by category (*Hackathons, Technical Workshops, Coding Competitions, Seminars, Cultural Events, Sports Events, Innovation Challenges*), format (*In-Person, Virtual, Hybrid*), and real-time availability (*Open, Closing Soon, Full*).
- **Comprehensive Event Details**: Detailed rules, eligibility criteria, schedules, venue details, and capacity progress bars.

### 2. Event Registration & Team Management
- **Smart Registration Engine**: Real-time database checks that prevent duplicate registrations, enforce capacity caps, and observe registration deadlines.
- **Team Collaboration**: Squad formation with unique shareable invite codes (e.g. `NK-7782`), roster inspection, and minimum/maximum team size enforcement.
- **Cancellations**: Instant cancellation with automatic return of seat capacity to the public pool.

### 3. Verifiable Digital Participant Passes
- **Tamper-Evident Digital Pass**: Contains website branding, student name, roll number, event date, venue, unique Registration ID (e.g. `ACE-2026-X89K2L`), and team affiliation.
- **High-Entropy QR Code**: Generated dynamically with verification payload.
- **Print / PDF Ready**: Dedicated `@media print` styling for generating clean physical passes or saving as PDF.

### 4. Real-time Attendance & Camera Scanner
- **Live Camera QR Scanner**: Scans student passes directly using browser/mobile webcams (`html5-qrcode`).
- **Manual Registration ID Lookup**: Instant check-in fallback for staff.
- **Intelligent Gate Verification**:
  - Confirms valid active passes.
  - Rejects cancelled or forged registrations.
  - Detects and halts duplicate check-in attempts with exact previous timestamp.
  - Logs staff ID, verification method, and timestamp in real-time.

### 5. Administrator Suite & Analytics
- **Live Telemetry Dashboard**: Total events, confirmed passes, checked-in counts, and check-in rates calculated from database tables.
- **Recharts Analytics**: Interactive category distribution and capacity metrics.
- **Event Management**: Create, edit, publish/unpublish, and cancel events.
- **Participant Directory & CSV Export**: One-click export of registered attendee rosters to CSV for academic accreditation.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18+ with Vite (JavaScript / JSX) |
| **Styling** | Tailwind CSS with deep navy, indigo, and cyan design tokens |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **QR Engine** | `qrcode.react` (Pass Generation) & `html5-qrcode` (Live Camera Verification) |
| **Backend & DB**| Supabase with PostgreSQL, Row Level Security (RLS), and Triggers |
| **Auth** | Supabase Auth with Role-Based Access Control (`student` vs `admin`) |

---

## 👥 Four-Member Team Division

1. **Member 1 — Frontend & UI/UX**:
   - Landing page hero, search, category navigation, and responsive design tokens.
   - Public event discovery grid and faceted filtering controls.
   - Shared component design system and accessibility focus states.

2. **Member 2 — Backend & Database**:
   - Supabase configuration, schema creation (`supabase/migrations/20261005_schema.sql`).
   - Row Level Security (RLS) policies and security triggers.
   - Dual-mode data access layer and seed dataset (`supabase/seed.sql`).

3. **Member 3 — Registration & Participant Features**:
   - Student dashboard, active registrations, and team formation logic.
   - Digital participant pass ticket generation with encrypted QR payloads.
   - In-app notification center and cancellation workflows.

4. **Member 4 — Admin, Attendance, Testing & Deployment**:
   - Executive organizer dashboard with Recharts visual telemetry.
   - Live camera QR attendance verification and duplicate check-in prevention engine.
   - Participant roster CSV exporter and deployment verification.

---

## ⚡ Quick Evaluation & Demonstration

To make evaluation instantaneous for hackathon jury members, the app includes **1-Click Quick Demo Accounts**:

1. **Demo Student**: `alex.student@campus.edu` (Alex Rivera)
   - Pre-registered for HACKSPACE 2026 with team *Neural Knights*.
   - Has active digital participant passes with scannable QR codes ready to inspect.
2. **Demo Admin**: `sarah.admin@campus.edu` (Dr. Sarah Jenkins)
   - Lead organizer access to the Admin Dashboard, Event Management, Participant Directory, and Live QR Attendance Scanner.

> **Role Switcher**: Click the **Role: Student / Admin (switch)** button in the top navigation bar at any time to toggle between the student and organizer experiences.

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Live Supabase)
Copy `.env.example` to `.env` and configure your Supabase project keys:
```bash
cp .env.example .env
```
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*Note: If environment keys are omitted, the application operates on its built-in verified persistent local database populated with realistic seed data.*

### 3. Run Database Migrations (Supabase SQL Editor)
Execute the SQL scripts located at:
- Schema & Policies: `supabase/migrations/20261005_schema.sql`
- Seed Data: `supabase/seed.sql`

### 4. Start Development Server
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```