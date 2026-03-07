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

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [reposted, setReposted] = useState(false);
  const [reposts, setReposts] = useState(post.reposts || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments || 0);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [tipAmount, setTipAmount] = useState<number | "">("");

  // Check if user already liked
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

  // Check if user already reposted
  useEffect(() => {
    const checkRepost = async () => {
      if (!currentUserId) return;
      const { data } = await supabase
        .from("reposts")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUserId)
        .single();
      if (data) setReposted(true);
    };
    checkRepost();
  }, [currentUserId, post.id]);

  const handleLike = async () => {
    if (!currentUserId) return;

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
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        from_user: currentUserId,
        type: "like",
        post_id: post.id,
      });
      setLikes((prev) => prev + 1);
      setLiked(true);
    }
  };

  const handleRepost = async () => {
    if (!currentUserId || reposted) return;
    await supabase.from("reposts").insert({
      post_id: post.id,
      user_id: currentUserId,
    });
    await supabase.from("notifications").insert({
      user_id: post.user_id,
      from_user: currentUserId,
      type: "repost",
      post_id: post.id,
    });
    setReposts((prev) => prev + 1);
    setReposted(true);
    alert("Repost enviado 🚀");
  };

  const handleComment = async () => {
    if (!currentUserId || !commentText.trim()) return;

    await supabase.from("comments").insert({
      post_id: post.id,
      user_id: currentUserId,
      content: commentText,
    });

    await supabase.from("notifications").insert({
      user_id: post.user_id,
      from_user: currentUserId,
      type: "comment",
      post_id: post.id,
    });

    setCommentsCount((prev) => prev + 1);
    setCommentText("");
    setShowCommentModal(false);
  };

  const handleTip = async () => {
    if (!currentUserId || !tipAmount) return;

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

    alert(`Tip enviado: ${tipAmount} WLD`);
    setTipAmount("");
  };

  const handleBoost = async () => {
    const boostCost = 5;
    if (!currentUserId || balance < boostCost)
      return alert("No tienes suficiente WLD");

    await supabase
      .from("user_balances")
      .update({ wld_balance: balance - boostCost })
      .eq("user_id", currentUserId);

    alert("Post potenciado 🚀");
  };

  return (
    <div
      className={`p-4 rounded-2xl border shadow-md space-y-3 ${
        theme === "dark"
          ? "bg-gray-900 text-white border-white/10"
          : "bg-gray-100 text-black border-black/10"
      }`}
      style={{ borderColor: accentColor }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm">
            {post.profile?.username?.charAt(0) || "U"}
          </div>
          <div className="font-semibold text-sm">
            {post.profile?.username || "Anon"}
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

      {/* CONTENT */}
      <div className="text-sm leading-relaxed">{post.content}</div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-400 pt-2">
        <button onClick={handleLike}>
          {liked ? "❤️" : "🤍"} {likes}
        </button>
        <button onClick={() => setShowCommentModal(true)}>
          💬 {commentsCount}
        </button>
        <button onClick={handleRepost}>
          🔁 {reposts}
        </button>
      </div>

      {/* TIP + BOOST */}
      <div className="flex gap-2 pt-2">
        <input
          type="number"
          step={1}
          value={tipAmount}
          onChange={(e) =>
            setTipAmount(e.target.value ? parseInt(e.target.value) : "")
          }
          className="w-20 px-2 py-1 rounded text-black"
          placeholder="Tip"
        />
        <button
          onClick={handleTip}
          className="px-3 py-1 rounded text-white"
          style={{ backgroundColor: accentColor }}
        >
          Tip
        </button>
        <button
          onClick={handleBoost}
          className="px-3 py-1 rounded text-white"
          style={{ backgroundColor: accentColor }}
        >
          Boost
        </button>
      </div>

      {/* COMMENT MODAL */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-lg font-bold mb-3">Comentar</h2>
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
