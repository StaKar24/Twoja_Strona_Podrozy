import { useState, useEffect } from 'react';
import { suggestions as suggestionsAPI} from '../../services/api';
//import { useAuth } from '../../context/AuthContext';
import './UserPanel.css';

const UserPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  //const { user } = useAuth();

  const loadUserData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'suggestions') {
        const response = await suggestionsAPI.getAll();
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Błąd ładowania danych:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, activeTab]);


  const handleDeleteSuggestion = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę sugestię?')) {
      return;
    }

    try {
      await suggestionsAPI.delete(id);
      loadUserData();
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

  if (!isOpen) return null;

  return (
    <div className="user-panel-overlay" onClick={onClose}>
      <div className="user-panel" onClick={(e) => e.stopPropagation()}>
        <div className="user-panel-header">
          <h2> Mój Panel</h2>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>

        <div className="user-panel-tabs">
          <button 
            className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
             Moje sugestie
          </button>
        </div>

        <div className="user-panel-content">
          {activeTab === 'suggestions' && (
            <div className="suggestions-section">
              <div className="section-header">
                <h3>Twoje sugestie</h3>
                <span className="count-badge">{suggestions.length}</span>
              </div>

              {loading ? (
                <div className="loading-state">Ładowanie...</div>
              ) : suggestions.length === 0 ? (
                <div className="empty-state">
                  <p>Nie wysłałeś jeszcze żadnych sugestii.</p>
                  <p className="hint"> Przeglądaj podróże na mapie i kliknij "Zasugeruj coś"</p>
                </div>
              ) : (
                <div className="suggestions-list">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="user-suggestion-card">
                      <div className="suggestion-header">
                        <div>
                          <h4>{suggestion.title}</h4>
                          {suggestion.trip_title && (
                            <p className="trip-reference"> {suggestion.trip_title}</p>
                          )}
                        </div>
                        <span className={`status-badge ${getStatusBadgeClass(suggestion.status)}`}>
                          {getStatusText(suggestion.status)}
                        </span>
                      </div>

                      <p className="suggestion-content">{suggestion.content}</p>

                      <div className="suggestion-footer">
                        <span className="suggestion-date">
                           {formatDate(suggestion.created_at)}
                        </span>
                        <button
                          className="btn-delete-small"
                          onClick={() => handleDeleteSuggestion(suggestion.id)}
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPanel;