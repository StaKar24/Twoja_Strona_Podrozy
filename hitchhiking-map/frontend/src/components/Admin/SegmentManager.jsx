import { useState, useEffect } from 'react';
import { segments as segmentsAPI } from '../../services/api';
import MapPicker from './MapPicker';

const SegmentManager = ({ trip, onClose }) => {
  const [segments, setSegments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(null); 
  const [formData, setFormData] = useState({
    start_lat: '',
    start_lng: '',
    end_lat: '',
    end_lng: '',
    start_name: '',
    end_name: '',
    transport_type: 'hitchhiking',
    start_time: '',
    end_time: '',
    description: '',
    segment_order: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleEdit = (segment) => {
    setEditingSegment(segment);
    
    // Konwersja datetime
    const formatDateTime = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toISOString().slice(0, 16);
    };

    setFormData({
      start_lat: segment.start_lat.toString(),
      start_lng: segment.start_lng.toString(),
      end_lat: segment.end_lat.toString(),
      end_lng: segment.end_lng.toString(),
      start_name: segment.start_name || '',
      end_name: segment.end_name || '',
      transport_type: segment.transport_type,
      start_time: formatDateTime(segment.start_time),
      end_time: formatDateTime(segment.end_time),
      description: segment.description || '',
      segment_order: segment.segment_order ? segment.segment_order.toString() : ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingSegment(null);
    setShowForm(false);
    setFormData({
      start_lat: '',
      start_lng: '',
      end_lat: '',
      end_lng: '',
      start_name: '',
      end_name: '',
      transport_type: 'hitchhiking',
      start_time: '',
      end_time: '',
      description: '',
      segment_order: ''
    });
    setError('');
  };


  const handleMapClick = (lat, lng) => {
    if (showMapPicker === 'start') {
      setFormData({
        ...formData,
        start_lat: lat.toFixed(6),
        start_lng: lng.toFixed(6)
      });
    } else if (showMapPicker === 'end') {
      setFormData({
        ...formData,
        end_lat: lat.toFixed(6),
        end_lng: lng.toFixed(6)
      });
    }
    setShowMapPicker(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try{
     const segmentData = {
      trip_id: trip.id,
      start_lat: parseFloat(formData.start_lat),
      start_lng: parseFloat(formData.start_lng),
      end_lat: parseFloat(formData.end_lat),
      end_lng: parseFloat(formData.end_lng),
      start_name: formData.start_name || null,
      end_name: formData.end_name || null,
      transport_type: formData.transport_type,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      description: formData.description || null,
      segment_order: formData.segment_order ? parseInt(formData.segment_order) : null
     };

     if (editingSegment) {
      // regenerate_route jeśli zmieniły się współrzędne
      const coordsChanged = 
        formData.start_lat !== editingSegment.start_lat.toString() ||
        formData.start_lng !== editingSegment.start_lng.toString() ||
        formData.end_lat !== editingSegment.end_lat.toString() ||
        formData.end_lng !== editingSegment.end_lng.toString() ||
        formData.transport_type !== editingSegment.transport_type;

       if (coordsChanged) {
        segmentData.regenerate_route = true;
      }

      await segmentsAPI.update(editingSegment.id, segmentData);
     } else {
      // Tworzenie nowego
      await segmentsAPI.create(segmentData);
     }
      handleCancelEdit();
      loadSegments();

    } catch (err) {
      setError(err.response?.data?.error || 'Błąd tworzenia segmentu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (segmentId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten segment?')) {
      return;
    }

    try {
      await segmentsAPI.delete(segmentId);
      loadSegments();
    } catch (err) {
      alert('Błąd usuwania segmentu: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="segment-manager">
      <div className="manager-header">
        <div>
          <h3>Segmenty: {trip.title}</h3>
          <p className="subtitle">Liczba segmentów: {segments.length}</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Anuluj' : '+ Nowy segment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="segment-form">
          <h4>Punkt początkowy</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Szerokość geograficzna *</label>
              <div className="input-with-button">
                <input
                  type="number"
                  name="start_lat"
                  value={formData.start_lat}
                  onChange={handleChange}
                  step="0.0001"
                  required
                  placeholder="67.2137"
                />
                <button
                  type="button"
                  className="btn-map-pick"
                  onClick={() => setShowMapPicker('start')}
                >
                   Kliknij na mapie
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Długość geograficzna *</label>
              <input
                type="number"
                name="start_lng"
                value={formData.start_lng}
                onChange={handleChange}
                step="0.0001"
                required
                placeholder="21.0420"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nazwa miejsca</label>
            <input
              type="text"
              name="start_name"
              value={formData.start_name}
              onChange={handleChange}
            />
          </div>

          <h4>Punkt końcowy</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Szerokość geograficzna *</label>
              <div className="input-with-button">
                <input
                  type="number"
                  name="end_lat"
                  value={formData.end_lat}
                  onChange={handleChange}
                  step="0.0001"
                  required
                  placeholder="69.4020"
                />
                <button
                  type="button"
                  className="btn-map-pick"
                  onClick={() => setShowMapPicker('end')}
                >
                    Kliknij na mapie
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Długość geograficzna *</label>
              <input
                type="number"
                name="end_lng"
                value={formData.end_lng}
                onChange={handleChange}
                step="0.0001"
                required
                placeholder="42.3212"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nazwa miejsca</label>
            <input
              type="text"
              name="end_name"
              value={formData.end_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Typ transportu</label>
              <select
                name="transport_type"
                value={formData.transport_type}
                onChange={handleChange}
              >
                <option value="hitchhiking">Autostop</option>
                <option value="train">Pociąg</option>
                <option value="bus">Autobus</option>
                <option value="ferry">Prom</option>
                <option value="walk">Pieszo</option>
                <option value="bike">Rower</option>
                <option value="other">Inne</option>
              </select>
            </div>

            <div className="form-group">
              <label>Kolejność</label>
              <input
                type="number"
                name="segment_order"
                value={formData.segment_order}
                onChange={handleChange}
                placeholder="1, 2, 3..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Czas rozpoczęcia</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Czas zakończenia</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Opis / Notatki</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Dodatkowe informacje o tym odcinku."
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Tworzenie (generowanie trasy)' : 'Utwórz segment'}
          </button>
        </form>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          onMapClick={handleMapClick}
          onClose={() => setShowMapPicker(null)}
          pointType={showMapPicker}
        />
      )}

      {/* Lista segmentów */}
      <div className="segments-list">
        {segments.length === 0 ? (
          <p className="empty-state">Brak segmentów. Dodaj pierwszy!</p>
        ) : (
          segments.map((segment, index) => (
            <div key={segment.id} className="segment-item">
              <div className="segment-item-header">
                <span className="segment-number">#{index + 1}</span>
                <span className={`transport-badge ${segment.transport_type}`}>
                  {segment.transport_type}
                </span>
              </div>

              <div className="segment-route">
                <div>{`${segment.start_name}: ${segment.start_lat}, ${segment.start_lng}`}</div>
                <div className="route-arrow">-&gt;</div>
                <div>{`${segment.end_name}: ${segment.end_lat}, ${segment.end_lng}`}</div>
              </div>

              {segment.distance && (
                <div className="segment-distance">
                   {Math.round(segment.distance / 1000)} km
                </div>
              )}

              {segment.description && (
                <div className="segment-description">{segment.description}</div>
              )}

              <div className="segment-item-actions">
                <button 
                  className="btn-edit-small"
                  onClick={() => handleEdit(segment)}
                >
                  Edytuj
                </button>
                <button 
                  className="btn-danger-small"
                  onClick={() => handleDelete(segment.id)}
                >
                  Usuń
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SegmentManager;