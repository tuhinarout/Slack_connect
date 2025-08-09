import express from 'express';
import { exchangeCodeForToken, saveConnection } from '../services/slack';

const router = express.Router();

router.get('/auth/slack/connect', (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirect = encodeURIComponent(process.env.SLACK_REDIRECT_URI || '');
  const scopes = encodeURIComponent('chat:write,channels:read,users:read');
  const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirect}`;
  res.redirect(url);
});

router.get('/auth/slack/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send('Missing code from Slack');
  try {
    const data = await exchangeCodeForToken(code);
    // save tokens & return connection id
    const saved = await saveConnection(data);
    // redirect to frontend with connection id so user can proceed
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontend}?connection_id=${saved.id}`);
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).send('Slack OAuth failed: ' + (err as Error).message);
  }
});

export default router;
