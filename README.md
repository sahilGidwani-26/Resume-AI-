# 🚀 ResumeAI — AI-Powered Resume & Job Platform

A full-stack MERN application with Google Gemini AI for resume analysis, ATS scoring, skill detection, and job recommendations.

---

## 📁 Project Structure

```
resumeai/
├── backend/              ← Node.js + Express API
│   ├── config/           ← DB connection
│   ├── controllers/      ← Route handlers
│   ├── middleware/       ← Auth, file upload
│   ├── models/           ← MongoDB schemas
│   ├── routes/           ← API routes
│   ├── utils/            ← Gemini AI, JWT helpers
│   ├── server.js         ← Entry point
│   ├── .env.example      ← Environment template
│   └── package.json
│
└── frontend/             ← React.js + Tailwind CSS
    ├── public/
    └── src/
        ├── components/   ← Reusable components
        ├── context/      ← Auth + Theme context
        ├── pages/        ← All page components
        ├── utils/        ← API service layer
        ├── App.js
        └── index.css     ← Global styles + Tailwind
```

---

## ⚙️ Prerequisites

Make sure you have installed:
- **Node.js** v18+ → https://nodejs.org
- **npm** v9+ (comes with Node.js)
- **Git** → https://git-scm.com

---

## 🔑 Step 1: Get API Keys & Services

### 1.1 MongoDB Atlas (Free)
1. Go to https://cloud.mongodb.com
2. Sign up / Log in
3. Create a **free M0 cluster** (choose any region)
4. Under **Database Access** → Add a database user (username + password)
5. Under **Network Access** → Add `0.0.0.0/0` (allow all IPs)
6. Click **Connect** → **Drivers** → Copy the connection string
7. Replace `<password>` with your DB user password
8. Your URI looks like: `mongodb+srv://john:mypass123@cluster0.abc12.mongodb.net/resumeai?retryWrites=true&w=majority`

### 1.2 Google Gemini AI (Free)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click **Create API Key**
4. Copy the key (starts with `AIza...`)

### 1.3 JWT Secret
Generate a strong random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🛠️ Step 2: Backend Setup

```bash
# Navigate to backend
cd resumeai/backend

# Install all dependencies
npm install

# Create your .env file from template
cp .env.example .env
```

Now open `backend/.env` and fill in your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/resumeai?retryWrites=true&w=majority
JWT_SECRET=your_64_char_random_string_here
JWT_EXPIRE=7d
OPENROUTER_API_KEY=AIzaSy...your_key
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB Atlas connected
🚀 Server running on port 5000
```

Test it: Open http://localhost:5000/api/health — should return `{"success":true,...}`

---

## 🎨 Step 3: Frontend Setup

Open a new terminal:
```bash
# Navigate to frontend
cd resumeai/frontend

# Install all dependencies
npm install

# Create your .env file
cp .env.example .env
```

The `frontend/.env` should contain:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Opens automatically at http://localhost:3000 🎉

---

## 🔄 Full Run Checklist

| Step | Command | Port |
|------|---------|------|
| 1. Start Backend | `cd backend && npm run dev` | 5000 |
| 2. Start Frontend | `cd frontend && npm start` | 3000 |

Both terminals must be running simultaneously.

---

## 📦 All Packages Explained

### Backend (`npm install` installs all)
| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ORM |
| `dotenv` | Environment variables |
| `cors` | Cross-origin requests |
| `helmet` | Security headers |
| `express-rate-limit` | API rate limiting |
| `jsonwebtoken` | JWT auth tokens |
| `bcryptjs` | Password hashing |
| `multer` | File upload handling |
| `pdf-parse` | Extract text from PDFs |
| `@google/generative-ai` | Gemini AI SDK |
| `validator` | Input validation |
| `nodemon` (dev) | Auto-restart server |

### Frontend (`npm install` installs all)
| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | Core React |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP requests |
| `react-hot-toast` | Toast notifications |
| `react-dropzone` | Drag-and-drop file upload |
| `react-circular-progressbar` | Circular score display |
| `recharts` | Charts/graphs |
| `framer-motion` | Animations |
| `@headlessui/react` | Accessible UI components |
| `tailwindcss` | Utility CSS framework |

---

## 🌐 Deployment

### Backend → Render (Free)
1. Push your code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add all environment variables from `.env`
6. Deploy! Your backend URL: `https://your-app.onrender.com`

### Frontend → Vercel (Free)
1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Create React App
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
5. Also update backend's `FRONTEND_URL` to your Vercel URL
6. Deploy!

---

## 🔑 API Endpoints Reference

### Auth
```
POST /api/auth/signup    → Register user
POST /api/auth/login     → Login
GET  /api/auth/me        → Get current user (protected)
```

### Resume
```
POST   /api/resume/upload  → Upload & AI-analyze PDF (protected)
GET    /api/resume         → Get all user resumes (protected)
GET    /api/resume/:id     → Get single analysis (protected)
DELETE /api/resume/:id     → Delete resume (protected)
```

### Jobs
```
GET  /api/jobs/recommendations  → AI job matches from resume (protected)
POST /api/jobs/search           → Custom job search (protected)
```

### User
```
GET  /api/user/dashboard          → Dashboard stats (protected)
PUT  /api/user/profile            → Update profile (protected)
POST /api/user/resume-builder     → Save built resume (protected)
GET  /api/user/resume-builder     → Get all built resumes (protected)
GET  /api/user/resume-builder/:id → Get specific built resume (protected)
```

---

## 🐛 Common Issues & Fixes

**MongoDB connection failed**
- Check your IP is whitelisted in MongoDB Atlas (use `0.0.0.0/0`)
- Verify username/password in connection string (no special chars without encoding)

**Gemini API error**
- Ensure your API key is valid and has credits
- The free tier has rate limits — wait and retry

**PDF parse returns empty text**
- The PDF may be scanned/image-based — only text PDFs work
- Try a different PDF

**CORS error in browser**
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly
- No trailing slash

**Port already in use**
- Kill process: `npx kill-port 5000` or `npx kill-port 3000`

---

## ✨ Features Summary

- 🔐 **JWT Authentication** — Secure signup/login
- 📄 **PDF Resume Upload** — Drag & drop with validation
- 🤖 **AI Analysis** — Google Gemini powered
- 🎯 **ATS Scoring** — Score out of 100
- ⚡ **Skill Detection** — Extracted + missing skills
- 💡 **Improvements** — 5-8 actionable suggestions
- 💼 **Job Matching** — 6-8 personalized job recommendations
- 🏗️ **Resume Builder** — Build from scratch with preview
- 📊 **Dashboard** — Stats, recent resumes, quick actions
- 🌗 **Dark/Light Mode** — System preference respected
- 📱 **Fully Responsive** — Mobile-first design

---

Built with ❤️ using MERN Stack + Google Gemini AI