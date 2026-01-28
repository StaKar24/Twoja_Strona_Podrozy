import { useState } from 'react';
import { trips as tripsAPI } from '../../services/api';

const TripManager = ({ trips, onTripCreated, onTripDeleted, onTripSelected, selectedTrip }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      description: trip.description || '',
      start_date: trip.start_date || '',
      end_date: trip.end_date || '',
      status: trip.status
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingTrip(null);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'draft'
    });
    setError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingTrip) {
        await tripsAPI.update(editingTrip.id, formData);
      } else {
        await tripsAPI.create(formData);
      }
      
      handleCancelEdit();
      onTripCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd zapisywania podróży');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę podróż? Zostaną usunięte wszystkie segmenty!')) {
      return;
    }

    try {
      await tripsAPI.delete(tripId);
      onTripDeleted();
    } catch (err) {
      alert('Błąd usuwania podróży: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  return (
    <div className="trip-manager">
      <div className="manager-header">
        <h3>Twoje podróże</h3>
        <button 
          className="btn-primary"
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
        >
        {showForm ? 'Anuluj' : '+ Nowa podróż'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="trip-form">
          <h4>{editingTrip ? 'Edytuj podróż' : 'Nowa podróż'}</h4>

          <div className="form-group">
            <label>Tytuł </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Opis</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Krótki opis podróży..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data startu</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Data końca</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Wersja robocza</option>
              <option value="published">Opublikowane</option>
              <option value="archived">Zarchiwizowane</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Tworzenie...' : (editingTrip ? 'Zedytuj podróż' : 'Utwórz podróż')}
          </button>
        </form>
      )}

      <div className="trips-list">
        {trips.length === 0 ? (
          <p className="empty-state">Nie masz jeszcze żadnych podróży. Utwórz pierwszą!</p>
        ) : (
          trips.map(trip => (
            <div 
              key={trip.id} 
              className={`trip-item ${selectedTrip?.id === trip.id ? 'selected' : ''}`}
              onClick={() => onTripSelected(trip)}
            >
              <div className="trip-item-header">
                <h4>{trip.title}</h4>
                <span className={`status-badge ${trip.status}`}>
                  {trip.status === 'draft' && 'Wersja robocza'}
                  {trip.status === 'published' && 'Opublikowane'}
                  {trip.status === 'archived' && 'Zarchiwizowane'}
                </span>
              </div>

              {trip.description && (
                <p className="trip-description">{trip.description}</p>
              )}

              <div className="trip-meta">
                {trip.start_date && (
                  <span>{formatDate(trip.start_date)}</span>
                )}
                {trip.end_date && (
                  <span>-&gt; {formatDate(trip.end_date)}</span>
                )}
              </div>
              <div className="trip-meta">
                  <span>Autor: {trip.username || 'Nieznany'}</span>
              </div>

              <div className="trip-actions">
                <button 
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTripSelected(trip);
                  }}
                >
                  Zarządzaj segmentami
                </button>
                <button 
                  className="btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(trip);
                  }}
                >
                  Edytuj
                </button>
                <button 
                  className="btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(trip.id);
                  }}
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

export default TripManager;