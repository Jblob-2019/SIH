/**
 * API route registry. Mounts every route module under /api/<resource>.
 * Each module exports a function (app) => void that wires its own sub-routes.
 */
const express = require('express');
const router  = express.Router();

router.use((req, _res, next) => { req.reqId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); next(); });

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', (_req, res) => res.json({
  service: 'aquamind-hic',
  version: '1.0.0',
  endpoints: [
    '/api/health', '/api/metrics', '/api/lakes', '/api/lakes/:id',
    '/api/sensors', '/api/sensors/:id', '/api/sensors/:id/readings',
    '/api/incidents', '/api/incidents/:id',
    '/api/anomalies', '/api/forecasts', '/api/biodiversity',
    '/api/maintenance', '/api/optimize', '/api/recovery',
    '/api/emergency', '/api/reports', '/api/citizen',
    '/api/assistant'
  ]
}));

// alias /health under /api for the Vite proxy path
router.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// inline route handlers — all hit the live Supabase store
const S = require('../supabaseStore');

// metrics
router.get('/metrics', wrap(async (_req, res) => res.json(await S.metrics())));

// lakes
router.get('/lakes',          wrap(async (_req, res) => res.json({ lakes: await S.lakes() })));
router.get('/lakes/:id',      wrap(async (req, res) => res.json(await S.lake(req.params.id))));

// sensors
router.get('/sensors',        wrap(async (_req, res) => res.json({ sensors: await S.sensors() })));
router.get('/sensors/:id',    wrap(async (req, res) => res.json(await S.sensor(req.params.id))));
router.get('/sensors/:id/readings', wrap(async (req, res) => res.json(await S.readings(req.params.id))));

// incidents
router.get('/incidents',      wrap(async (_req, res) => res.json({ incidents: await S.incidents() })));
router.get('/incidents/:id',  wrap(async (req, res) => res.json(await S.incident(req.params.id))));
router.post('/incidents',     wrap(async (req, res) => res.status(201).json(await S.createIncident(req.body))));
router.patch('/incidents/:id',wrap(async (req, res) => res.json(await S.patchIncident(req.params.id, req.body))));

// other domain endpoints
router.get('/anomalies',      wrap(async (_req, res) => res.json({ anomalies: await S.anomalies() })));
router.get('/forecasts',      wrap(async (_req, res) => res.json({ forecasts: await S.forecasts() })));
router.get('/biodiversity',   wrap(async (_req, res) => res.json({ species: await S.biodiversity() })));
router.get('/maintenance',    wrap(async (_req, res) => res.json({ workOrders: await S.maintenance() })));
router.get('/optimize',       wrap(async (_req, res) => res.json({ recommendations: await S.optimize() })));
router.get('/recovery',       wrap(async (_req, res) => res.json({ programs: await S.recovery() })));
router.get('/emergency',      wrap(async (_req, res) => res.json({ alerts: await S.emergency() })));
router.get('/reports',        wrap(async (_req, res) => res.json({ reports: await S.reports() })));
router.get('/citizen',        wrap(async (_req, res) => res.json({ tickets: await S.citizen() })));

// assistant
router.get('/assistant/models', wrap(async (_req, res) => res.json(await S.getOllamaModels())));
router.post('/assistant', wrap(async (req, res) => res.json(await S.assistant(req.body || {}))));

module.exports = router;