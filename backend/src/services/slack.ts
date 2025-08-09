import axios from 'axios';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

const SLACK_OAUTH_ACCESS_URL = 'https://slack.com/api/oauth.v2.access';
const SLACK_CONVERSATIONS_LIST = 'https://slack.com/api/conversations.list';
const SLACK_POST_MESSAGE = 'https://slack.com/api/chat.postMessage';

function now() { return Date.now(); }

export async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams();
  params.append('client_id', process.env.SLACK_CLIENT_ID || '');
  params.append('client_secret', process.env.SLACK_CLIENT_SECRET || '');
  params.append('code', code);
  params.append('redirect_uri', process.env.SLACK_REDIRECT_URI || '');

  const resp = await axios.post(SLACK_OAUTH_ACCESS_URL, params);
  if (!resp.data.ok) throw new Error(resp.data.error || 'Slack token exchange failed');

  // resp.data will have access_token, refresh_token (if app configured for rotation), team info
  return resp.data;
}

export async function saveConnection(data: any) {
  const id = uuidv4();
  const team_id = data.team?.id || data.team_id || '';
  const team_name = data.team?.name || '';
  const access_token = data.access_token;
  const refresh_token = data.refresh_token || null;
  const scope = data.scope || '';
  const expires_in = data.expires_in || null;
  const token_expires_at = expires_in ? now() + expires_in * 1000 : null;

  const created_at = now();
  await db.run(
    `INSERT INTO slack_connections
      (id, team_id, team_name, access_token, refresh_token, scope, token_expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, team_id, team_name, access_token, refresh_token, scope, token_expires_at, created_at, created_at
  );
  return { id, team_id, team_name };
}

async function refreshTokenRow(connectionRow: any) {
  // attempts refresh using refresh_token (Slack supports rotation when configured)
  if (!connectionRow.refresh_token) throw new Error('No refresh token available');
  const params = new URLSearchParams();
  params.append('client_id', process.env.SLACK_CLIENT_ID || '');
  params.append('client_secret', process.env.SLACK_CLIENT_SECRET || '');
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', connectionRow.refresh_token);

  const resp = await axios.post(SLACK_OAUTH_ACCESS_URL, params);

  if (!resp.data.ok) {
    throw new Error(resp.data.error || 'Slack refresh failed');
  }

  const access_token = resp.data.access_token;
  const refresh_token = resp.data.refresh_token || connectionRow.refresh_token;
  const expires_in = resp.data.expires_in || null;
  const token_expires_at = expires_in ? now() + expires_in * 1000 : null;

  await db.run(
    `UPDATE slack_connections SET access_token=?, refresh_token=?, token_expires_at=?, updated_at=? WHERE id=?`,
    access_token, refresh_token, token_expires_at, now(), connectionRow.id
  );
  return access_token;
}

export async function getValidAccessToken(connectionId: string) {
  const row = await db.get(`SELECT * FROM slack_connections WHERE id = ?`, connectionId);
  if (!row) throw new Error('Connection not found');

  const safeMargin = 60 * 1000; // 1 minute
  if (row.token_expires_at && Date.now() < (row.token_expires_at - safeMargin)) {
    return row.access_token;
  }

  // token expired or near expiry -> try refresh
  if (row.refresh_token) {
    try {
      const newToken = await refreshTokenRow(row);
      return newToken;
    } catch (err) {
      throw new Error('Failed to refresh token: ' + (err as Error).message);
    }
  }

  // If no refresh token, throw and tell client to re-auth
  throw new Error('Access token expired and no refresh token — re-auth required');
}

export async function listChannels(connectionId: string) {
  const accessToken = await getValidAccessToken(connectionId);
  const resp = await axios.get(SLACK_CONVERSATIONS_LIST, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { limit: 200 }
  });
  if (!resp.data.ok) throw new Error(resp.data.error || 'Failed to list channels');
  return resp.data.channels;
}

export async function postMessage(connectionId: string, channel: string, text: string) {
  const accessToken = await getValidAccessToken(connectionId);
  const resp = await axios.post(SLACK_POST_MESSAGE, {
    channel,
    text
  }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!resp.data.ok) throw new Error(resp.data.error || 'Slack postMessage failed');
  return resp.data;
}
