import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  userId?: string | null;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLikes, userId }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !postId) return;
    const checkIfLiked = async () => {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      if (data) setLiked(true);
    };
    checkIfLiked();
  }, [userId, postId]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (userId) {
        const { data: result } = await supabase.rpc("toggle_like", {
          p_post_id: postId,
          p_user_id: userId,
        });

        if (result && !result.liked) {
          setLiked(false);
          setLikes(result.likes ?? Math.max(likes - 1, 0));
        } else if (result && result.liked) {
          setLiked(true);
          setLikes(result.likes ?? likes + 1);
        }
      } else {
        if (liked) { setLoading(false); return; }
        setLikes(likes + 1);
        setLiked(true);
        await supabase
          .from('posts')
          .update({ likes_count: likes + 1 })
          .eq('id', postId);
      }
    } catch (err) {
      console.error("[LikeButton] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`px-3 py-1 rounded-full ${liked ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-800'}`}
    >
      ❤️ {likes}
    </button>
  );
};

export default LikeButton;
