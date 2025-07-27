"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  elementId: string
  text: string
  position: { x: number; y: number }
  userId: string
  username: string
  timestamp: string
  resolved?: boolean
  replies?: Comment[]
}

interface CommentSystemProps {
  comments: Comment[]
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => Promise<void>
  onResolveComment?: (commentId: string) => Promise<void>
  onReplyToComment?: (commentId: string, text: string) => Promise<void>
  onClose: () => void
  dashboardId: string
  userId: string
  username: string
  className?: string
}

interface CommentThreadProps {
  comment: Comment
  onResolve?: (commentId: string) => void
  onReply?: (commentId: string, text: string) => void
  currentUserId: string
  currentUsername: string
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onResolve,
  onReply,
  currentUserId,
  currentUsername
}) => {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleReply = async () => {
    if (replyText.trim() && onReply) {
      await onReply(comment.id, replyText.trim())
      setReplyText('')
      setIsReplying(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={cn(
      "border rounded-lg p-3 bg-white shadow-sm",
      comment.resolved && "opacity-60 bg-gray-50"
    )}>
      {/* Main Comment */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
              {comment.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                {comment.username}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {formatTimestamp(comment.timestamp)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {comment.resolved && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Resolved
              </span>
            )}
            
            {!comment.resolved && onResolve && (
              <button
                onClick={() => onResolve(comment.id)}
                className="text-xs text-gray-500 hover:text-green-600 transition-colors"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-700 leading-relaxed">
          {comment.text}
        </p>
        
        {/* Element Reference */}
        {comment.elementId && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>📍</span>
            <span>Element: {comment.elementId}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            Reply
          </button>
          
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? 'Hide' : 'Show'} {comment.replies.length} replies
            </button>
          )}
        </div>
      </div>
      
      {/* Reply Input */}
      {isReplying && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsReplying(false)
                  setReplyText('')
                }}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Replies */}
      {isExpanded && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="ml-4 pl-3 border-l-2 border-gray-200">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                  {reply.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {reply.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(reply.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {reply.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  comments,
  onAddComment,
  onResolveComment,
  onReplyToComment,
  onClose,
  dashboardId,
  userId,
  username,
  className
}) => {
  const [newCommentText, setNewCommentText] = useState('')
  const [selectedElement, setSelectedElement] = useState<string>('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter comments based on current filter
  const filteredComments = comments.filter(comment => {
    switch (filter) {
      case 'unresolved':
        return !comment.resolved
      case 'resolved':
        return comment.resolved
      default:
        return true
    }
  })

  // Group comments by element
  const commentsByElement = filteredComments.reduce((acc, comment) => {
    const key = comment.elementId || 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(comment)
    return acc
  }, {} as Record<string, Comment[]>)

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return

    setIsAddingComment(true)
    try {
      await onAddComment({
        elementId: selectedElement || 'general',
        text: newCommentText.trim(),
        position: { x: 0, y: 0 }, // Default position, could be enhanced
        userId,
        username
      })
      
      setNewCommentText('')
      setSelectedElement('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsAddingComment(false)
    }
  }

  const handleResolveComment = async (commentId: string) => {
    if (onResolveComment) {
      try {
        await onResolveComment(commentId)
      } catch (error) {
        console.error('Failed to resolve comment:', error)
      }
    }
  }

  const handleReplyToComment = async (commentId: string, text: string) => {
    if (onReplyToComment) {
      try {
        await onReplyToComment(commentId, text)
      } catch (error) {
        console.error('Failed to reply to comment:', error)
      }
    }
  }

  // Focus textarea when adding comment
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className={cn(
      "bg-white border-l border-gray-200 shadow-lg h-full flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mt-3">
          {(['all', 'unresolved', 'resolved'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-colors capitalize",
                filter === filterOption
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              )}
            >
              {filterOption}
              {filterOption === 'unresolved' && (
                <span className="ml-1 text-xs">
                  ({comments.filter(c => !c.resolved).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="border-b border-gray-200 p-4">
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          
          <div className="space-y-2">
            <input
              type="text"
              value={selectedElement}
              onChange={(e) => setSelectedElement(e.target.value)}
              placeholder="Element ID (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Tip: Select an element first, then add comment
              </span>
              <button
                onClick={handleAddComment}
                disabled={!newCommentText.trim() || isAddingComment}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(commentsByElement).length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">
              {filter === 'unresolved' ? 'No unresolved comments' : 
               filter === 'resolved' ? 'No resolved comments' : 
               'No comments yet'}
            </p>
            <p className="text-xs mt-1">
              Add the first comment to start the conversation
            </p>
          </div>
        ) : (
          Object.entries(commentsByElement).map(([elementId, elementComments]) => (
            <div key={elementId} className="space-y-3">
              {/* Element Header */}
              {elementId !== 'general' && (
                <div className="flex items-center gap-2 text-sm text-gray-600 border-b border-gray-100 pb-2">
                  <span>📍</span>
                  <span className="font-medium">Element: {elementId}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {elementComments.length} comment{elementComments.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {/* Comments for this element */}
              {elementComments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  onResolve={handleResolveComment}
                  onReply={handleReplyToComment}
                  currentUserId={userId}
                  currentUsername={username}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSystem