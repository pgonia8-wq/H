import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) return;
    setLikes(likes + 1);
    setLiked(true);

    await supabase
      .from('posts')
      .update({ likes_count: likes + 1 })
      .eq('id', postId);
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 group transition-colors ${liked ? 'text-pink-500' : 'hover:text-pink-500'}`}
    >
      <div className={`p-2 rounded-full ${liked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
        <svg viewBox="0 0 24 24" className={`w-5 h-5 ${liked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}>
          <path d="M20.884 13.19c-1.351 2.48-4.001 5.708-8.884 9.21-4.883-3.502-7.533-6.73-8.884-9.21-1.314-2.408-1.574-4.852-0.347-7.258 1.456-2.854 4.14-4.321 7.231-3.834 1.353.213 2.502.9 3.4 1.908 0.9-1.008 2.05-1.695 3.4-1.908 3.091-0.487 5.775 0.98 7.231 3.834 1.227 2.406 0.967 4.85-0.347 7.258z"></path>
        </svg>
      </div>
      <span className="text-xs">{likes}</span>
    </button>
  );
};

export default LikeButton;
