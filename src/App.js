import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [moments, setMoments] = useState([]);
  const [newMoment, setNewMoment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newComment, setNewComment] = useState('');
  const [activeMomentId, setActiveMomentId] = useState(null);

  useEffect(() => {
    fetchMoments();
  }, [selectedCategory]);

  const fetchMoments = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? 'http://localhost:5001/api/moments'
        : `http://localhost:5001/api/moments?category=${selectedCategory}`;
      
      const response = await fetch(url);
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
        body: JSON.stringify({ 
          content: newMoment,
          category: selectedCategory === 'all' ? 'general' : selectedCategory
        }),
      });

      if (response.ok) {
        setNewMoment('');
        fetchMoments();
      }
    } catch (error) {
      console.error('Error submitting moment:', error);
    }
  };

  const handleCommentSubmit = async (momentId) => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:5001/api/moments/${momentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        setActiveMomentId(null);
        fetchMoments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Unhappy Moments</h1>
        <p className="subtitle">Share your thoughts anonymously</p>
      </header>
      
      <div className="category-selector">
        <button 
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          All Posts
        </button>
        <button 
          className={selectedCategory === 'daily-irritations' ? 'active' : ''}
          onClick={() => setSelectedCategory('daily-irritations')}
        >
          Daily Irritations
        </button>
        <button 
          className={selectedCategory === 'random-events' ? 'active' : ''}
          onClick={() => setSelectedCategory('random-events')}
        >
          Random Events
        </button>
      </div>

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
              <div className="moment-header">
                <span className="moment-category">{moment.category}</span>
                <span className="moment-time">
                  {new Date(moment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="moment-content">{moment.content}</p>
              
              <div className="comments-section">
                {moment.comments && moment.comments.length > 0 && (
                  <div className="comments-list">
                    {moment.comments.map((comment, index) => (
                      <div key={index} className="comment">
                        <p>{comment.content}</p>
                        <span className="comment-time">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeMomentId === moment._id ? (
                  <div className="comment-form">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="comment-input"
                    />
                    <div className="comment-buttons">
                      <button 
                        onClick={() => handleCommentSubmit(moment._id)}
                        className="submit-comment-button"
                      >
                        Submit
                      </button>
                      <button 
                        onClick={() => {
                          setActiveMomentId(null);
                          setNewComment('');
                        }}
                        className="cancel-comment-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setActiveMomentId(moment._id)}
                    className="add-comment-button"
                  >
                    Add Comment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
