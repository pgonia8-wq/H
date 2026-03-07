import React, { useState } from 'react';
import PostCard from '../components/PostCard';

interface Post {
  id: string;
  content?: string;
  timestamp: string;
  profile?: {
    username?: string;
  };
  [key: string]: any;
}

interface FeedPageProps {
  posts: Post[];
  loading?: boolean;
  error?: string | null;
  currentUserId: string | null;
  userTier: "free" | "premium" | "premium+";
}

const FeedPage: React.FC<FeedPageProps> = ({ posts, loading, error, currentUserId, userTier }) => {
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

  const handleUpgrade = async (tier: "premium" | "premium+") => {
    if (!currentUserId) return alert("No se encontró tu ID.");

    setLoadingUpgrade(true);
    try {
      const transactionId = crypto.randomUUID(); // MiniKit Wallet manejará la real
      const res = await fetch("/api/upgrade.mjs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, tier, transactionId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al procesar upgrade");

      alert(`¡Upgrade a ${tier} exitoso! Precio: ${data.price} USD`);
      setShowUpgradeOptions(false);
    } catch (err: any) {
      console.error("Upgrade error:", err);
      alert("Error al procesar upgrade: " + (err.message || "Intenta de nuevo"));
    } finally {
      setLoadingUpgrade(false);
    }
  };

  // Banner de upgrade solo para free y premium
  const renderUpgradeBanner = () => {
    if (userTier === "premium+") return null;
    return (
      <div className="w-full max-w-2xl px-4">
        {!showUpgradeOptions ? (
          <button
            onClick={() => setShowUpgradeOptions(true)}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl shadow-md mt-2"
          >
            Upgrade
          </button>
        ) : (
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => handleUpgrade("premium")}
              disabled={loadingUpgrade}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-md flex items-center justify-center"
            >
              {loadingUpgrade ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : null}
              Premium
            </button>
            <button
              onClick={() => handleUpgrade("premium+")}
              disabled={loadingUpgrade}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-md flex items-center justify-center"
            >
              {loadingUpgrade ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : null}
              Premium+
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl space-y-6 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-5 animate-pulse space-y-4 border border-gray-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded w-full" />
              <div className="h-4 bg-gray-800 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-center py-6">{error}</p>;
  if (posts.length === 0) return <p className="text-gray-500 text-center py-10">No hay posts todavía.</p>;

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6 px-4">
      {renderUpgradeBanner()}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default FeedPage;
