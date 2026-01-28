import { useEffect, useState } from 'react';
import { suggestions as suggestionsAPI , segments as segmentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';
import CommentSection from '../User/CommentSection';

const Sidebar = ({ trip, onClose }) => {
  const [segments, setSegments] = useState([]);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionData, setSuggestionData] = useState({ title: '', content: '' });
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const {isAuthenticated} = useAuth();

  const loadSegments = async () => {
    try {
      const response = await segmentsAPI.getByTrip(trip.id);
      setSegments(response.data.segments);
    } catch (error) {
      console.error('Błąd ładowania segmentów:', error);
    }
  };

  useEffect(() => {
    loadSegments();
  }, [trip.id]);

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    setSuggestionLoading(true);
    setSuggestionError('');

    try {
      await suggestionsAPI.create({
        trip_id: trip.id,
        title: suggestionData.title,
        content: suggestionData.content
      });
      
      setSuggestionSuccess(true);
      setSuggestionData({ title: '', content: '' });
      
      setTimeout(() => {
        setShowSuggestionForm(false);
        setSuggestionSuccess(false);
      }, 2000);
    } catch (error) {
      setSuggestionError(error.response?.data?.error || 'Błąd wysyłania sugestii');
    } finally {
      setSuggestionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Brak daty';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pl-PL');
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}min`;
  };

  const totalDistance = segments.reduce((sum, seg) => sum + (seg.distance || 0), 0);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{trip.title}</h2>
        <button onClick={onClose} className="close-btn">x</button>
      </div>

      <div className="sidebar-content">
        {trip.description && (
          <div className="trip-description">
            <p>{trip.description}</p>
          </div>
        )}

        <div className="trip-info">
          <div className="info-item">
            <strong>Początek:</strong> {formatDate(trip.start_date)}
          </div>
          {trip.end_date && (
            <div className="info-item">
              <strong>Koniec:</strong> {formatDate(trip.end_date)}
            </div>
          )}
          <div className="info-item">
            <strong>Całkowity dystans:</strong> {Math.round(totalDistance / 1000)} km
          </div>
          <div className="info-item">
            <strong>Liczba odcinków:</strong> {segments.length}
          </div>
        </div>

        <div className="segments-list">
          <h3>Odcinki podróży</h3>
          {segments.map((segment, index) => (
            <div key={segment.id} className="segment-card">
              <div className="segment-header">
                <span className="segment-number">#{index + 1}</span>
                <span className={`transport-badge ${segment.transport_type}`}>
                  {segment.transport_type}
                </span>
              </div>
              
              <div className="segment-route">
                <div className="route-point">
                   {segment.start_name || 'Punkt początkowy'}
                </div>
                <div className="route-arrow">v</div>
                <div className="route-point">
                   {segment.end_name || 'Punkt końcowy'}
                </div>
              </div>

              {segment.start_time && (
                <div className="segment-time">
                   {formatDateTime(segment.start_time)}
                  {segment.end_time && (
                    <span> → {formatDateTime(segment.end_time)}</span>
                  )}
                  {segment.end_time && (
                    <div className="duration">
                      Czas: {calculateDuration(segment.start_time, segment.end_time)}
                    </div>
                  )}
                </div>
              )}

              <div className="segment-distance">
                 {Math.round(segment.distance / 1000)} km
              </div>

              {segment.description && (
                <div className="segment-description">
                  {segment.description}
                </div>
              )}
              <CommentSection
              segment={segment}
              />

            </div>
            
            
          ))}

          {/* Przycisk sugestii */}
        { isAuthenticated && !showSuggestionForm && (
          <div className="suggestion-button-container">
            <button 
              className="btn-suggestion"
              onClick={() => setShowSuggestionForm(true)}
            >
               Zasugeruj coś do tej podróży
            </button>
          </div>
        )}

        {/* Formularz sugestii */}
        {showSuggestionForm && (
          <div className="suggestion-form-container">
            <h4> Twoja sugestia</h4>
            {suggestionSuccess ? (
              <div className="success-message">
                Sugestia wysłana! Autor podróży ją zobaczy.
              </div>
            ) : (
              <form onSubmit={handleSuggestionSubmit} className="suggestion-form">
                <div className="form-group">
                  <label>Tytuł</label>
                  <input
                    type="text"
                    value={suggestionData.title}
                    onChange={(e) => setSuggestionData({...suggestionData, title: e.target.value})}
                    placeholder="Tytuł sugestii"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Treść sugestii</label>
                  <textarea
                    value={suggestionData.content}
                    onChange={(e) => setSuggestionData({...suggestionData, content: e.target.value})}
                    placeholder="Opisz swoją sugestię..."
                    rows="4"
                    required
                  />
                </div>

                {suggestionError && (
                  <div className="error-message">{suggestionError}</div>
                )}

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => {
                      setShowSuggestionForm(false);
                      setSuggestionData({ title: '', content: '' });
                      setSuggestionError('');
                    }}
                  >
                    Anuluj
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit-suggestion"
                    disabled={suggestionLoading}
                  >
                    {suggestionLoading ? 'Wysyłanie...' : 'Wyślij sugestię'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
export default Sidebar;
