const express = require('express');
const router = express.Router();
require('dotenv').config();

// Store comments in memory for now (will move to Firebase)
const comments = [];

// Get all comments for a proposal
router.get('/proposal/:proposalId', (req, res) => {
  const proposalComments = comments.filter(c => c.proposalId === req.params.proposalId);
  
  res.json({
    success: true,
    count: proposalComments.length,
    comments: proposalComments
  });
});

// Get all comments
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: comments.length,
    comments: comments
  });
});

// Create comment
router.post('/', async (req, res) => {
  try {
    const { 
      proposalId,
      authorPhone,
      authorName,
      content
    } = req.body;

    if (!proposalId || !content) {
      return res.status(400).json({ 
        error: 'Proposal ID and content are required' 
      });
    }

    const comment = {
      id: `comment_${Date.now()}`,
      proposalId: proposalId,
      authorPhone: authorPhone || 'anonymous',
      authorName: authorName || 'Anonymous',
      content: content,
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    comments.push(comment);

    res.status(201).json({
      success: true,
      message: 'Comment created',
      comment: comment
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update comment
router.patch('/:id', async (req, res) => {
  try {
    const { content, likes } = req.body;
    const comment = comments.find(c => c.id === req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (content) comment.content = content;
    if (likes !== undefined) comment.likes = likes;
    comment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Comment updated',
      comment: comment
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    const index = comments.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const deletedComment = comments.splice(index, 1);

    res.json({
      success: true,
      message: 'Comment deleted',
      comment: deletedComment[0]
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;

