import { useEffect, useState } from 'react';
import { comments as commentsAPI  } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './CommentSection.css';

const CommentSection = ({ segment }) => {
    const { user, isAdmin, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadComments = async () => {
    try {
        const response = await commentsAPI.getBySegment(segment.id);
        setComments(response.data.comments);
    } catch (error) {
        console.error('Błąd ładowania komentarzy:', error);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        loadComments();
    }, [segment.id]);

   

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
    
        setSubmitting(true);
        setError('');
    
        try {
          await commentsAPI.create({
            segment_id: segment.id,
            content: commentText.trim()
          });
          
          setCommentText('');
          setShowForm(false);
          loadComments(); // Odśwież listę
        } catch (err) {
          setError(err.response?.data?.error || 'Błąd dodawania komentarza');
        } finally {
          setSubmitting(false);
        }
      };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten komentarz?')) {
          return;
        }
    
        try {
          await commentsAPI.delete(commentId);
          loadComments();
        } catch (err) {
          alert('Błąd usuwania: ' + (err.response?.data?.error || err.message));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

    return (
        <div className="comment-section">
        <div className="comment-section-header">
          <h4> Komentarze ({comments.length})</h4>
          {isAuthenticated && !showForm && (
            <button 
              className="btn-add-comment"
              onClick={() => setShowForm(true)}
            >
              + Dodaj komentarz
            </button>
          )}
        </div>
  
        {/* Formularz dodawania */}
        {showForm && (
          <form onSubmit={handleSubmit} className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Napisz komentarz..."
              rows="3"
              required
              maxLength="500"
            />
            
            {error && <div className="error-message">{error}</div>}
  
            <div className="comment-form-actions">
              <button 
                type="button" 
                className="btn-cancel-comment"
                onClick={() => {
                  setShowForm(false);
                  setCommentText('');
                  setError('');
                }}
              >
                Anuluj
              </button>
              <button 
                type="submit" 
                className="btn-submit-comment"
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? 'Wysyłanie...' : 'Wyślij'}
              </button>
            </div>
          </form>
        )}
  
        {/* Lista komentarzy */}
        <div className="comments-list">
          {loading ? (
            <p className="loading-comments">Ładowanie komentarzy...</p>
          ) : comments.length === 0 ? (
            <p className="no-comments">Brak komentarzy. Bądź pierwszym!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.username}
                  </span>
                  <span className="comment-date">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                
                <p className="comment-content">{comment.content}</p>
  
                {/* Przycisk usuń */}
                {(user && (user.id === comment.user_id || isAdmin())) && (
                  <button
                    className="btn-delete-comment"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Usuń
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
};


export default CommentSection;