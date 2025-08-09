import { db } from './config/db';
import { postMessage } from './services/slack';

const POLL_INTERVAL = 15 * 1000; // 15 seconds
const MAX_ATTEMPTS = 5;

export function startScheduler() {
  setInterval(async () => {
    try {
      const now = Date.now();
      const rows = await db.all(`SELECT * FROM scheduled_messages WHERE status='scheduled' AND send_at <= ?`, now);
      for (const row of rows) {
        try {
          await postMessage(row.connection_id, row.channel_id, row.text);
          await db.run(`UPDATE scheduled_messages SET status='sent', updated_at=? WHERE id=?`, Date.now(), row.id);
        } catch (err) {
          const errMsg = (err as Error).message;
          const nextAttempts = row.attempts + 1;
          const status = nextAttempts >= MAX_ATTEMPTS ? 'failed' : 'scheduled';
          await db.run(`UPDATE scheduled_messages SET attempts=?, last_error=?, status=?, updated_at=? WHERE id=?`, nextAttempts, errMsg, status, Date.now(), row.id);
        }
      }
    } catch (err) {
      console.error('Scheduler error', err);
    }
  }, POLL_INTERVAL);
}
