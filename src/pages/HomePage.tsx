import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { supabase } from "../supabaseClient";
import PostCard from "../components/PostCard.tsx";
import ActionButton from "../components/ActionButton";
import { ThemeContext } from "../lib/ThemeContext";
import ProfileModal from "../components/ProfileModal.tsx";
import { useMiniKitUser } from "../lib/useMiniKitUser";

interface Post {
  id: string;
  content?: string;
  timestamp: string;
  profile?: {
    username?: string;
    avatar_url?: string;
    is_premium?: boolean;
    tier?: 'free' | 'basic' | 'premium' | 'premium+';
  };
  user_id?: string;
  likes?: number;
  comments?: number;
  reposts?: number;
  edited_at?: string;
  is_exclusive?: boolean;
  [key: string]: any;
}

const PAGE_SIZE = 5;

const HomePage = (props: { userId: string | null }) => {
  const { userId } = props;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [userTier, setUserTier] = useState<'free' | 'basic' | 'premium' | 'premium+'>('free');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { theme } = useContext(ThemeContext);
  const { wallet } = useMiniKitUser(); // <- usamos wallet solo si no viene userId

  const containerRef = useRef<HTMLDivElement>(null);

  const currentUserId = userId || wallet; // <- aquí está la corrección

  const maxChars = userTier === 'premium+' ? 10000 : userTier === 'premium' ? 4000 : 280;

  const fetchPosts = useCallback(async (reset = false) => {
    if (!hasMore && !reset) return;

    try {
      setLoading(true);
      const from = reset ? 0 : page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      if (!currentUserId) {
        console.warn("[FETCH POSTS] No hay userId definido, no se cargarán posts");
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", currentUserId)
        .order("timestamp", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const newPosts = data || [];
      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === PAGE_SIZE);

      if (reset) setPage(1);
      else setPage((prev) => prev + 1);

    } catch (err: any) {
      console.error("[FETCH POSTS] Error al cargar posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    fetchPosts(true);
  }, [fetchPosts, currentUserId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        fetchPosts();
      }
    };
    containerRef.current?.addEventListener("scroll", handleScroll);
    return () => containerRef.current?.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  const handleRefresh = () => fetchPosts(true);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert("Escribe algo antes de publicar");
      return;
    }

    if (!currentUserId) {
      alert("No se encontró tu ID de usuario. Verifica con World ID primero o recarga la app.");
      return;
    }

    try {
      const { data: inserted, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: currentUserId,
          content: newPostContent.trim(),
          timestamp: new Date().toISOString(),
          deleted_flag: false,
          visibility_score: 1
        })
        .select();

      if (insertError) throw insertError;

      setShowNewPostModal(false);
      setNewPostContent('');
      fetchPosts(true);

    } catch (err: any) {
      console.error("[POST] Error al publicar:", err);
      alert("Error al publicar: " + (err.message || "Intenta de nuevo"));
    }
  };

  // --- Todo el resto de UI queda exactamente igual ---
  // No se toca nada de botones, modales ni estilos

  return (
    <div ref={containerRef} className={`min-h-screen overflow-y-auto antialiased ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`} style={{ overflowX: "hidden" }}>
      {/* Aquí va todo tu JSX de header, botones, modales, feed, exactamente como antes */}
    </div>
  );
};

export default HomePage;
