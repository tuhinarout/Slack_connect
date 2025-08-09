import express from 'express';
import { db } from '../config/db';
import { postMessage, listChannels } from '../services/slack';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/message/send
router.post('/api/message/send', async (req, res) => {
  const { connection_id, channel_id, text } = req.body;
  if (!connection_id || !channel_id || !text) return res.status(400).json({ error: 'Missing fields' });
  try {
    const resp = await postMessage(connection_id, channel_id, text);
    res.json({ ok: true, slack: resp });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/message/schedule
router.post('/api/message/schedule', async (req, res) => {
  const { connection_id, channel_id, text, send_at } = req.body;
  if (!connection_id || !channel_id || !text || !send_at) return res.status(400).json({ error: 'Missing fields' });
  const id = uuidv4();
  const created_at = Date.now();
  try {
    await db.run(
      `INSERT INTO scheduled_messages
       (id, connection_id, channel_id, text, send_at, status, attempts, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      id, connection_id, channel_id, text, send_at, 'scheduled', created_at, created_at
    );
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/message/scheduled?connection_id=...
router.get('/api/message/scheduled', async (req, res) => {
  const connection_id = req.query.connection_id as string;
  if (!connection_id) return res.status(400).json({ error: 'connection_id required' });
  const rows = await db.all(`SELECT * FROM scheduled_messages WHERE connection_id = ? ORDER BY send_at DESC`, connection_id);
  res.json({ ok: true, rows });
});

// POST /api/message/cancel
router.post('/api/message/cancel', async (req, res) => {
  const { id, connection_id } = req.body;
  if (!id || !connection_id) return res.status(400).json({ error: 'Missing fields' });
  // mark cancelled if status is scheduled
  try {
    const r = await db.run(`UPDATE scheduled_messages SET status='cancelled', updated_at=? WHERE id=? AND connection_id=? AND status='scheduled'`, Date.now(), id, connection_id);
    if (r.changes === 0) return res.status(400).json({ error: 'Not found or cannot cancel' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/channels?connection_id=...
router.get('/api/channels', async (req, res) => {
  const connection_id = req.query.connection_id as string;
  if (!connection_id) return res.status(400).json({ error: 'connection_id required' });
  try {
    const channels = await listChannels(connection_id);
    res.json({ ok: true, channels });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
