const db = require('../config/database');

class Segment {
  // Wszystkie segmenty dla danej podróży
  static findByTripId(tripId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM segments WHERE trip_id = ? ORDER BY segment_order ASC, start_time ASC',
        [tripId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Jeden segment po ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM segments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Stworzenie nowego segmentu
  static create(data) {
    return new Promise((resolve, reject) => {
      const {
        trip_id,
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        start_name,
        end_name,
        route_geometry,
        distance,
        transport_type,
        start_time,
        end_time,
        description,
        photo_url,
        segment_order
      } = data;

      db.run(
        `INSERT INTO segments (
          trip_id, start_lat, start_lng, end_lat, end_lng,
          start_name, end_name, route_geometry, distance, transport_type,
          start_time, end_time, description, photo_url, segment_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trip_id, start_lat, start_lng, end_lat, end_lng,
          start_name, end_name, route_geometry, distance, transport_type,
          start_time, end_time, description, photo_url, segment_order
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              ...data
            });
          }
        }
      );
    });
  }

  // Aktualizacja segmentu
  static update(id, data) {
    return new Promise((resolve, reject) => {
      const {
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        start_name,
        end_name,
        route_geometry,
        distance,
        transport_type,
        start_time,
        end_time,
        description,
        photo_url,
        segment_order
      } = data;

      db.run(
        `UPDATE segments SET
          start_lat = ?, start_lng = ?, end_lat = ?, end_lng = ?,
          start_name = ?, end_name = ?, route_geometry = ?, distance = ?,
          transport_type = ?, start_time = ?, end_time = ?,
          description = ?, photo_url = ?, segment_order = ?
         WHERE id = ?`,
        [
          start_lat, start_lng, end_lat, end_lng,
          start_name, end_name, route_geometry, distance,
          transport_type, start_time, end_time,
          description, photo_url, segment_order, id
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, changes: this.changes });
          }
        }
      );
    });
  }

  // Usunięcie segmentu
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM segments WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: this.changes > 0 });
        }
      });
    });
  }

  // Pobierz trip_id dla segmentu
  static async getTripId(segmentId) {
    const segment = await this.findById(segmentId);
    return segment ? segment.trip_id : null;
  }
}

module.exports = Segment;