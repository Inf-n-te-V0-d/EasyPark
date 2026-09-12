# EasyPark

EasyPark is a React and Express parking application backed by MongoDB.

# LET'S GOOOOOOOOOOOOOOO!!!!!

# To run backend server = npm run dev

# BACKEND
## First install all required packages.
### 1. npm init -y
### 2. npm install express
### 3. npm install mongoose
### 4. npm install dotenv
### 5. npm install nodemon
### 6. npm install cors
### 7. npm install bcrypt
### 8. npm install axios dotenv cors
### 9. npm install jsonwebtoken 
### 10. npm install node-cron


## Then create .env file inside backend folder
### inside that file create local environment variables 
### 1. MONGO_LOCAL=your mongo db url
### 2. PORT=port name

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` for MongoDB Atlas or `MONGO_LOCAL` for local MongoDB.
2. Install backend dependencies and start the API (before run mongodb compuss and connect to database):

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

Additional 
light-mode tokens: brand tagline #CBD5E1,
muted white`rgba(255, 255, 255, 0.8)`,
 footer muted #94A3B8,
  footer subtle #64748B,
and footer action hover #F0FDF4.

Font: Poppins, ui-sans-serif, system-ui, sans-serif  
Theme: Modern SaaS  
Border Radius: 12px  

## To run frontend server = npm run dev
## Just install this = npm install 
## After the "git pull" enter "npm install" to get the dependencies of Tailwindcss


# BRANCHES (Add Branches HERE!!!!)
Branch(Milan) : milan-feature      
Branch(Nethum) : nethum-feature-server        
Branch(Adisha) : adisha-feature    
Branch(Omika) : omika-feature  
Branch(Nethum) : nethum-feature-backend-routes  
Branch(Nethum) : nethum-feature-Reservation-routes  
Branch(Dilshan) : dilsha-feature   
Branch(Milan)  : milan-map-integration  
Branch(Nethum) : nethum-feature-parking-routes  
Branch(Nethum) : nethum-feature-jwt-authentication 

# Technologies
- `Frontend :`  React.js, Vite, Tailwind CSS, CSS
- `Backend  :`  Node.js, Express.js, Mongoose, Bcrypt, JWT Authentication
- `Database :`  MongoDB
