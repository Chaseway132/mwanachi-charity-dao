import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';

interface Reply {
  id: string;
  authorName: string;
  authorPhone: string;
  content: string;
  likes: number;
  createdAt: string;
}

interface Comment {
  id: string;
  campaignId?: number;
  proposalId?: string;
  authorName: string;
  authorPhone: string;
  content: string;
  likes: number;
  likedBy?: string[];
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  campaignId?: number;
  proposalId?: string;
  type: 'campaign' | 'proposal';
}

const CommentSection: React.FC<CommentSectionProps> = ({ campaignId, proposalId, type }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [campaignId, proposalId]);

  const fetchComments = async () => {
    try {
      let url = '';
      if (type === 'campaign' && campaignId) {
        url = `${API_URL}/api/comments/special-donation/${campaignId}`;
      } else if (type === 'proposal' && proposalId) {
        url = `${API_URL}/api/comments/proposal/${proposalId}`;
      }

      if (!url) return;

      const response = await fetch(url);
      const data = await response.json();
      setComments(data.comments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const payload: any = {
        content: newComment,
        authorName: authorName || 'Anonymous',
        authorPhone: authorPhone || 'anonymous'
      };

      if (type === 'campaign' && campaignId) {
        payload.campaignId = campaignId;
      } else if (type === 'proposal' && proposalId) {
        payload.proposalId = proposalId;
      }

      const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNewComment('');
        setAuthorName('');
        setAuthorPhone('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authorPhone || 'anonymous' })
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          authorName: authorName || 'Anonymous',
          authorPhone: authorPhone || 'anonymous'
        })
      });

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (b.likes || 0) - (a.likes || 0);
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💬 Community Comments</h2>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Your phone (optional)"
            value={authorPhone}
            onChange={(e) => setAuthorPhone(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <textarea
          placeholder="Share your thoughts, questions, or updates..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        <button
          type="submit"
          className="mt-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center"
        >
          <Send className="w-4 h-4 mr-2" />
          Post Comment
        </button>
      </form>

      {/* Sort Options */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSortBy('newest')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'newest'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => setSortBy('popular')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'popular'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Most Liked
        </button>
      </div>

      {/* Comments List */}
      {sortedComments.length > 0 ? (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
              {/* Comment Header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{comment.authorName}</p>
                  <p className="text-sm text-gray-600">{formatDate(comment.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-500 transition"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Comment Content */}
              <p className="text-gray-700 mb-3">{comment.content}</p>

              {/* Comment Actions */}
              <div className="flex gap-4 mb-3">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{comment.likes || 0}</span>
                </button>
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Reply</span>
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-1 px-3 rounded-lg transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-4 mt-3 space-y-2 border-l-2 border-gray-200 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-sm text-gray-900">{reply.authorName}</p>
                      <p className="text-xs text-gray-600 mb-1">{formatDate(reply.createdAt)}</p>
                      <p className="text-gray-700 text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 py-8">
          No comments yet. Be the first to share your thoughts! 💭
        </p>
      )}
    </div>
  );
};

export default CommentSection;

