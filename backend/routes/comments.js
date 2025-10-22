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

// Get all comments for a special donation campaign
router.get('/special-donation/:campaignId', (req, res) => {
  const campaignComments = comments.filter(c => c.campaignId === parseInt(req.params.campaignId));

  res.json({
    success: true,
    count: campaignComments.length,
    comments: campaignComments
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

// Create comment (supports both proposals and special donations)
router.post('/', async (req, res) => {
  try {
    const {
      proposalId,
      campaignId,
      authorPhone,
      authorName,
      content
    } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Content is required'
      });
    }

    if (!proposalId && !campaignId) {
      return res.status(400).json({
        error: 'Either proposalId or campaignId is required'
      });
    }

    const comment = {
      id: `comment_${Date.now()}`,
      proposalId: proposalId || null,
      campaignId: campaignId ? parseInt(campaignId) : null,
      authorPhone: authorPhone || 'anonymous',
      authorName: authorName || 'Anonymous',
      content: content,
      likes: 0,
      likedBy: [],
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

// Like/Unlike comment
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const comment = comments.find(c => c.id === req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userIdStr = userId || 'anonymous';
    const alreadyLiked = comment.likedBy && comment.likedBy.includes(userIdStr);

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter(id => id !== userIdStr);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      if (!comment.likedBy) comment.likedBy = [];
      comment.likedBy.push(userIdStr);
      comment.likes = (comment.likes || 0) + 1;
    }

    comment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: alreadyLiked ? 'Comment unliked' : 'Comment liked',
      comment: comment
    });

  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Add reply to comment
router.post('/:id/reply', async (req, res) => {
  try {
    const { authorName, authorPhone, content } = req.body;
    const comment = comments.find(c => c.id === req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    const reply = {
      id: `reply_${Date.now()}`,
      authorName: authorName || 'Anonymous',
      authorPhone: authorPhone || 'anonymous',
      content: content,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    if (!comment.replies) comment.replies = [];
    comment.replies.push(reply);
    comment.updatedAt = new Date().toISOString();

    res.status(201).json({
      success: true,
      message: 'Reply added',
      reply: reply,
      comment: comment
    });

  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

module.exports = router;

