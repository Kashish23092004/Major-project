MAJOR-PROJECT/
├── client/                          # React + TypeScript frontend (Vite)
│   ├── public/
│   │   ├── gym_audio.mp3            # Public audio assets
│   │   ├── vite.svg
│   │   └── [audio files...]         # Listening test audio
│   ├── src/
│   │   ├── assets/
│   │   │   ├── Librarian audio...   # Test audio assets
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx   # Admin panel for managing tests
│   │   │   ├── AdminLogin.tsx       # Admin authentication screen
│   │   │   ├── AuthScreen.tsx       # User login/register
│   │   │   ├── AuthScreen.css
│   │   │   ├── LandingPage.tsx      # Home/marketing page
│   │   │   ├── LandingPage.css
│   │   │   ├── ListeningModule.tsx  # Listening test UI
│   │   │   ├── PreparationScreen.tsx # Pre-test prep screen
│   │   │   ├── PreparationScreen.css
│   │   │   ├── ReadingModule.tsx    # Reading test UI
│   │   │   ├── ReadingTestEditor.tsx # Admin: create reading tests
│   │   │   ├── ResultsScreen.tsx    # Post-test results & feedback
│   │   │   ├── SelectionScreen.tsx  # Module selection screen
│   │   │   ├── SpeakingModule.tsx   # Speaking test UI (mic recording)
│   │   │   ├── SpeakingTestEditor.tsx # Admin: create speaking tests
│   │   │   ├── Timer.tsx            # Shared countdown timer component
│   │   │   ├── WelcomeScreen.tsx    # Post-login welcome
│   │   │   ├── WelcomeScreen.css
│   │   │   ├── WritingModule.tsx    # Writing test UI
│   │   │   ├── WritingModul.css
│   │   │   └── WritingTestEditor.tsx # Admin: create writing tests
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Global auth state (React Context)
│   │   ├── utils/                   # Helper functions
│   │   ├── App.tsx                  # Root component & routing
│   │   ├── App.css
│   │   ├── config.tsx               # API base URL config
│   │   ├── main.tsx                 # React entry point
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts               # Vite config (proxy settings)
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vercel.json                  # Frontend deployment config
│
├── server/                          # Node.js + Express backend
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── models/                      # MongoDB/Mongoose schemas
│   │   ├── ListeningTest.js         # Listening test schema
│   │   ├── Progress.js              # User progress tracking
│   │   ├── ReadingTest.js           # Reading test schema
│   │   ├── SpeakingTest.js          # Speaking test schema
│   │   ├── TestAttempt.js           # Individual attempt records
│   │   ├── User.js                  # User account schema
│   │   ├── WritingSubmission.js     # Writing answer submissions
│   │   └── WritingTest.js           # Writing test schema
│   ├── routes/
│   │   ├── analytics.js             # Analytics/stats endpoints
│   │   ├── auth.js                  # Login, register, JWT endpoints
│   │   ├── listening.js             # Listening test CRUD & submission
│   │   ├── reading.js               # Reading test CRUD & submission
│   │   ├── speaking.js              # Speaking test CRUD & submission
│   │   └── writing.js               # Writing test CRUD & submission
│   ├── scripts/
│   │   └── check_gemini.js          # Gemini AI connectivity check
│   ├── services/
│   │   └── feedbackService.js       # AI feedback via Gemini API
│   ├── public/                      # Server-served static audio files
│   │   ├── Community Sp...
│   │   ├── gym_audio.mp3
│   │   ├── health_clinic.m...
│   │   ├── Lecture audio...
│   │   ├── Lecture.mp3.m...
│   │   ├── Librarian audio...
│   │   ├── museum audio...
│   │   └── Research projec...
│   ├── .env                         # Environment variables (gitignored)
│   ├── .env.example                 # Env variable template
│   ├── index.js                     # Express app entry point
│   ├── massiveSeed.js               # Bulk test data seeder
│   ├── seed.js                      # Basic seed script
│   ├── seedAdmin.js                 # Admin user seeder
│   ├── test-speaking-fe...          # Speaking feature test script
│   └── package.json
│
└── README.md

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| AI Feedback | Google Gemini API |
| Deployment | Vercel (client) + Render/Railway (server) |

## Environment Variables

### Server `.env`
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
CLIENT_URL=https://your-frontend.vercel.app   # ← CRITICAL FOR CORS
PORT=5000

### Client `.env`
VITE_API_URL=https://your-backend.onrender.com

## Getting Started

### 1. Install dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 2. Seed the database
```bash
cd server
node seedAdmin.js     # Create admin user
node seed.js          # Add sample tests
```

### 3. Run locally
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

## Deployment Notes

- Ensure `CLIENT_URL` in server `.env` matches the exact deployed frontend URL
- Audio files in `server/public/` must be included in server deployment
- Set all env variables in your hosting platform's dashboard