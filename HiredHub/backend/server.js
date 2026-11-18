require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Only avatars are public; resumes are served through the authorised /api/resumes/:id/download route.
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));
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
