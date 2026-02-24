import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import PostCard from '../components/PostCard';

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full divide-y divide-gray-800">
      <div className="p-4 border-b border-gray-800">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <textarea 
              placeholder="¿Qué está pasando?" 
              className="w-full bg-transparent text-xl border-none focus:ring-0 resize-none placeholder-gray-500"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-blue-600 transition-colors">
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default FeedPage;
