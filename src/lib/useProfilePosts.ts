import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export const useProfilePosts = (
  userId: string | null,
  type: "posts" | "likes" | "responses"
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);

      if (type === "posts") {
        const { data } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        setData(data || []);
      }

      if (type === "responses") {
        const { data } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", userId)
          .not("parent_id", "is", null)
          .order("created_at", { ascending: false });

        setData(data || []);
      }

      if (type === "likes") {
        const { data } = await supabase
          .from("likes")
          .select("posts(*)")
          .eq("user_id", userId);

        setData(data?.map((l: any) => l.posts) || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, type]);

  return { data, loading };
};
