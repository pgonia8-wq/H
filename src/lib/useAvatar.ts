import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const avatarCache: Record<string, string> = {};

export const useAvatar = (userId: string | null) => {
  const [avatarUrl, setAvatarUrl] = useState<string>("default-avatar.png");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setAvatarUrl("default-avatar.png");
      setLoading(false);
      return;
    }

    if (avatarCache[userId]) {
      setAvatarUrl(avatarCache[userId]);
      setLoading(false);
      return;
    }

    const fetchAvatar = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("[useAvatar] Error fetching profile:", error.message);
          setAvatarUrl("default-avatar.png");
          return;
        }

        if (data?.avatar_url) {
          avatarCache[userId] = data.avatar_url;
          setAvatarUrl(data.avatar_url);
        } else {
          setAvatarUrl("default-avatar.png");
        }
      } catch (err) {
        console.error("[useAvatar] Error:", err);
        setAvatarUrl("default-avatar.png");
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [userId]);

  return { avatarUrl, loading };
};
