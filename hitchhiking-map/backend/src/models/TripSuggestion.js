const db = require('../config/database');

class TripSuggestion {
  // Wszystkie sugestie dla podróży właściciela (admin)
  static findByTripOwnerId(ownerId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT trip_suggestions.*, users.username, trips.title as trip_title
         FROM trip_suggestions 
         JOIN users ON trip_suggestions.user_id = users.id 
         LEFT JOIN trips ON trip_suggestions.trip_id = trips.id
         WHERE trips.user_id = ?
         ORDER BY created_at DESC`,
        [ownerId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Wszystkie sugestie
  static findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT trip_suggestions.*, users.username, trips.title as trip_title, trips.user_id as trip_owner_id
         FROM trip_suggestions 
         JOIN users ON trip_suggestions.user_id = users.id 
         LEFT JOIN trips ON trip_suggestions.trip_id = trips.id
         ORDER BY created_at DESC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Sugestie danego użytkownika 
  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM trip_suggestions 
         WHERE user_id = ? 
         ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Jedna sugestia po ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT trip_suggestions.*, users.username, trips.title as trip_title, trips.user_id as trip_owner_id
         FROM trip_suggestions 
         JOIN users ON trip_suggestions.user_id = users.id 
         LEFT JOIN trips ON trip_suggestions.trip_id = trips.id
         WHERE trip_suggestions.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Stworzenie sugestii
  static create(userId, tripId, title, content) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO trip_suggestions (user_id, trip_id, title, content) VALUES (?, ?, ?, ?)',
        [userId, tripId, title, content],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              user_id: userId,
              trip_id: tripId,
              title,
              content,
              status: 'pending'
            });
          }
        }
      );
    });
  }

  // Aktualizacja statusu (admin)
  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE trip_suggestions SET status = ? WHERE id = ?',
        [status, id],
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

  // Usunięcie sugestii
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM trip_suggestions WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: this.changes > 0 });
        }
      });
    });
  }

  // Sprawdź czy sugestia należy do użytkownika
  static async belongsToUser(suggestionId, userId) {
    const suggestion = await this.findById(suggestionId);
    return suggestion && suggestion.user_id === userId;
  }
}

module.exports = TripSuggestion;