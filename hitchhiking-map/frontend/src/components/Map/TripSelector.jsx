import { useState, useEffect } from 'react';
import { trips as tripsAPI } from '../../services/api';
import './TripSelector.css';

const TripSelector = ({ isOpen, onClose, onSelectTrip, selectedTripId }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTrips();
    }
  }, [isOpen]);

  const loadTrips = async () => {
    try {
      const response = await tripsAPI.getAll();
      setTrips(response.data.trips);
      setLoading(false);
    } catch (error) {
      console.error('Błąd ładowania podróży:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTripClick = (trip) => {
    onSelectTrip(trip);
    onClose();
  };

  const handleShowAll = () => {
    onSelectTrip(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="trip-selector-overlay" onClick={onClose}>
      <div className="trip-selector-panel" onClick={(e) => e.stopPropagation()}>
        <div className="trip-selector-header">
          <h2>Wybierz podróż</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="trip-selector-content">
          {/* Opcja "Wszystkie podróże" */}
          <div 
            className={`trip-card all-trips ${selectedTripId === null ? 'active' : ''}`}
            onClick={handleShowAll}
          >
            <div className="trip-card-icon">🌍</div>
            <div className="trip-card-info">
              <h3>Wszystkie podróże</h3>
              <p className="trip-card-description">
                Wyświetl wszystkie dostępne trasy na mapie
              </p>
            </div>
          </div>

          {/* Lista podróży */}
          {loading ? (
            <div className="trip-selector-loading">
              <div className="spinner">Ładowanie podróży...</div>
            </div>
          ) : trips.length === 0 ? (
            <div className="trip-selector-empty">
              <p>Brak dostępnych podróży</p>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                className={`trip-card ${selectedTripId === trip.id ? 'active' : ''}`}
                onClick={() => handleTripClick(trip)}
              >
                <div className="trip-card-content">
                  <h3 className="trip-card-title">{trip.title}</h3>
                  
                  {trip.description && (
                    <p className="trip-card-description">{trip.description}</p>
                  )}

                  <div className="trip-card-meta">
                    <div className="trip-card-dates">
                      <span className="meta-icon">📅</span>
                      <span>
                        {formatDate(trip.start_date)}
                        {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                      </span>
                    </div>

                    <div className="trip-card-author">
                      <span className="meta-icon">👤</span>
                      <span>Autor: {trip.username || 'Nieznany'}</span>
                    </div>
                  </div>

                  {trip.status === 'draft' && (
                    <span className="trip-badge draft">Wersja robocza</span>
                  )}
                  {trip.status === 'archived' && (
                    <span className="trip-badge archived">Zarchiwizowane</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TripSelector;