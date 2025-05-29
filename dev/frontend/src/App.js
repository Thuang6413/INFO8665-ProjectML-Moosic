import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => setMessage('Error connecting to backend'));
  }, []);

  return (
    <div className="App">
      <h1>Frontend Application</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
