import React from 'react';
import LikeButton from './LikeButton';
import CommentInput from './CommentInput';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    content: string;
    likes_count?: number;
    comments_count?: number;
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md flex flex-col gap-2">
      <p className="text-gray-800">{post.content}</p>
      <small className="text-gray-500">Por: {post.user_id}</small>
      <div className="flex items-center gap-2 mt-2">
        <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
      </div>
      <CommentInput postId={post.id} />
    </div>
  );
};

export default PostCard;
