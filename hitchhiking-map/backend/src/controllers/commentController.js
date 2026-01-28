const Comment = require('../models/Comment');
const Segment = require('../models/Segment');

// GET komentarze dla segmentu 
exports.getCommentsBySegment = async (req, res) => {
  try {
    const { segmentId } = req.params;

    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Segment nie znaleziony' });
    }

    const comments = await Comment.findBySegmentId(segmentId);

    res.json({
      comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Błąd pobierania komentarzy:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// POST nowy komentarz 
exports.createComment = async (req, res) => {
  try {
    const { segment_id, content } = req.body;

    if (!segment_id || !content) {
      return res.status(400).json({ 
        error: 'Wymagane: segment_id i content' 
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Komentarz nie może być pusty' 
      });
    }

    const segment = await Segment.findById(segment_id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment nie znaleziony' });
    }

    const comment = await Comment.create(
      segment_id,
      req.user.userId,
      content.trim()
    );

    const fullComment = await Comment.findById(comment.id);

    res.status(201).json({
      message: 'Komentarz dodany',
      comment: fullComment
    });
  } catch (error) {
    console.error('Błąd tworzenia komentarza:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// DELETE komentarz
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Komentarz nie znaleziony' });
    }

    // Stylko autor lub admin
    if (req.user.userId !== comment.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Możesz usuwać tylko swoje komentarze' 
      });
    }

    await Comment.delete(id);

    res.json({
      message: 'Komentarz usunięty',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('Błąd usuwania komentarza:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};