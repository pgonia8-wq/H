import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const FeedPage: React.FC<{ wallet: string }> = ({ wallet }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const createPost = async () => {
    if (!content) return;
    await supabase.from('posts').insert({ 
      content,
      user_id: wallet // usamos wallet como ID temporal
    });
    setContent('');
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué está pasando?"
        className="w-full p-4 bg-gray-900 rounded-xl text-white placeholder-gray-500"
        rows={3}
      />
      <button
        onClick={createPost}
        className="mt-3 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-bold text-white"
      >
        Publicar
      </button>

      <div className="mt-8 space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-900 p-4 rounded-xl">
            <p className="text-sm text-gray-400">{post.profiles?.username || 'Usuario'}</p>
            <p className="mt-2">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
