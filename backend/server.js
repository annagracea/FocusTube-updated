// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { getChronologicalFeed, searchChannelVideos } = require('./youtubeService');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors({
  origin:'https://focus-tube-updated.vercel.app/'  // your actual Vercel URL
}));
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
    if (err) return console.error('Error acquiring client:', err.stack);
    console.log('Connected to PostgreSQL database.');
    release();
});

// ─── AUTH ROUTES ────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
    try {
        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0) return res.status(409).json({ error: 'Email already registered.' });
        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashed]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid email or password.' });
        res.json({ id: user.id, name: user.name, email: user.email });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// Update profile
app.put('/api/auth/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, email } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
            [name, email, userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Profile update failed.' });
    }
});

// ─── CHANNEL ROUTES ──────────────────────────────────────────────

// Get all channels for user
app.get('/api/channels/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT youtube_channel_id as id, channel_name as name, channel_thumbnail as thumbnail FROM allowlisted_channels WHERE user_id = $1 ORDER BY created_at DESC',
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch channels.' });
    }
});

// Add channel
app.post('/api/channels', async (req, res) => {
    const { userId, channelId, channelName, thumbnail } = req.body;
    try {
        const insertion = await pool.query(
            'INSERT INTO allowlisted_channels (user_id, youtube_channel_id, channel_name, channel_thumbnail) VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING *',
            [userId, channelId, channelName, thumbnail]
        );
        res.status(201).json(insertion.rows[0] || { message: 'Channel already exists.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to add channel.' });
    }
});

// Delete channel
app.delete('/api/channels/:userId/:channelId', async (req, res) => {
    const { userId, channelId } = req.params;
    try {
        await pool.query(
            'DELETE FROM allowlisted_channels WHERE user_id = $1 AND youtube_channel_id = $2',
            [userId, channelId]
        );
        res.json({ message: 'Channel removed.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to remove channel.' });
    }
});

// ─── FEED ROUTE ──────────────────────────────────────────────────

app.get('/api/feed/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const page = parseInt(req.query.page || '1', 10);
        const pageSize = 12;

        const channelsQuery = await pool.query(
            'SELECT youtube_channel_id FROM allowlisted_channels WHERE user_id = $1',
            [userId]
        );
        const channelIds = channelsQuery.rows.map(row => row.youtube_channel_id);

        if (channelIds.length === 0) return res.json({ videos: [], hasMore: false });

        const allVideos = await getChronologicalFeed(channelIds);
        const start = (page - 1) * pageSize;
        const paginated = allVideos.slice(start, start + pageSize);

        res.json({ videos: paginated, hasMore: allVideos.length > start + pageSize, total: allVideos.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to load feed.' });
    }
});

// ─── SEARCH ROUTE ────────────────────────────────────────────────

app.get('/api/search/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const query = req.query.q || '';

        if (!query.trim()) return res.json([]);

        const channelsQuery = await pool.query(
            'SELECT youtube_channel_id FROM allowlisted_channels WHERE user_id = $1',
            [userId]
        );
        const channelIds = channelsQuery.rows.map(row => row.youtube_channel_id);

        if (channelIds.length === 0) return res.json([]);

        const results = await searchChannelVideos(channelIds, query);
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Search failed.' });
    }
});

// ─── WATCH LATER ROUTES ──────────────────────────────────────────

app.get('/api/watchlater/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM watch_later WHERE user_id = $1 ORDER BY saved_at DESC',
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch watch later.' });
    }
});

app.post('/api/watchlater', async (req, res) => {
    const { userId, videoId, videoTitle, thumbnail, channelTitle, channelId, publishedAt } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO watch_later (user_id, video_id, video_title, thumbnail, channel_title, channel_id, published_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (user_id, video_id) DO NOTHING RETURNING *',
            [userId, videoId, videoTitle, thumbnail, channelTitle, channelId, publishedAt]
        );
        res.status(201).json(result.rows[0] || { message: 'Already saved.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to save.' });
    }
});

app.delete('/api/watchlater/:userId/:videoId', async (req, res) => {
    const { userId, videoId } = req.params;
    try {
        await pool.query('DELETE FROM watch_later WHERE user_id = $1 AND video_id = $2', [userId, videoId]);
        res.json({ message: 'Removed from Watch Later.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to remove.' });
    }
});

// ─── HISTORY & ANALYTICS ROUTES ──────────────────────────────────

app.post('/api/history', async (req, res) => {
    const { userId, channelId, channelName, videoId, videoTitle, duration } = req.body;
    try {
        const log = await pool.query(
            'INSERT INTO watch_history (user_id, youtube_channel_id, channel_name, video_id, video_title, duration_minutes) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, channelId, channelName, videoId, videoTitle, duration || 10]
        );
        res.status(201).json(log.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to log history.' });
    }
});

app.get('/api/analytics/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const totalTimeResult = await pool.query(
            'SELECT SUM(duration_minutes) as total FROM watch_history WHERE user_id = $1',
            [userId]
        );

        const todayResult = await pool.query(
            "SELECT SUM(duration_minutes) as total FROM watch_history WHERE user_id = $1 AND watched_at >= CURRENT_DATE",
            [userId]
        );

        const channelDistributionResult = await pool.query(
            'SELECT channel_name as name, COUNT(*)*10 as value FROM watch_history WHERE user_id = $1 GROUP BY channel_name LIMIT 5',
            [userId]
        );

        const weeklyResult = await pool.query(
            `SELECT TO_CHAR(watched_at, 'Dy') as day, SUM(duration_minutes) as minutes
             FROM watch_history WHERE user_id = $1 AND watched_at >= NOW() - INTERVAL '7 days'
             GROUP BY TO_CHAR(watched_at, 'Dy'), DATE(watched_at) ORDER BY DATE(watched_at)`,
            [userId]
        );

        res.json({
            totalMinutes: totalTimeResult.rows[0].total || 0,
            todayMinutes: todayResult.rows[0].total || 0,
            chartData: channelDistributionResult.rows,
            weeklyData: weeklyResult.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Analytics query failed.' });
    }
});

// ─── STATUS ──────────────────────────────────────────────────────

app.get('/', (req, res) => res.send('FocusTube Backend Online.'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`FocusTube running on port ${PORT}`));
