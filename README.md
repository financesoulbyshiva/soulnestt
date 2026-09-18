# SoulNestt

Full-stack platform for tenants, space owners, and admins.

## Stack

- **Frontend:** React + Vite + Tailwind CSS + React Router + Axios
- **Backend:** Node.js + Express + Prisma
- **Database:** PostgreSQL

## Getting started

```bash
npm install                     # installs frontend + backend (workspaces)
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env   # fill in DATABASE_URL and JWT_SECRET
```

## Development

```bash
npm run dev        # runs frontend + backend together
npm run frontend   # frontend only (http://localhost:5173)
npm run backend    # backend only (http://localhost:5000)
```

Health check: `GET http://localhost:5000/api/health`

## Structure

- `frontend/` — React app (15 core screens under `src/routes/`)
- `backend/` — Express API (`src/app.js`, `prisma/schema.prisma`)

UI source of truth: Google Stitch project `15036240720848045426`.
