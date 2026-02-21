import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import PostCard from '../components/PostCard';

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
    const subscription = supabase
      .from('posts')
      .on('INSERT', () => fetchPosts())
      .subscribe();
    return () => supabase.removeSubscription(subscription);
  }, []);

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default FeedPage;
