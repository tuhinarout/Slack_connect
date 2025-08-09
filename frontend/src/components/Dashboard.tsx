import React, { useEffect, useState } from 'react';
import { api } from '../api';
import ScheduledList from './ScheduledList';

type Props = { connectionId: string };

const Dashboard: React.FC<Props> = ({ connectionId }) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [channel, setChannel] = useState('');
  const [text, setText] = useState('');
  const [sendAt, setSendAt] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/channels', { params: { connection_id: connectionId } });
        setChannels(res.data.channels || []);
        if (res.data.channels?.length) setChannel(res.data.channels[0].id);
      } catch (err) {
        console.error(err);
        alert('Failed to load channels. Check backend logs.');
      }
    }
    load();
  }, [connectionId]);

  const sendNow = async () => {
    try {
      await api.post('/api/message/send', { connection_id: connectionId, channel_id: channel, text });
      alert('Message sent');
    } catch (err: any) {
      alert('Send failed: ' + (err?.response?.data?.error || err.message));
    }
  };

  const schedule = async () => {
    if (!sendAt) { alert('Pick send time'); return; }
    const send_ts = new Date(sendAt).getTime();
    try {
      await api.post('/api/message/schedule', { connection_id: connectionId, channel_id: channel, text, send_at: send_ts });
      alert('Message scheduled');
    } catch (err: any) {
      alert('Schedule failed: ' + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h3>Connected workspace: {connectionId}</h3>
      <div>
        <label>Channel: </label>
        <select value={channel} onChange={e => setChannel(e.target.value)}>
          {channels.map(ch => <option key={ch.id} value={ch.id}>{ch.name || ch.id}</option>)}
        </select>
      </div>

      <div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} cols={50} placeholder="Message text" />
      </div>

      <button onClick={sendNow}>Send Now</button>

      <div>
        <label>Schedule (local time): </label>
        <input type="datetime-local" value={sendAt} onChange={e => setSendAt(e.target.value)} />
        <button onClick={schedule}>Schedule</button>
      </div>

      <hr />
      <ScheduledList connectionId={connectionId} />
    </div>
  );
};

export default Dashboard;
