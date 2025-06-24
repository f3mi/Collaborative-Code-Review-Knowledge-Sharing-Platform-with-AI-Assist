import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import Editor from '@monaco-editor/react'
import { 
  MessageSquare, 
  Lightbulb, 
  Users, 
  Send,
  Bot
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface ReviewSession {
  id: string
  projectId: string
  projectName: string
  title: string
  description: string
  participants: Array<{
    id: string
    username: string
    avatar?: string
    online: boolean
  }>
  codeSnippet: {
    content: string
    language: string
    filePath: string
  }
  comments: Array<{
    id: string
    content: string
    line: number
    author: {
      username: string
      avatar?: string
    }
    timestamp: string
    resolved: boolean
  }>
}

export default function ReviewSession() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const { data: session, isLoading } = useQuery<ReviewSession>({
    queryKey: ['review-session', sessionId],
    queryFn: () => api.get(`/review-sessions/${sessionId}`).then(res => res.data),
    enabled: !!sessionId,
  })

  const handleEditorChange = (value: string | undefined) => {
    // Handle real-time collaboration updates
    console.log('Code changed:', value)
  }

  const handleLineClick = (lineNumber: number) => {
    setSelectedLine(lineNumber)
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedLine) return

    // Add comment logic
    console.log('Adding comment:', { line: selectedLine, content: newComment })
    setNewComment('')
    setSelectedLine(null)
  }

  const handleAiSuggestion = async () => {
    if (!session?.codeSnippet.content) return

    try {
      const response = await api.post('/ai/suggest', {
        code: session.codeSnippet.content,
        language: session.codeSnippet.language,
      })
      setAiSuggestions(response.data.suggestions)
    } catch (error) {
      console.error('Failed to get AI suggestions:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary-500">Review session not found</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-secondary-900">{session.title}</h1>
            <p className="text-sm text-secondary-600">{session.projectName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-secondary-400" />
              <span className="text-sm text-secondary-600">
                {session.participants.length} participants
              </span>
            </div>
            <button
              onClick={handleAiSuggestion}
              className="btn-outline flex items-center space-x-2"
            >
              <Bot size={16} />
              <span>AI Suggestions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-secondary-50 border-b border-secondary-200 p-2">
            <span className="text-sm text-secondary-600">
              {session.codeSnippet.filePath}
            </span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={session.codeSnippet.language}
              value={session.codeSnippet.content}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono',
                lineNumbers: 'on',
                readOnly: false,
                wordWrap: 'on',
              }}
              onMount={(editor) => {
                // Set up line click handlers
                editor.onMouseDown((e) => {
                  if (e.target.position) {
                    handleLineClick(e.target.position.lineNumber)
                  }
                })
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-secondary-200 flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b border-secondary-200">
            <h3 className="text-sm font-medium text-secondary-900 mb-3">Participants</h3>
            <div className="space-y-2">
              {session.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <div className="relative">
                    <img
                      src={participant.avatar || `https://ui-avatars.com/api/?name=${participant.username}`}
                      alt={participant.username}
                      className="h-6 w-6 rounded-full"
                    />
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${
                        participant.online ? 'bg-success-500' : 'bg-secondary-300'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-secondary-700">{participant.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="p-4 border-b border-secondary-200">
              <h3 className="text-sm font-medium text-secondary-900 mb-3 flex items-center">
                <Lightbulb size={16} className="mr-2 text-warning-500" />
                AI Suggestions
              </h3>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="text-sm text-secondary-600 bg-warning-50 p-2 rounded">
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-secondary-200">
              <h3 className="text-sm font-medium text-secondary-900 mb-3 flex items-center">
                <MessageSquare size={16} className="mr-2" />
                Comments
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {session.comments.map((comment) => (
                <div key={comment.id} className="bg-secondary-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2 mb-2">
                    <img
                      src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.username}`}
                      alt={comment.author.username}
                      className="h-6 w-6 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-secondary-900">
                          {comment.author.username}
                        </span>
                        <span className="text-xs text-secondary-500">
                          Line {comment.line}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            {selectedLine && (
              <div className="p-4 border-t border-secondary-200">
                <div className="text-xs text-secondary-500 mb-2">
                  Comment on line {selectedLine}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 input text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="btn-primary px-3"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 