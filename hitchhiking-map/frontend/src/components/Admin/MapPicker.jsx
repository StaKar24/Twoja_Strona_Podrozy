import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

//ikony Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// obsługa kliknięć na mapie
const MapClickHandler = ({ onClick, setClickedPosition }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setClickedPosition([lat, lng]);
      onClick(lat, lng);
    },
  });
  return null;
};

const MapPicker = ({ onMapClick, onClose, pointType }) => {
  const [clickedPosition, setClickedPosition] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (clickedPosition) {
      onMapClick(clickedPosition[0], clickedPosition[1]);
      setConfirmed(true);
    }
  };

  return (
    <div className="map-picker-overlay">
      <div className="map-picker-container">
        <div className="map-picker-header">
          <h3>
            {pointType === 'start' ? 'Wybierz punkt początkowy' : 'Wybierz punkt końcowy'}
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="map-picker-instructions">
          <p>Kliknij na mapie, aby wybrać współrzędne punktu</p>
          {clickedPosition && (
            <div className="picked-coords">
              ✓ Wybrano: {clickedPosition[0].toFixed(6)}, {clickedPosition[1].toFixed(6)}
            </div>
          )}
        </div>

        <div className="map-picker-map">
          <MapContainer
            center={[52.0, 19.0]}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler 
              onClick={(lat, lng) => setClickedPosition([lat, lng])}
              setClickedPosition={setClickedPosition}
            />
            {clickedPosition && (
              <Marker position={clickedPosition} />
            )}
          </MapContainer>
        </div>

        <div className="map-picker-actions">
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Anuluj
          </button>
          <button 
            className="btn-primary"
            onClick={handleConfirm}
            disabled={!clickedPosition || confirmed}
          >
            {confirmed ? 'Zapisano' : 'Potwierdź wybór'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;