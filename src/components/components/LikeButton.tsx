import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
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
      className={`px-3 py-1 rounded-full ${liked ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-800'}`}
    >
      ❤️ {likes}
    </button>
  );
};

export default LikeButton;
