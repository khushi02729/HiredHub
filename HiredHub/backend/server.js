require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const { AVATAR_DIR } = require('./utils/files');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET is missing or shorter than 16 characters. Set it in your environment.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // correct client IPs behind Render/Railway proxies
// Avatars are loaded cross-origin by the frontend, so they need a cross-origin resource policy
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Only avatars are public; resumes are served through the authorised /api/resumes/:id/download route.
app.use('/uploads/avatars', express.static(AVATAR_DIR));
const limiter = (limit, message) => rateLimit({ windowMs: 15 * 60 * 1000, limit, standardHeaders: true, legacyHeaders: false, message: { success: false, message } });
app.use('/api', limiter(600, 'Too many requests. Please slow down.'));
app.use(['/api/auth/login', '/api/auth/register'], limiter(30, 'Too many attempts. Try again in a few minutes.'));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/saved', require('./routes/savedRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`API running on :${PORT}`)))
  .catch((e) => { console.error(e.message); process.exit(1); });
