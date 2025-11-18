# Secure Notes Web App

A minimalist, secure notes application with client-side encryption, built with React, Redux (MVI pattern), and Node.js/Express.

## Features

- **Client-side encryption**: Notes are encrypted using AES-GCM before being sent to the server
- **Offline support**: Full offline functionality with IndexedDB and automatic sync
- **Minimalist design**: Black and white UI with Arial font
- **Mobile-first**: Optimized for iPhone
- **Secure authentication**: JWT-based authentication with bcrypt password hashing

## Tech Stack

### Frontend
- React 18 + TypeScript
- Redux Toolkit (MVI pattern)
- Vite
- Vitest + React Testing Library
- IndexedDB (via idb)
- Service Worker

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- JWT authentication
- bcryptjs for password hashing

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

1. Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/secure_notes?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
```

2. Run Prisma migrations:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

3. Start the backend server:
```bash
npm run dev
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
(Add test setup as needed)

## Deployment

### Frontend (Vercel)

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variable:
```bash
vercel env add VITE_API_URL
# Enter your backend API URL
```

### Backend (Railway)

1. Install Railway CLI (if not already installed):
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize and deploy:
```bash
cd backend
railway init
railway up
```

4. Set environment variables:
```bash
railway variables set DATABASE_URL="your-postgres-url"
railway variables set JWT_SECRET="your-secret-key"
railway variables set PORT=3000
```

5. Run database migrations:
```bash
railway run npm run prisma:migrate
```

## Project Structure

```
secure-notes/
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── store/             # Redux store (MVI Model)
│   │   ├── intents/           # MVI Intent layer
│   │   ├── models/            # Type definitions
│   │   ├── views/             # MVI View layer
│   │   └── services/          # Encryption, API, offline
│   └── public/
│       └── sw.js             # Service Worker
├── backend/
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth middleware
│   │   └── server.ts
│   └── prisma/
│       └── schema.prisma
└── README.md
```

## Security Notes

- Passwords are hashed on the backend using bcrypt
- Notes are encrypted client-side using Web Crypto API (AES-GCM)
- JWT tokens are used for authentication
- All API requests require authentication
- HTTPS should be used in production

## License

ISC

