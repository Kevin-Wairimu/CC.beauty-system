# Backend Setup Guide

## Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL instance (local or remote)
- Cloudinary account (optional, for service images)

## Environment variables
Create a `.env` file in the project root (already provided) and set the following:
```
PORT=5000
JWT_SECRET=your_secure_secret
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# (Optional) Email settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
Replace placeholders with real values.

## Install dependencies
```bash
cd backend
npm install
```

## Prisma setup (schema & migrations)
```bash
# Generate Prisma client
npx prisma generate
# Push the schema to the database (creates tables)
npx prisma db push
```
If you prefer migrations, run `npx prisma migrate dev` instead.

## Run the server
```bash
npm run dev   # development with nodemon (auto‑restart)
# or
npm start      # run once
```
The server will listen on the port defined in `.env` (default **5000**). Health check: `GET http://localhost:5000/api/ping` should return `{ status: "online" ... }`.

## Common issues
- **Missing DATABASE_URL** – ensure the variable is defined and points to a reachable PostgreSQL server.
- **Prisma errors** – run `npx prisma generate` after any schema changes.
- **Cloudinary errors** – if you are not using image uploads, you can comment out the `cloudinary.config` block in `backend/config/cloudinary.js`.
- **Port conflicts** – change the `PORT` value in `.env`.

---
Once the backend starts successfully, the frontend can communicate with the API at the URL you set in `VITE_API_URL`.
