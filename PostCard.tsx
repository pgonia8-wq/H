import React, { useState } from "react";

interface Post {
  id: string;
  content?: string;
  timestamp: string;
  profile?: {
    username?: string;
    avatar_url?: string;
  };
  [key: string]: any;
}

interface Props {
  post: Post;
}

const PostCard: React.FC<Props> = ({ post }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <img
          src={post.profile?.avatar_url || "/logo.png"}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">
            {post.profile?.username || "Usuario"}
          </span>
          <span className="text-gray-500 text-xs">{post.timestamp}</span>
        </div>
      </div>

      {post.content && <p className="text-gray-900">{post.content}</p>}

      {/* Actions */}
      <div className="flex items-center gap-6 mt-2">
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill={liked ? "red" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
          {liked && <span className="text-red-500 font-bold">1</span>}
        </button>

        <button className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4-4 8-9 8s-9-4-9-8 4-8 9-8 9 4 9 8z"
            />
          </svg>
        </button>

        <button className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 12h16M4 6h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
