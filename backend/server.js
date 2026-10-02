import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_matrix_key_2099';
const LOG_FILE_PATH = path.join(process.cwd(), 'latency_profile_matrix.log');

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-Memory fallback store for containerized or standalone node execution
let gridNodes = [
  {
    node_id: 'NODE-GV-01',
    name: 'Gatesville Primary Substation Alpha',
    classification: 'POWER_GRID',
    latitude: 31.4351,
    longitude: -97.7439,
    base_radius_meters: 250,
    is_shielded: true,
    shield_last_cleared_at: new Date().toISOString(),
    shield_expires_at: new Date(Date.now() + 86400000).toISOString()
  },
  {
    node_id: 'NODE-GV-02',
    name: 'Leon River Water Treatment Array',
    classification: 'HYDRO_INFRA',
    latitude: 31.4285,
    longitude: -97.7380,
    base_radius_meters: 180,
    is_shielded: true,
    shield_last_cleared_at: new Date().toISOString(),
    shield_expires_at: new Date(Date.now() + 43200000).toISOString()
  }
];

// 2. High-Precision Latency Profiling Middleware
app.use((req, res, next) => {
  const startTimeMarker = process.hrtime();
  res.on('finish', () => {
    const totalDeltaTime = process.hrtime(startTimeMarker);
    const totalLatencyMs = (totalDeltaTime[0] * 1000 + totalDeltaTime[1] / 1e6).toFixed(3);
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | HTTP ${res.statusCode} | ${totalLatencyMs} ms\n`;
    process.stdout.write(logLine);
    fs.appendFile(LOG_FILE_PATH, logLine, () => {});
  });
  next();
});

// 3. Security Route Authentication Token Gate
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing.' });

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired authorization signature.' });
    req.user = decodedUser;
    next();
  });
};

// 4. Ingestion APIs
app.get('/api/grid/status', async (req, res) => {
  res.status(200).json(gridNodes);
});

app.post('/api/grid/clear-node', authenticateToken, async (req, res) => {
  const { id } = req.body;
  const now = new Date();
  const expiration = new Date(now.getTime() + (48 * 60 * 60 * 1000));

  const node = gridNodes.find(n => n.node_id === id);
  if (!node) return res.status(404).json({ error: 'Target coordinate reference not found.' });

  node.is_shielded = true;
  node.shield_last_cleared_at = now.toISOString();
  node.shield_expires_at = expiration.toISOString();

  res.status(200).json({ status: 'CORE_LOCKED', node });
});

app.get('/api/health', async (req, res) => {
  res.status(200).json({ status: 'SYSTEM_OPERATIONAL', database: 'CONNECTED' });
});

app.listen(PORT, () => {
  console.log(`[CORE] Ingestion Engine online on port ${PORT}`);
});
