import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface CommentInputProps {
  postId: string;
}

const CommentInput: React.FC<CommentInputProps> = ({ postId }) => {
  const [comment, setComment] = useState('');

  const handleComment = async () => {
    if (!comment) return;
    const user = supabase.auth.user();
    if (!user) return;

    await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: comment,
    });
    setComment('');
  };

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe un comentario..."
        className="flex-1 px-2 py-1 border rounded"
      />
      <button onClick={handleComment} className="px-4 py-1 bg-purple-500 text-white rounded">
        Enviar
      </button>
    </div>
  );
};

export default CommentInput;
