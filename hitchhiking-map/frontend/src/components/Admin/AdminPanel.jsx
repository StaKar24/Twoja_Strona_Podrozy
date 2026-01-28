import { useState, useEffect } from 'react';
import { trips as tripsAPI } from '../../services/api';
import TripManager from './TripManager';
import SegmentManager from './SegmentManager';
import SuggestionList from './SuggestionList';
import './AdminPanel.css';

const AdminPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('trips');
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTrips();
    }
  }, [isOpen]);

  const loadTrips = async () => {
    try {
      const response = await tripsAPI.getAll();
      setTrips(response.data.trips);
    } catch (error) {
      console.error('Błąd ładowania podróży:', error);
    }
  };

  const handleTripCreated = () => {
    loadTrips();
  };

  const handleTripDeleted = () => {
    loadTrips();
    setSelectedTrip(null);
  };

  if (!isOpen) return null;

  return (
    <div className="admin-panel-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel-header">
          <h2>Panel Admina</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="admin-panel-tabs">
          <button 
            className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
             Podróże
          </button>
          <button 
            className={`tab-btn ${activeTab === 'segments' ? 'active' : ''}`}
            onClick={() => setActiveTab('segments')}
            disabled={!selectedTrip}
          >
             Segmenty {selectedTrip && `(${selectedTrip.title})`}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
             Sugestie
          </button>
        </div>

        <div className="admin-panel-content">
          {activeTab === 'trips' && (
            <TripManager 
              trips={trips}
              onTripCreated={handleTripCreated}
              onTripDeleted={handleTripDeleted}
              onTripSelected={setSelectedTrip}
              selectedTrip={selectedTrip}
            />
          )}

          {activeTab === 'segments' && selectedTrip && (
            <SegmentManager 
              trip={selectedTrip}
              onClose={() => setActiveTab('trips')}
            />
          )}

          {activeTab === 'suggestions' && (
            <SuggestionList />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;