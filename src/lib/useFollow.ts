import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export const useFollow = (
  currentUserId: string | null,
  targetUserId: string | null
) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId || !targetUserId) return;

    const checkFollow = async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)
        .maybeSingle();

      setIsFollowing(!!data);
    };

    checkFollow();
  }, [currentUserId, targetUserId]);

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId) return;
    if (currentUserId === targetUserId) return;

    setLoading(true);

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId);

      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      });

      setIsFollowing(true);
    }

    setLoading(false);
  };

  return { isFollowing, toggleFollow, loading };
};
