# EasyPark

EasyPark is a React and Express parking application backed by MongoDB.

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` for MongoDB Atlas or `MONGO_LOCAL` for local MongoDB.
2. Install backend dependencies and start the API:

   ```text
   cd backend
   npm install
   npm run dev
   ```

3. In another terminal, start the frontend:

   ```text
   cd frontend
   npm install
   npm run dev
   ```

The API listens on `http://localhost:5000` by default. The first successful MongoDB connection seeds the default parking spaces. The frontend uses `VITE_API_URL` from `frontend/.env` and defaults to that API URL.

Health check: `GET /health`

## Database workflows

- `POST /signup` creates a hashed-password user.
- `POST /signin` authenticates by email or telephone.
- `GET /parking` returns live parking availability.
- `POST /reservation` reserves an available parking slot for a user.
- `GET /reservation/user/:userId` returns that user's reservations.

## Design system

EasyPark uses CSS theme tokens with Poppins typography and a green modern SaaS visual system. Components should use the active `--color-*` tokens so they adapt to light and dark themes.

| Token | Light mode | Dark mode |
| --- | --- | --- |
| Primary | `#22C55E` | `#22C55E` |
| Primary hover | `#16A34A` | `#86EFAC` |
| Main dark/text heading | `#0F172A` | `#F8FAFC` |
| Body text | `#334155` | `#CBD5E1` |
| Page background | `#F8FAFC` | `#0F172A` |
| Surface | `#FFFFFF` | `#1E293B` |
| Border | `#E2E8F0` | `#334155` |
