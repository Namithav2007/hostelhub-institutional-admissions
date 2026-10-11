# HostelHub — Institutional Hostel Management System (MERN Stack)

HostelHub is a production-grade, centralized digital platform built on the full MERN Stack (MongoDB / Express.js / React / Node.js) designed to streamline residential hostel operations for colleges and universities.

---

## 1. Features & Core Modules

- **Module A: Hostel Admissions**
  - Online student hostel application form with academic, guardian, preference, and document upload records.
  - Review, Approve, Reject, and direct 1-click Bed Allocation workflow for authorized staff.
  - Automated duplicate application prevention and live status history.

- **Module B: Room Allocation & Capacity Tracking**
  - Hierarchical inventory of Hostels, Blocks, Floors, Rooms, and Individual Beds.
  - Hard constraint capacity enforcement: prevents allocating beyond room capacity.
  - Uniqueness constraint: prevents duplicate active room allocations for the same student.
  - Student Bed Transfer and Vacating workflows with automated occupancy recalculation.

- **Module C: Fee Tracking & Electronic Receipts**
  - Comprehensive fee records for semester residency, mess charges, and maintenance dues.
  - Dual payment recording: online payment gateway simulation and manual hostel cash counter.
  - Printable official electronic receipts with institutional crest, unique transaction references, and authorization seal.
  - Administrative financial collection overview and outstanding balance monitoring.

- **Module D: Maintenance Requests**
  - Student complaint lodge portal across Electrical, Plumbing, Wi-Fi, Carpentry, Housekeeping, and Appliances.
  - Priority levels (Low, Medium, High, Urgent) and 4-stage lifecycle: `Submitted → Assigned → In Progress → Resolved`.
  - Warden assignment to estate contractors and technicians.

- **Module E: Visitor Management & Digital QR Passes**
  - Visitor registration with host resident, purpose, and check-in timestamp.
  - Real-time digital QR code gate passes scannable by campus security.
  - Check-in and checkout logs for security auditing.

- **Module F: Occupancy Monitoring & Analytics**
  - Live bed census calculated from database records: Total Hostels, Rooms, Beds, Occupied, Vacant, and Maintenance.
  - Detailed hostel-wise and room-type sharing distributions.
  - Printable analytics report for campus administration.

- **Security & Role-Based Access Control (RBAC)**
  - JWT token authentication and bcrypt password hashing.
  - Role-based route guards for **Student**, **Warden**, **Administrator**, and **Finance Staff**.
  - System-wide audit trail recording actor, action, timestamp, IP, and event details.

---

## 2. Technology Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Vite, Motion.
- **Backend**: Node.js, Express.js REST API.
- **Database**: Document datastore supporting MongoDB Atlas via `MONGODB_URI` with embedded persistent filesystem fallback in `/data/db/`.
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, role-based authorization middleware.
- **QR Engine**: `qrcode` vector generation for visitor passes.

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm or yarn

### Installation
```bash
# Clone the repository and navigate into project directory
git clone <repo-url>
cd hostel-management

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```env
PORT=3000
JWT_SECRET=institutional-hostel-jwt-secret-key-prod-2026
# Optional: Set MongoDB Atlas URI (if omitted, uses persistent embedded document database in /data/db/)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/hostel_db?retryWrites=true&w=majority
```

### Running the Application
```bash
# Start development server (Full-Stack Express + Vite)
npm run dev

# Open in browser:
http://localhost:3000
```

---

## 4. Default Seed Test Accounts

The system automatically initializes test accounts upon first startup:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campus.edu` | `admin123` | Dr. Rajesh Sharma (Chief Admin) |
| **Warden** | `warden@campus.edu` | `warden123` | Prof. Anita Roy (Senior Warden) |
| **Finance Staff** | `finance@campus.edu` | `finance123` | Mr. Vikram Mehta (Accounts Officer) |
| **Student** | `student@campus.edu` | `student123` | Rohan Verma (2024CS1042, Room A-204) |
| **Student (Female)** | `priya@campus.edu` | `student123` | Priya Nair (2024EC1088, Room B-102) |
| **Student (Applicant)** | `arjun@campus.edu` | `student123` | Arjun Patel (Application Pending) |

*You can also click the 1-Click Role Switcher in the top right profile menu or login screen to immediately test different access permissions.*

---

## 5. Deployment Instructions

### Production Build
```bash
# Build the client bundle
npm run build

# Start the full-stack server
npm run start
```
The server will automatically serve the production assets from `/dist` on port 3000 or the `PORT` specified in `.env`.
