require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const listeningRoutes = require('./routes/listening');
const readingRoutes = require('./routes/reading');
const writingRoutes = require('./routes/writing');
const speakingRoutes = require('./routes/speaking');

const app = express();


// ✅ GLOBAL CORS + PREFLIGHT HANDLER (MOST IMPORTANT FIX)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// simple cors (no overthinking)
app.use(cors());


// ✅ BODY PARSER
app.use(express.json());


// ✅ STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));


// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'IELTS Prep Server is running'
  });
});


// ✅ ROOT
app.get('/', (req, res) => {
  res.send('IELTS Prep API is Live and Connected to MongoDB!');
});


// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/speaking', speakingRoutes);
app.use('/api/admin', adminRoutes);


// ✅ MONGODB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


// ✅ SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});