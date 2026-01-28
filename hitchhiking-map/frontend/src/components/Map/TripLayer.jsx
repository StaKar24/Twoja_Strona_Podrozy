import { useEffect, useState } from 'react';
import { GeoJSON, Popup } from 'react-leaflet';
import { segments as segmentsAPI } from '../../services/api';

const TripLayer = ({ trip, onTripClick, isSelected }) => {
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    loadSegments();
  }, [trip.id]);

  const loadSegments = async () => {
    try {
      const response = await segmentsAPI.getByTrip(trip.id);
      setSegments(response.data.segments);
    } catch (error) {
      console.error('Błąd ładowania segmentów:', error);
    }
  };

  // Kolory dla różnych typów transportu
  const getColor = (transportType) => {
    const colors = {
      hitchhiking: '#3b82f6',  // niebieski
      train: '#10b981',        // zielony
      bus: '#f59e0b',          // pomarańczowy
      ferry: '#8b5cf6',        // fioletowy
      walk: '#ef4444',         // czerwony
      bike: '#ec4899',         // różowy
      other: '#64748b',        // szary
    };
    return colors[transportType] || '#3b82f6';
  };

  return (
    <>
      {segments.map((segment) => {
        if (!segment.route_geometry) return null;

        return (
          <GeoJSON
            key={segment.id}
            data={segment.route_geometry}
            style={{
              color: getColor(segment.transport_type),
              weight: isSelected ? 6 : 4,
              opacity: isSelected ? 1 : 0.7,
            }}
            eventHandlers={{
              click: () => onTripClick(trip),
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{trip.title}</h3>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Od:</strong> {segment.start_name || 'Punkt początkowy'}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Do:</strong> {segment.end_name || 'Punkt końcowy'}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Dystans:</strong> {Math.round(segment.distance / 1000)} km
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Transport:</strong> {segment.transport_type}
                </p>
                {segment.description && (
                  <p style={{ margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
                    {segment.description}
                  </p>
                )}
              </div>
            </Popup>
          </GeoJSON>
        );
      })}
    </>
  );
};

export default TripLayer;