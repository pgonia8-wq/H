import React, { useState } from 'react';

  interface CommentInputProps {
    postId: string;
    userId?: string | null;
    onCommentCreated?: (comment: any) => void;
  }

  const CommentInput: React.FC<CommentInputProps> = ({ postId, userId, onCommentCreated }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleComment = async () => {
      const text = comment.trim();
      if (!text || submitting) return;

      const currentUserId = userId ?? localStorage.getItem('userId');
      if (!currentUserId) {
        setError('Debes iniciar sesión para comentar');
        return;
      }

      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch('/api/createComment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: postId, user_id: currentUserId, content: text }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        setComment('');
        onCommentCreated?.(data?.comment);
      } catch (e: any) {
        setError(e?.message || 'Error al comentar');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleComment(); }}
            placeholder="Escribe un comentario..."
            disabled={submitting}
            className="flex-1 px-2 py-1 border rounded disabled:opacity-60"
          />
          <button
            onClick={handleComment}
            disabled={submitting || !comment.trim()}
            className="px-4 py-1 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            {submitting ? '...' : 'Enviar'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}
      </div>
    );
  };

  export default CommentInput;
  