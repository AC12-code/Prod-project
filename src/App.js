import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [moments, setMoments] = useState([]);
  const [newMoment, setNewMoment] = useState('');

  useEffect(() => {
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/moments');
      const data = await response.json();
      setMoments(data);
    } catch (error) {
      console.error('Error fetching moments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMoment.trim()) return;

    try {
      const response = await fetch('http://localhost:5001/api/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMoment }),
      });

      if (response.ok) {
        setNewMoment('');
        fetchMoments();
      }
    } catch (error) {
      console.error('Error submitting moment:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Unhappy Moments</h1>
        <p className="subtitle">Share your thoughts anonymously</p>
      </header>
      
      <main className="main-content">
        <form onSubmit={handleSubmit} className="moment-form">
          <textarea
            value={newMoment}
            onChange={(e) => setNewMoment(e.target.value)}
            placeholder="Share your unhappy moment..."
            className="moment-input"
          />
          <button type="submit" className="submit-button">Share</button>
        </form>

        <div className="moments-container">
          {moments.map((moment) => (
            <div key={moment._id} className="moment-card">
              <p className="moment-content">{moment.content}</p>
              <span className="moment-time">
                {new Date(moment.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
