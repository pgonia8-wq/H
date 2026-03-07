import React, { useState, useContext, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useUserBalance } from "../lib/useUserBalance";
import { useFollow } from "../lib/useFollow";
import { ThemeContext } from "../lib/ThemeContext";

interface PostCardProps {
  post: any;
  currentUserId: string | null;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId }) => {
  const { balance } = useUserBalance(currentUserId);
  const { theme, accentColor } = useContext(ThemeContext);

  const { isFollowing, toggleFollow, loading: followLoading } =
    useFollow(currentUserId, post.user_id);

  const [tipAmount, setTipAmount] = useState<number | "">("");

  const [likes, setLikes] = useState<number>(post.likes || 0);
  const [liked, setLiked] = useState(false);

  const [reposts, setReposts] = useState<number>(post.reposts || 0);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingRepost, setLoadingRepost] = useState(false);

  useEffect(() => {
    const checkLike = async () => {
      if (!currentUserId) return;

      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUserId)
        .single();

      if (data) setLiked(true);
    };

    checkLike();
  }, [currentUserId, post.id]);

  const handleLike = async () => {
    if (!currentUserId || loadingLike) return;

    setLoadingLike(true);

    if (liked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);

      if (!error) {
        setLikes((prev) => prev - 1);
        setLiked(false);
      }
    } else {
      const { error } = await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUserId,
      });

      if (!error) {
        setLikes((prev) => prev + 1);
        setLiked(true);

        await supabase.from("notifications").insert({
          user_id: post.user_id,
          from_user: currentUserId,
          type: "like",
          post_id: post.id,
        });
      }
    }

    setLoadingLike(false);
  };

  const handleRepost = async () => {
    if (!currentUserId || loadingRepost) return;

    setLoadingRepost(true);

    const { error } = await supabase.from("reposts").insert({
      post_id: post.id,
      user_id: currentUserId,
    });

    if (!error) {
      setReposts((prev) => prev + 1);

      await supabase.from("notifications").insert({
        user_id: post.user_id,
        from_user: currentUserId,
        type: "repost",
        post_id: post.id,
      });
    }

    setLoadingRepost(false);
  };

  const handleComment = async () => {
    if (!currentUserId || !commentText.trim()) return;

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      user_id: currentUserId,
      content: commentText,
    });

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        from_user: currentUserId,
        type: "comment",
        post_id: post.id,
      });
    }

    setCommentText("");
    setShowCommentModal(false);
  };

  const handleTip = async () => {
    if (!currentUserId || !tipAmount) return;

    const { error } = await supabase.rpc("transfer_tip", {
      from_user_id: currentUserId,
      to_user_id: post.user_id,
      tip_amount: tipAmount,
    });

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        from_user: currentUserId,
        type: "tip",
        post_id: post.id,
      });

      setTipAmount("");
    }
  };

  const handleBoost = async () => {
    const boostCost = 5;

    if (!currentUserId || balance < boostCost) return;

    await supabase
      .from("user_balances")
      .update({ wld_balance: balance - boostCost })
      .eq("user_id", currentUserId);

    alert("Post potenciado 🚀");
  };

  return (
    <div
      className={`p-4 rounded-2xl border border-white/10 space-y-3 shadow-md ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-black"
      }`}
      style={{ borderColor: accentColor }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="font-semibold text-sm">
          {post.profile?.username || "Anon"}
        </div>

        {currentUserId && currentUserId !== post.user_id && (
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            className="px-3 py-1 rounded-full text-xs font-semibold transition shadow-sm"
            style={{
              backgroundColor: isFollowing ? "#444" : accentColor,
              color: "white",
            }}
          >
            {followLoading ? "..." : isFollowing ? "Siguiendo" : "Seguir"}
          </button>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="text-sm leading-relaxed">{post.content}</div>

      {/* ACCIONES */}
      <div className="flex gap-6 text-sm text-gray-400 pt-2">
        <button
          onClick={handleLike}
          className="hover:scale-110 transition"
        >
          {liked ? "❤️" : "🤍"} {likes}
        </button>

        <button
          onClick={() => setShowCommentModal(true)}
          className="hover:scale-110 transition"
        >
          💬 {post.comments || 0}
        </button>

        <button
          onClick={handleRepost}
          className="hover:scale-110 transition"
        >
          🔁 {reposts}
        </button>
      </div>

      {/* TIP + BOOST */}
      <div className="flex gap-2 pt-2">
        <input
          type="number"
          step={0.1}
          value={tipAmount}
          onChange={(e) =>
            setTipAmount(e.target.value ? parseFloat(e.target.value) : "")
          }
          className="w-20 px-2 py-1 rounded bg-black/30 text-white text-sm"
          placeholder="Tip"
        />

        <button
          onClick={handleTip}
          className="px-3 py-1 rounded text-white text-sm shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          Tip
        </button>

        <button
          onClick={handleBoost}
          className="px-3 py-1 rounded text-white text-sm shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          Boost
        </button>
      </div>

      {/* MODAL COMMENT */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Comentar</h2>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-xl p-3 min-h-[100px] text-white"
              placeholder="Escribe tu comentario..."
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-full"
              >
                Cancelar
              </button>

              <button
                onClick={handleComment}
                className="px-4 py-2 bg-purple-600 rounded-full"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
