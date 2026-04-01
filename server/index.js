require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./routes/admin');
const app = express();

// Middleware
app.use(cors(
  ({
    origin: true, // This allows any origin (Vercel, Localhost, etc.)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
})
));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🎵 THE CRUCIAL FIX: Expose the public folder so MP3s can stream!
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'IELTS Prep Server is running' });
});

// Import Routes
app.get('/', (req, res) => {
    res.send('IELTS Prep API is Live and Connected to MongoDB!');
});
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const listeningRoutes = require('./routes/listening');
const readingRoutes = require('./routes/reading');
const writingRoutes = require('./routes/writing');
const speakingRoutes = require('./routes/speaking');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/speaking', speakingRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});