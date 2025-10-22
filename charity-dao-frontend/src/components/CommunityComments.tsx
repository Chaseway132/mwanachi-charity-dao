import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, Send, Filter } from 'lucide-react';

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

const CommunityComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'campaign' | 'proposal'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [replyAuthorPhone, setReplyAuthorPhone] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAllComments();
    const interval = setInterval(fetchAllComments, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllComments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/comments`);
      const data = await response.json();
      setComments(data.comments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'anonymous' })
      });
      const data = await response.json();
      if (data.success) {
        fetchAllComments();
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          fetchAllComments();
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: replyAuthorName || 'Anonymous',
          authorPhone: replyAuthorPhone || 'anonymous',
          content: replyContent
        })
      });
      const data = await response.json();
      if (data.success) {
        setReplyContent('');
        setReplyAuthorName('');
        setReplyAuthorPhone('');
        setReplyingTo(null);
        fetchAllComments();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
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

  const getFilteredComments = () => {
    let filtered = comments;

    if (filterType === 'campaign') {
      filtered = filtered.filter(c => c.campaignId);
    } else if (filterType === 'proposal') {
      filtered = filtered.filter(c => c.proposalId);
    }

    if (sortBy === 'newest') {
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      return filtered.sort((a, b) => b.likes - a.likes);
    }
  };

  const filteredComments = getFilteredComments();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💬 Community Comments</h2>
        <p className="text-gray-600 mb-6">Join the conversation! See what the community is saying about campaigns and proposals.</p>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'campaign' | 'proposal')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Comments</option>
              <option value="campaign">Campaign Comments</option>
              <option value="proposal">Proposal Comments</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Liked</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            {filteredComments.length} comment{filteredComments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow-lg p-6">
              {/* Comment Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{comment.authorName}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(comment.createdAt)}
                    {comment.campaignId && ` • Campaign #${comment.campaignId}`}
                    {comment.proposalId && ` • Proposal #${comment.proposalId}`}
                  </p>
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
              <p className="text-gray-700 mb-4 leading-relaxed">{comment.content}</p>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{comment.likes}</span>
                </button>

                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Reply</span>
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={replyAuthorName}
                      onChange={(e) => setReplyAuthorName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      placeholder="Your phone (optional)"
                      value={replyAuthorPhone}
                      onChange={(e) => setReplyAuthorPhone(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      <Send className="w-4 h-4" />
                      Reply
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 p-3 rounded-lg border-l-4 border-orange-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{reply.authorName}</p>
                          <p className="text-xs text-gray-600">{formatDate(reply.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{reply.content}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Heart className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{reply.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No comments yet</p>
            <p className="text-gray-500 text-sm mt-2">
              {filterType === 'all' && 'Be the first to start a conversation!'}
              {filterType === 'campaign' && 'No campaign comments yet. Check back soon!'}
              {filterType === 'proposal' && 'No proposal comments yet. Check back soon!'}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {filteredComments.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-orange-600">{filteredComments.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Comments</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {filteredComments.reduce((sum, c) => sum + c.likes, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Likes</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {filteredComments.reduce((sum, c) => sum + c.replies.length, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Replies</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityComments;

