import React from 'react';

const Connect: React.FC = () => {
  const backend = 'http://localhost:5000';
  const connectUrl = backend + '/auth/slack';

  return (
    <div>
      <h3>Connect to Slack</h3>
      <a href={connectUrl}>
        <button>Connect Slack Workspace</button>
      </a>
    </div>
  );
};

export default Connect;
