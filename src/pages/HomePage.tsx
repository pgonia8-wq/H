import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import PostCard from "../components/PostCard";
import ProfileModal from "../components/ProfileModal";
import NotificationsModal from "../components/NotificationsModal";
import { ThemeContext } from "../lib/ThemeContext";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    username: string;
  };
}

interface HomePageProps {
  currentUserId: string | null;
}

const HomePage: React.FC<HomePageProps> = ({ currentUserId }) => {
  const { theme, accentColor } = useContext(ThemeContext);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        profile:profiles(username)
      `
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }

    setLoading(false);
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    const { error } = await supabase.from("posts").insert({
      content: newPost,
      user_id: currentUserId,
    });

    if (!error) {
      setNewPost("");
      fetchPosts();
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-black text-white"
          : "bg-white text-black"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">

        <div
          className="font-bold text-lg"
          style={{ color: accentColor }}
        >
          NIDO
        </div>

        <div className="flex gap-3">

          {/* NOTIFICACIONES */}
          <button
            onClick={() => setShowNotifications(true)}
            className="text-xl"
          >
            🔔
          </button>

          {/* PERFIL */}
          <button
            onClick={() => setShowProfile(true)}
            className="text-xl"
          >
            👤
          </button>

        </div>
      </div>

      {/* CREAR POST */}
      {currentUserId && (
        <div className="p-4 border-b border-white/10">

          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="¿Qué estás pensando?"
            className={`w-full p-3 rounded-xl resize-none ${
              theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-black"
            }`}
          />

          <button
            onClick={createPost}
            className="mt-2 px-4 py-2 rounded-xl text-white"
            style={{ backgroundColor: accentColor }}
          >
            Publicar
          </button>

        </div>
      )}

      {/* FEED */}
      <div className="p-4 space-y-4">

        {loading && <div>Cargando...</div>}

        {!loading &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
            />
          ))}

      </div>

      {/* MODAL PERFIL */}
      {showProfile && (
        <ProfileModal
          currentUserId={currentUserId}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* MODAL NOTIFICACIONES */}
      {showNotifications && (
        <NotificationsModal
          currentUserId={currentUserId}
          onClose={() => setShowNotifications(false)}
        />
      )}

    </div>
  );
};

export default HomePage;
