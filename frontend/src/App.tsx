// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import React, { useEffect, useState } from 'react';
import Connect from './components/Connect';
import Dashboard from './components/Dashboard';

function App() {
  const [connectionId, setConnectionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get('connection_id');
    if (cid) setConnectionId(cid);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Slack Connect Demo</h2>
      {!connectionId ? (
        <Connect />
      ) : (
        <Dashboard connectionId={connectionId} />
      )}
    </div>
  );
}

export default App;

