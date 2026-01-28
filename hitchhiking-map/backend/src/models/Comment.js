const db = require('../config/database');

class Comment {
  // Wszystkie komentarze dla segmentu 
  static findBySegmentId(segmentId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT comments.*, users.username 
         FROM comments 
         JOIN users ON comments.user_id = users.id 
         WHERE segment_id = ? 
         ORDER BY created_at DESC`,
        [segmentId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Jeden komentarz po ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT comments.*, users.username 
         FROM comments 
         JOIN users ON comments.user_id = users.id 
         WHERE comments.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Stworzenie komentarza
  static create(segmentId, userId, content) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO comments (segment_id, user_id, content) VALUES (?, ?, ?)',
        [segmentId, userId, content],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              segment_id: segmentId,
              user_id: userId,
              content
            });
          }
        }
      );
    });
  }

  // Usunięcie komentarza
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: this.changes > 0 });
        }
      });
    });
  }

  static async getUserId(commentId) {
    const comment = await this.findById(commentId);
    return comment ? comment.user_id : null;
  }
}

module.exports = Comment;