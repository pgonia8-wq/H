import React from 'react';
import LikeButton from './LikeButton';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    content: string;
    likes_count?: number;
    comments_count?: number;
    created_at?: string;
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const date = post.created_at ? new Date(post.created_at).toLocaleDateString() : '';

  return (
    <div className="p-4 hover:bg-gray-900/50 transition-colors cursor-pointer border-b border-gray-800">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white">
          {post.user_id.slice(2, 4).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold truncate">Usuario Human</span>
            <span className="text-gray-500 text-sm truncate">@{post.user_id.slice(0, 8)}...</span>
            <span className="text-gray-500 text-sm">· {date}</span>
          </div>
          <p className="text-[15px] leading-normal mb-3 whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center justify-between max-w-xs text-gray-500">
            <div className="flex items-center gap-2 hover:text-blue-400 group transition-colors">
              <div className="p-2 group-hover:bg-blue-400/10 rounded-full">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M1.751 10c0-4.42 3.584-8 7.999-8 2.711 0 5.103 1.34 6.551 3.39a7.95 7.95 0 0 1 1.448-.09c4.42 0 8 3.58 8 8s-3.58 8-8 8a7.95 7.95 0 0 1-1.448-.09c-1.448 2.05-3.84 3.39-6.551 3.39-4.415 0-7.999-3.58-7.999-8zm9.516 7.042l.011-.002.011-.002a1.002 1.002 0 0 0 .684-.658c.03-.102.043-.205.04-.307v-1.956c2.972-.05 5.258-1.59 6.443-4.14.285-.61.127-1.336-.407-1.74a1.007 1.007 0 0 0-1.258.07c-1.123.86-2.527 1.32-4.02 1.32-.26 0-.518-.01-.778-.04v-1.96a1.002 1.002 0 0 0-1.042-1.002c-.104.004-.207.022-.304.053l-.01.002a1.001 1.001 0 0 0-.685.658c-.03.102-.043.205-.04.307v7.352c0 .55.448 1 1 1z"></path></svg>
              </div>
              <span className="text-xs">{post.comments_count || 0}</span>
            </div>
            <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
            <div className="flex items-center gap-2 hover:text-blue-400 group transition-colors">
              <div className="p-2 group-hover:bg-blue-400/10 rounded-full">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M4.5 3.88l4.432 6.777L11.5 9.359 7.207 2.853A1 1 0 0 0 6.365 2.4h-4.83a1 1 0 0 0-.841 1.543l4.52 6.903L12 6.57l-4.52-6.903A1 1 0 0 0 6.635 2.4H1.805a1 1 0 0 0-.841 1.543l3.536 5.402z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
