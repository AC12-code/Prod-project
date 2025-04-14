import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [moments, setMoments] = useState([]);
  const [newMoment, setNewMoment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newComment, setNewComment] = useState('');
  const [activeMomentId, setActiveMomentId] = useState(null);
  const [editingMomentId, setEditingMomentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editMomentContent, setEditMomentContent] = useState('');
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ type: null, momentId: null, commentId: null });

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

  const handleEditMoment = async (momentId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/moments/${momentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: editMomentContent,
          category: selectedCategory === 'all' ? 'general' : selectedCategory
        }),
      });

      if (response.ok) {
        setEditingMomentId(null);
        setEditMomentContent('');
        fetchMoments();
      }
    } catch (error) {
      console.error('Error updating moment:', error);
    }
  };

  const handleDeleteMoment = async (momentId) => {
    setItemToDelete({ type: 'moment', momentId });
    setShowDeleteConfirmation(true);
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

  const handleEditComment = async (momentId, commentId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/moments/${momentId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editCommentContent }),
      });

      if (response.ok) {
        setEditingCommentId(null);
        setEditCommentContent('');
        fetchMoments();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (momentId, commentId) => {
    setItemToDelete({ type: 'comment', momentId, commentId });
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      if (itemToDelete.type === 'moment') {
        const response = await fetch(`http://localhost:5001/api/moments/${itemToDelete.momentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchMoments();
        }
      } else if (itemToDelete.type === 'comment') {
        const response = await fetch(
          `http://localhost:5001/api/moments/${itemToDelete.momentId}/comments/${itemToDelete.commentId}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          fetchMoments();
        }
      }
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setShowDeleteConfirmation(false);
      setItemToDelete({ type: null, momentId: null, commentId: null });
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete({ type: null, momentId: null, commentId: null });
  };

  return (
    <div className="App">
      {showDeleteConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this {itemToDelete.type}?</p>
            <div className="confirmation-buttons">
              <button onClick={confirmDelete} className="confirm-delete-button">
                Yes, Delete
              </button>
              <button onClick={cancelDelete} className="cancel-delete-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className="moment-actions">
                  <button 
                    onClick={() => {
                      setEditingMomentId(moment._id);
                      setEditMomentContent(moment.content);
                    }}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteMoment(moment._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {editingMomentId === moment._id ? (
                <div className="edit-form">
                  <textarea
                    value={editMomentContent}
                    onChange={(e) => setEditMomentContent(e.target.value)}
                    className="moment-input"
                  />
                  <div className="edit-buttons">
                    <button 
                      onClick={() => handleEditMoment(moment._id)}
                      className="save-button"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        setEditingMomentId(null);
                        setEditMomentContent('');
                      }}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="moment-content">{moment.content}</p>
                  <span className="moment-time">
                    {new Date(moment.createdAt).toLocaleString()}
                  </span>
                </>
              )}
              
              <div className="comments-section">
                {moment.comments && moment.comments.length > 0 && (
                  <div className="comments-list">
                    {moment.comments.map((comment) => {
                      console.log('Comment data:', comment);
                      return (
                        <div key={comment._id} className="comment">
                          {editingCommentId === comment._id ? (
                            <div className="edit-comment-form">
                              <textarea
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                className="comment-input"
                              />
                              <div className="comment-edit-buttons">
                                <button 
                                  onClick={() => handleEditComment(moment._id, comment._id)}
                                  className="save-button"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditCommentContent('');
                                  }}
                                  className="cancel-button"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{comment.content}</p>
                              <div className="comment-footer">
                                <span className="comment-time">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                                <div className="comment-actions">
                                  <button 
                                    onClick={() => {
                                      setEditingCommentId(comment._id);
                                      setEditCommentContent(comment.content);
                                    }}
                                    className="edit-button"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteComment(moment._id, comment._id)}
                                    className="delete-button"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
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
