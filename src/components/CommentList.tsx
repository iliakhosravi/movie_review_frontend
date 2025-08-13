// src/components/CommentList.tsx
import type { Comment } from '../types/Comment'
import { useUserStore } from '../store'
import Icon from './Icon'

interface Props {
  comments: Comment[]
  onDelete?: (id: number) => void
  deletingId?: number | null
}

export default function CommentList({ comments, onDelete, deletingId }: Props) {
  const user = useUserStore((s) => s.user)

  if (!comments.length) {
    return <div className="text-gray-500">No comments yet.</div>
  }

  return (
    <ul className="space-y-4">
      {comments.map((c) => {
        const canDelete = user && (user.id === c.userId || user.role === 'admin')
        return (
          <li key={c.id} className="border border-yellow-200 rounded-2xl p-4 bg-white/90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 rounded-full bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                  <Icon name="UserIcon" size={16} className="text-yellow-700" />
                </div>
                <span className="font-semibold">{c.userName}</span>
                <span className="text-gray-400 text-sm">• {new Date(c.createdAt).toLocaleString()}</span>
              </div>
              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                  title="Delete comment"
                >
                  <Icon name="ErrorIcon" size={16} />
                  {deletingId === c.id ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
            <p className="text-gray-800 mt-2 whitespace-pre-wrap">{c.text}</p>
          </li>
        )
      })}
    </ul>
  )
}
