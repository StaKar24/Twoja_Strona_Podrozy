const db = require('../config/database');

class Trip {
  // Wszystkie podróże
  static findAll(userId = null, isAdmin = false) {
    return new Promise((resolve, reject) => {
      let query = `SELECT trips.*, users.username 
      FROM trips 
      JOIN users ON trips.user_id = users.id`;
      let params = [];

      if (!isAdmin) {
        // Zwykli użytkownicy widzą tylko opublikowane
        query += ' WHERE status = ?';
        params.push('published');
      } 

      query += ' ORDER BY start_date DESC';

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Jedna podróż po ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT trips.*, users.username 
         FROM trips 
         JOIN users ON trips.user_id = users.id 
         WHERE trips.id = ?`,
        [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Stworzenie nowej podróży
  static create(userId, title, description, startDate, endDate, status = 'draft') {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO trips (user_id, title, description, start_date, end_date, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, title, description, startDate, endDate, status],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              user_id: userId,
              title,
              description,
              start_date: startDate,
              end_date: endDate,
              status
            });
          }
        }
      );
    });
  }

  // Aktualizacja podróży
  static update(id, data) {
    return new Promise((resolve, reject) => {
      const { title, description, start_date, end_date, status } = data;
      
      db.run(
        `UPDATE trips 
         SET title = ?, description = ?, start_date = ?, end_date = ?, status = ?
         WHERE id = ?`,
        [title, description, start_date, end_date, status, id],
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

  // Usunięcie podróży
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM trips WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: this.changes > 0 });
        }
      });
    });
  }

  // Sprawdź czy podróż należy do użytkownika
  static async belongsToUser(tripId, userId) {
    const trip = await this.findById(tripId);
    return trip && trip.user_id === userId;
  }
}

module.exports = Trip;