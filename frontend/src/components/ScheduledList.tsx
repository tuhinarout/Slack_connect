import React, { useEffect, useState } from 'react';
import { api } from '../api';

type Props = { connectionId: string };

const ScheduledList: React.FC<Props> = ({ connectionId }) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await api.get('/api/message/scheduled', { params: { connection_id: connectionId } });
      setMessages(res.data.messages || []);
    }
    load();
  }, [connectionId]);

  const cancel = async (id: string) => {
    await api.post('/api/message/cancel', { id });
    setMessages(messages.filter(m => m.id !== id));
  };

  return (
    <div>
      <h4>Scheduled Messages</h4>
      <ul>
        {messages.map(msg => (
          <li key={msg.id}>
            {msg.text} - {new Date(msg.send_at).toLocaleString()}
            <button onClick={() => cancel(msg.id)}>Cancel</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScheduledList;
