import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../lib/ThemeContext";
import { useUserBalance } from "../lib/useUserBalance";
import { useFollow } from "../lib/useFollow";

interface PostCardProps {
  post: any;
  currentUserId: string | null;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId }) => {
  const { balance, refreshBalance } = useUserBalance(currentUserId);
  const { theme, accentColor } = useContext(ThemeContext);
  const { isFollowing, toggleFollow, loading: followLoading } = useFollow(
    currentUserId,
    post.user_id
  );

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState<number>(post.likes || 0);
  const [reposts, setReposts] = useState<number>(post.reposts || 0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [tipAmount, setTipAmount] = useState<number | "">("");
  const [isBoosting, setIsBoosting] = useState(false);

  // --- Verificar si ya likeó ---
  useEffect(() => {
    if (!currentUserId) return;
    const checkLike = async () => {
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

  // --- Likes ---
  const handleLike = async () => {
    if (!currentUserId) return;
    try {
      if (liked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
        setLikes((prev) => prev - 1);
        setLiked(false);
      } else {
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        });
        setLikes((prev) => prev + 1);
        setLiked(true);
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          from_user: currentUserId,
          type: "like",
          post_id: post.id,
        });
      }
    } catch (err) {
      console.error("[LIKE ERROR]", err);
    }
  };

  // --- Repost ---
  const handleRepost = async () => {
    if (!currentUserId) return;
    try {
      await supabase.from("reposts").insert({
        post_id: post.id,
        user_id: currentUserId,
      });
      setReposts((prev) => prev + 1);
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        from_user: currentUserId,
        type: "repost",
        post_id: post.id,
      });
    } catch (err) {
      console.error("[REPOST ERROR]", err);
    }
  };

  // --- Comentarios ---
  const handleComment = async () => {
    if (!currentUserId || !commentText.trim()) return;
    try {
      await supabase.from("comments").insert({
        post_id: post.id,
        user_id: currentUserId,
        content: commentText.trim(),
      });
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        from_user: currentUserId,
        type: "comment",
        post_id: post.id,
      });
      setCommentText("");
      setShowCommentModal(false);
    } catch (err) {
      console.error("[COMMENT ERROR]", err);
    }
  };

  // --- Tip en WLD real ---
  const handleTip = async () => {
    if (!currentUserId || !tipAmount || tipAmount <= 0) return;
    if (tipAmount > balance) {
      alert("No tienes suficiente WLD");
      return;
    }
    try {
      await supabase.rpc("transfer_tip", {
        from_user_id: currentUserId,
        to_user_id: post.user_id,
        tip_amount: tipAmount,
      });
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        from_user: currentUserId,
        type: "tip",
        post_id: post.id,
      });
      setTipAmount("");
      refreshBalance();
    } catch (err) {
      console.error("[TIP ERROR]", err);
    }
  };

  // --- Boost en WLD real ---
  const handleBoost = async () => {
    if (!currentUserId) return;
    const boostCost = 5; // WLD
    if (balance < boostCost) {
      alert("No tienes suficiente WLD para potenciar");
      return;
    }
    try {
      setIsBoosting(true);
      await supabase.rpc("boost_post", {
        user_id: currentUserId,
        post_id: post.id,
        boost_amount: boostCost,
      });
      refreshBalance();
      alert("Post potenciado 🚀");
    } catch (err) {
      console.error("[BOOST ERROR]", err);
    } finally {
      setIsBoosting(false);
    }
  };

  // --- Render ---
  return (
    <div
      className={`p-4 rounded-3xl border shadow-lg space-y-3 ${
        theme === "dark"
          ? "bg-gray-900 text-white border-white/10"
          : "bg-gray-100 text-black border-black/10"
      }`}
      style={{ borderColor: accentColor }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={post.profile?.avatar_url || "/default-avatar.png"}
            alt={post.profile?.username || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {post.profile?.username || "Anon"}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(post.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {currentUserId && currentUserId !== post.user_id && (
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            className="px-3 py-1 rounded-full text-xs font-semibold transition"
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

      {/* INTERACCIONES */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pt-2">
        <button onClick={handleLike}>
          {liked ? "❤️" : "🤍"} {likes}
        </button>
        <button onClick={() => setShowCommentModal(true)}>
          💬 {post.comments || 0}
        </button>
        <button onClick={handleRepost}>
          🔁 {reposts}
        </button>
      </div>

      {/* TIP + BOOST */}
      <div className="flex flex-wrap gap-2 pt-3 items-center">
        <input
          type="number"
          step={0.1}
          value={tipAmount}
          onChange={(e) =>
            setTipAmount(e.target.value ? parseFloat(e.target.value) : "")
          }
          placeholder="Tip WLD"
          className="w-20 px-2 py-1 rounded border text-black"
        />
        <button
          onClick={handleTip}
          className="px-3 py-1 rounded text-white font-medium shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          Tip
        </button>
        <button
          onClick={handleBoost}
          disabled={isBoosting}
          className="px-3 py-1 rounded text-white font-medium shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          {isBoosting ? "🚀..." : "Boost"}
        </button>
      </div>

      {/* MODAL DE COMENTARIOS */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-lg font-bold mb-3 text-white">Comentar</h2>
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
