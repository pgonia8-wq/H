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
    created_at?: string; // opcional si quieres mostrar fecha
    [key: string]: any; // para futuros campos extra
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md flex flex-col gap-3">
      {/* Contenido del post */}
      <p className="text-gray-800">{post.content}</p>
      
      {/* Información del autor y fecha */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Por: {post.user_id}</span>
        {post.created_at && (
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        )}
      </div>

      {/* Likes y número de comentarios */}
      <div className="flex items-center gap-4 mt-2">
        <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
        {typeof post.comments_count === 'number' && (
          <span className="text-gray-500">{post.comments_count} comentarios</span>
        )}
      </div>

      {/* Input para agregar comentarios */}
      <CommentInput postId={post.id} />
    </div>
  );
};

export default PostCard;
