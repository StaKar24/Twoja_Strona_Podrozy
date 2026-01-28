import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { trips as tripsAPI, segments as segmentsAPI  } from '../../services/api';
import TripLayer from './TripLayer';
import TripSelector from './TripSelector';
import Sidebar from './Sidebar';
import './MapView.css';
import 'leaflet/dist/leaflet.css';

// Komponent do kontrolowania zoom/center mapy
const MapController = ({ selectedTrip, segments }) => {
    const map = useMap();
  
    useEffect(() => {
      if (selectedTrip && segments.length > 0) {
        // Znajdź granice (bounds) dla wybranej podróży
        const bounds = [];
        segments.forEach(segment => {
          if (segment.route_geometry && segment.route_geometry.coordinates) {
            segment.route_geometry.coordinates.forEach(coord => {
              bounds.push([coord[1], coord[0]]); // [lat, lng]
            });
          }
        });
  
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } else if (!selectedTrip) {
        map.setView([51.0, 12.0], 4);
      }
    }, [selectedTrip, segments, map]);
  
    return null;
  };

const MapView = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedTripSegments, setSelectedTripSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Załaduj podróże przy starcie
  useEffect(() => {
    loadTrips();
  }, []);

  // Załaduj segmenty gdy wybrano podróż
  useEffect(() => {
    if (selectedTrip) {
      loadTripSegments(selectedTrip.id);
      setShowSidebar(true);
    } else {
      setSelectedTripSegments([]);
    }
  }, [selectedTrip]);

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

  const loadTripSegments = async (tripId) => {
    try {
      const response = await segmentsAPI.getByTrip(tripId);
      setSelectedTripSegments(response.data.segments);
    } catch (error) {
      console.error('Błąd ładowania segmentów:', error);
    }
  };

  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    if (!trip) {
      setShowSidebar(false);
    }
  };

  const handleTripClick = (trip) => {
    if (!selectedTrip || selectedTrip.id !== trip.id) {
      setSelectedTrip(trip);
      setShowSidebar(true);
    }
  };

  const displayedTrips = selectedTrip ? [selectedTrip] : trips;

   return (
    <div className="map-container">
      {/* Przycisk otwierający selector */}
      <button 
        className="trip-selector-button"
        onClick={() => setShowTripSelector(true)}
      >
        <span className="selector-icon">🗺️</span>
        <span className="selector-text">
          {selectedTrip ? selectedTrip.title : 'Wszystkie podróże'}
        </span>
        <span className="selector-arrow">▼</span>
      </button>

      <MapContainer
        center={[52.0, 19.0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Kontroler mapy (zoom/center) */}
        <MapController 
          selectedTrip={selectedTrip} 
          segments={selectedTripSegments}
        />

        {/* Wyświetl podróże */}
        {displayedTrips.map((trip) => (
          <TripLayer
            key={trip.id}
            trip={trip}
            onTripClick={handleTripClick}
            isSelected={selectedTrip?.id === trip.id}
          />
        ))}
      </MapContainer>

      {/* Selector podróży */}
      <TripSelector
        isOpen={showTripSelector}
        onClose={() => setShowTripSelector(false)}
        onSelectTrip={handleSelectTrip}
        selectedTripId={selectedTrip?.id || null}
      />

      {/* Boczny panel z detalami */}
      {showSidebar && selectedTrip && (
        <Sidebar 
          trip={selectedTrip} 
          onClose={() => {
            setShowSidebar(false);
            setSelectedTrip(null);
          }} 
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner">Ładowanie map...</div>
        </div>
      )}
    </div>
  );
};


export default MapView;