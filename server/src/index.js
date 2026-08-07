/**
 * AquaMind · Hydraulic Intelligence Command — backend API.
 * Production-ready Node + Express. Serves /api/* and (in production) the
 * built React bundle from client/dist.
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const routes = require('./routes');

const app  = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '127.0.0.1';

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

// health + ping
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// API
app.use('/api', routes);

// In production, serve the React build from client/dist
const STATIC_DIR = path.resolve(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(STATIC_DIR));
app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(STATIC_DIR, 'index.html'), err => {
  if (err) res.status(404).json({ error: 'Not found' });
}));

// error handler
app.use((err, _req, res, _next) => {
  console.error('[api] error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

app.listen(PORT, HOST, () => {
  console.log(`[aquamind] API ready at http://${HOST}:${PORT}`);
});
