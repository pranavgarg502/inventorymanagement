# Inventory Management

This repository contains an Express backend and a Vite + React frontend.

## Local development

1. Install dependencies from the repo root:
   ```bash
   npm install
   ```

2. Start backend and frontend together:
   ```bash
   npm run dev
   ```

3. Open the frontend at:
   ```text
   http://localhost:5173
   ```

## Production build

Build the frontend from the root:
```bash
npm run build
```

The frontend output is generated at `frontend/dist`.

## Deploy frontend on Vercel and backend on Render

This is the recommended free split deployment:

### Frontend on Vercel

1. Create a new Vercel project and point it to the `frontend/` folder.
2. Set the build settings if needed:
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
3. Add a Vercel environment variable:
   - `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com/api`
4. Deploy the frontend.

Vercel will serve the static React app and all API requests will go to Render.

### Backend on Render

1. Create a new Render Web Service from the `backend/` folder.
2. Use the default environment if you want the free tier.
3. Set the service build command:
   - `npm install`
4. Set the start command:
   - `npm start`
5. Set these environment variables in Render:
   - `MONGO_URI` — MongoDB connection string
   - `NODE_ENV=production`
6. Deploy the service.

Render will provide a public URL like `https://<your-render-service>.onrender.com`.

### Frontend configuration

The frontend now reads the API base URL from `VITE_API_BASE_URL`.
If this variable is missing, it falls back to `http://localhost:3000/api` for local development.

### Why this works

- Vercel hosts the static frontend for free.
- Render hosts the backend service for free on the free tier.
- The frontend calls the backend via the Render public URL.

## Local development

If you want to run the backend locally without Vercel:

1. Copy `.env.example` to `.env` and fill in `MONGO_URI`.
2. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

## Notes

- `backend/app.js` exports the Express app.
- `backend/server.js` starts a local backend server.
- `api/index.js` is the Vercel serverless function entrypoint.
