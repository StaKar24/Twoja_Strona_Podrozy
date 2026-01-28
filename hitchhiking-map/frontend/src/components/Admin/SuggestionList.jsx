import { useState, useEffect } from 'react';
import { suggestions as suggestionsAPI } from '../../services/api';

const SuggestionList = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await suggestionsAPI.getAll();
      setSuggestions(response.data.suggestions);
      setLoading(false);
    } catch (error) {
      console.error('Błąd ładowania sugestii:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await suggestionsAPI.updateStatus(id, newStatus);
      loadSuggestions();
    } catch (error) {
      alert('Błąd zmiany statusu: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę sugestię?')) {
      return;
    }

    try {
      await suggestionsAPI.delete(id);
      loadSuggestions();
    } catch (error) {
      alert('Błąd usuwania: ' + (error.response?.data?.error || error.message));
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

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'status-pending',
      reviewed: 'status-reviewed',
      accepted: 'status-accepted',
      rejected: 'status-rejected'
    };
    return classes[status] || '';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Oczekuje',
      reviewed: 'Przejrzane',
      accepted: 'Zaakceptowane',
      rejected: 'Odrzucone'
    };
    return texts[status] || status;
  };

  if (loading) {
    return <div className="loading-state">Ładowanie sugestii...</div>;
  }

  return (
    <div className="suggestion-list">
      <div className="manager-header">
        <h3>Sugestie użytkowników</h3>
        <p className="subtitle">Liczba sugestii: {suggestions.length}</p>
      </div>

      {suggestions.length === 0 ? (
        <p className="empty-state">Brak sugestii od użytkowników</p>
      ) : (
        <div className="suggestions-container">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="suggestion-header">
                <div>
                  <h4>{suggestion.title}</h4>
                  <div className="suggestion-meta">
                    <span>{suggestion.username}</span>
                    <span>{formatDate(suggestion.created_at)}</span>
                    {suggestion.trip_title && (
                      <span>{suggestion.trip_title}</span>
                    )}
                  </div>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(suggestion.status)}`}>
                  {getStatusText(suggestion.status)}
                </span>
              </div>

              <div className="suggestion-content">
                <p>{suggestion.content}</p>
              </div>

              <div className="suggestion-actions">
                <select
                  value={suggestion.status}
                  onChange={(e) => handleStatusChange(suggestion.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Oczekuje</option>
                  <option value="reviewed">Przejrzane</option>
                  <option value="accepted">Zaakceptowane</option>
                  <option value="rejected">Odrzucone</option>
                </select>
                <button
                  className="btn-danger-small"
                  onClick={() => handleDelete(suggestion.id)}
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionList;