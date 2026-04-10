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

## Vercel deployment

This project is configured for Vercel using `vercel.json`.

### Required environment variables

Set these in the Vercel dashboard under Project Settings > Environment Variables:

- `MONGO_URI` — MongoDB connection string
- `NODE_ENV=production`

### Deploy instructions

1. Connect your Git repository to Vercel.
2. Ensure the project root contains `package.json`, `vercel.json`, `frontend/`, `backend/`, and `api/`.
3. Set the environment variables listed above.
4. Trigger a deployment.

### What Vercel does

- Builds the frontend with `npm --workspace frontend run build`
- Deploys serverless API routes from `api/index.js`
- Routes requests under `/api/*` to the backend
- Serves static frontend assets from `frontend/dist`

## Alternative run mode

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
