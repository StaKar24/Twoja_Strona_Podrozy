const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

// GET /api/comments/segment/:segmentId (publiczne)
router.get('/segment/:segmentId', commentController.getCommentsBySegment);

// POST /api/comments (tylko zalogowani)
router.post('/', authenticate, commentController.createComment);

// DELETE /api/comments/:id  ( admin)
router.delete('/:id', authenticate, commentController.deleteComment); //requireAdmin

module.exports = router;