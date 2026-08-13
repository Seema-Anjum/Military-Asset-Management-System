# Military Asset Management System (MAMS)

An enterprise-grade full-stack application for tracking military assets (vehicles, weapons, ammunition) across multiple bases — with role-based access control, atomic cross-base transfers, personnel assignments, expenditure tracking, and a full audit trail.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Lucide React, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Neon (raw `pg` driver, parameterized SQL) |
| Auth | JSON Web Tokens (JWT), Bcrypt |

---

## Features

- **JWT Authentication** with role-based login (`ADMIN`, `BASE_COMMANDER`, `LOGISTICS_OFFICER`)
- **Role-Based Access Control (RBAC)** — Base Commanders are automatically scoped to their own base; Logistics Officers are restricted to Purchases/Transfers
- **Dashboard** — dynamically calculated Opening Balance, Net Movement, Closing Balance, and Expenditures (no duplicated stock table — everything is derived from transactional records)
- **Purchases** — log incoming stock per base
- **Transfers** — atomic, transaction-safe cross-base asset movement
- **Assignments** — issue equipment to personnel, with a "Mark Returned" workflow
- **Expenditures** — record permanently consumed assets (e.g. spent ammunition) with a reason
- **User Management** — Admin-only screen to register new accounts and view all registered users
- **Audit Logging** — every mutating action (purchase, transfer, assignment, expenditure) is written to a central `audit_logs` table with actor, action, entity, and JSON details

---

## Project Structure

```
military-asset-management/
├── backend/
│   ├── config/
│   │   ├── db.js            # PostgreSQL connection pool
│   │   ├── initSchema.js    # Creates all tables from sql/schema.sql
│   │   └── seed.js          # Seeds demo data from initDb.sql
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── assetController.js
│   │   ├── purchaseController.js
│   │   ├── transferController.js
│   │   ├── assignmentController.js
│   │   └── expenditureController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── rbacMiddleware.js      # Role checks + base scoping
│   │   └── loggerMiddleware.js    # Audit trail helper
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── assetRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── assignmentRoutes.js
│   │   └── expenditureRoutes.js
│   ├── sql/
│   │   └── schema.sql       # Table definitions
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx       # Role-driven navigation
        │   ├── StatCard.jsx
        │   └── NetMoveModal.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Purchases.jsx
        │   ├── Transfers.jsx
        │   ├── Assignments.jsx
        │   ├── Expenditures.jsx
        │   └── UserManagement.jsx   # Admin only
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js               # Axios instance + JWT interceptor
        └── App.jsx
```

---

## Setup Instructions

### Prerequisites

- Node.js v18+
- PostgreSQL running locally or in the cloud

### 1. Clone & install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```
DATABASE_URL=postgresql://<user>:<password>@<neon_hostname>/<dbname>?sslmode=require
JWT_SECRET=your_jwt_secret_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Create the database

Create an empty PostgreSQL database matching `DB_NAME` above (e.g. `military_asset_management`).

### 4. Create tables and seed demo data

From the `backend` folder:

```bash
node config/initSchema.js
node config/seed.js
```

`initSchema.js` runs `sql/schema.sql` to create all tables. `seed.js` runs `config/initDb.sql` to populate demo bases, equipment types, users, and initial stock.

### 5. Run the app

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`, backend API at `http://localhost:5000/api`.

---

## Test Credentials

| Role | Username | Password | Base |
|---|---|---|---|
| Admin | `admin_user` | `AdminPass123!` | All Bases (Global) |
| Base Commander | `commander_alpha` | `AdminPass123!` | Fort Alpha (Base #1) |
| Logistics Officer | `logistics_officer` | `LogisticsPass123#` | Base #1 / Global Ops |

> Additional Logistics Officer or Base Commander accounts can be created from the **User Management** screen once logged in as Admin.

---

## API Reference

Base URL: `http://localhost:5000/api`. All routes except `/auth/login` require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Log in, returns JWT |
| POST | `/auth/register` | Admin | Create a new user account |
| GET | `/auth/users` | Admin | List all registered users |
| GET | `/assets/dashboard-metrics` | All roles | Opening/Net Movement/Closing/Expended aggregates |
| POST | `/purchases` | Admin, Logistics Officer | Log incoming stock |
| GET | `/purchases` | All roles (base-scoped) | Purchase history |
| POST | `/transfers` | Admin, Logistics Officer, Base Commander | Atomic cross-base transfer |
| GET | `/transfers` | All roles (base-scoped) | Transfer history |
| POST | `/assignments` | Admin, Base Commander | Assign equipment to personnel |
| PATCH | `/assignments/:id/return` | Admin, Base Commander | Mark an assignment as returned |
| GET | `/assignments` | All roles (base-scoped) | Assignment history |
| POST | `/expenditures` | Admin, Base Commander | Log consumed/expended assets |
| GET | `/expenditures` | All roles (base-scoped) | Expenditure history |
| GET | `/health` | Public | DB connectivity check |

---

## RBAC Authorization Matrix

| Action | Admin | Base Commander | Logistics Officer |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ (all bases) | ✅ (own base only) | ✅ (all bases) |
| Log Purchase | ✅ | ❌ | ✅ |
| View Purchases | ✅ | ✅ (own base) | ✅ |
| Create Transfer | ✅ | ✅ (own base) | ✅ |
| View Transfers | ✅ | ✅ (own base) | ✅ |
| Create/Return Assignment | ✅ | ✅ (own base) | ❌ |
| View Assignments | ✅ | ✅ (own base) | ✅ |
| Log Expenditure | ✅ | ✅ (own base) | ❌ |
| View Expenditures | ✅ | ✅ (own base) | ✅ |
| Register/View Users | ✅ | ❌ | ❌ |

---


## Deployment

- **Backend:** Render  — set `DATABASE_URL`/`DB_*` and `JWT_SECRET` as environment variables.
- **Frontend:** Vercel — set `VITE_API_BASE_URL` to the deployed backend URL.

---

## Live Deployment

| Service | URL |
|---|---|
| Frontend | https://military-asset-management-system-git-main-seema-anjums-projects.vercel.app/ |
| Backend API | https://military-asset-management-system-foii.onrender.com/api |
| Health Check | https://military-asset-management-system-foii.onrender.com/api/health |
