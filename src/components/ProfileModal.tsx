import React, { useEffect, useState, useContext, useRef } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../lib/ThemeContext";

interface ProfileModalProps {
  currentUserId: string | null;
  onClose: () => void;
  showUpgradeButton?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  tier: "free" | "basic" | "premium" | "premium+";
  bio: string;
  created_at: string;
  birthdate: string;
  city: string;
  country: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
}

const emptyProfile: UserProfile = {
  id: "",
  name: "",
  username: "",
  avatar_url: "",
  tier: "free",
  bio: "",
  created_at: "",
  birthdate: "",
  city: "",
  country: "",
  posts_count: 0,
  followers_count: 0,
  following_count: 0,
};

const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUserId,
  onClose,
  showUpgradeButton = true,
}) => {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "responses" | "likes">("posts");
  const [bioLength, setBioLength] = useState(0);
  const { theme, setTheme } = useContext(ThemeContext);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  // Cargar theme persistente
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  const saveTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleUpgrade = async (tier: "premium" | "premium+") => {
    if (!currentUserId) return;

    const attemptUpgrade = async (retries = 2) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await fetch("/api/upgrade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: currentUserId,
              tier,
              transactionId: "tx-test-001",
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          console.log("Upgrade response:", data);
          if (data.success) {
            showToast(`Upgrade exitoso: ${tier}`, "success");
            setProfile(prev => ({ ...prev, tier }));
          } else {
            showToast(`Error en upgrade: ${data.error}`, "error");
          }
          return;
        } catch (err: any) {
          console.error("Error conectando con API upgrade:", err);
          if (i < retries) await new Promise(r => setTimeout(r, 400));
          else showToast("No se pudo conectar con la API de upgrade", "error");
        }
      }
    };

    await attemptUpgrade();
  };

  useEffect(() => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
  }, []);

  const focusTrap = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !focusTrapRef.current) return;
    const focusable = Array.from(
      focusTrapRef.current.querySelectorAll<HTMLElement>(
        "input, textarea, select, button, a[href], [tabindex]:not([tabindex='-1'])"
      )
    ).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", focusTrap);
    return () => document.removeEventListener("keydown", focusTrap);
  }, []);

  const loadOrCreateProfile = async () => {
    setLoading(true);
    setError(null);

    const attemptLoad = async (retries = 2) => {
      for (let i = 0; i <= retries; i++) {
        try {
          if (!currentUserId) {
            setProfile({ ...emptyProfile, id: "guest", username: "invitado" });
            setLoading(false);
            return;
          }

          const { data, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUserId)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

          if (data) {
            setProfile(data);
            setBioLength(data.bio?.length || 0);
          } else {
            const newProfile = {
              id: currentUserId,
              name: "",
              username: `user_${currentUserId.slice(0, 8)}`,
              avatar_url: "",
              tier: "free" as const,
              bio: "",
              created_at: new Date().toISOString(),
              birthdate: "",
              city: "",
              country: "",
              posts_count: 0,
              followers_count: 0,
              following_count: 0,
            };

            const { error: upsertError } = await supabase
              .from("profiles")
              .upsert(newProfile);

            if (upsertError) throw upsertError;

            setProfile(newProfile);
          }
          return;
        } catch (err: any) {
          console.error("Error cargando/creando perfil:", err);
          if (i < retries) await new Promise(r => setTimeout(r, 400));
          else setError("No pudimos cargar tu perfil. Intenta más tarde.");
        }
      }
    };

    await attemptLoad();
    setLoading(false);
  };

  useEffect(() => {
    loadOrCreateProfile();
  }, [currentUserId]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!currentUserId) return;
    setSaving(true);

    const attemptSave = async (retries = 2) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const { error } = await supabase
            .from("profiles")
            .upsert({
              id: currentUserId,
              name: profile.name,
              bio: profile.bio,
              birthdate: profile.birthdate,
              city: profile.city,
              country: profile.country,
              avatar_url: profile.avatar_url,
            });
          if (error) throw error;
          showToast("Perfil guardado correctamente ✅");
          if (lastFocusedElementRef.current) lastFocusedElementRef.current.focus();
          return;
        } catch (err: any) {
          console.error("Error guardando perfil:", err);
          if (i < retries) await new Promise(r => setTimeout(r, 400));
          else showToast("Error al guardar: " + err.message, "error");
        }
      }
    };

    await attemptSave();
    setSaving(false);
    onClose();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    if (!file.type.startsWith("image/")) {
      showToast("Solo se permiten imágenes (JPG, PNG, etc.)", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("La imagen es muy grande (máximo 5 MB)", "error");
      return;
    }

    setUploadingAvatar(true);

    const attemptUpload = async (retries = 2) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const timestamp = Date.now();
          const fileName = `${currentUserId}/avatar-${timestamp}`;

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

          if (!urlData || !urlData.publicUrl) throw new Error("No se obtuvo URL pública");

          const newAvatarUrl = `${urlData.publicUrl}?t=${timestamp}`;

          const { error: updateError } = await supabase
            .from("profiles")
            .update({ avatar_url: newAvatarUrl })
            .eq("id", currentUserId);

          if (updateError) throw updateError;

          setProfile((prev) => ({ ...prev, avatar_url: newAvatarUrl }));
          showToast("Avatar actualizado correctamente");
          return;
        } catch (err: any) {
          console.error("Error en avatar:", err);
          if (i < retries) await new Promise(r => setTimeout(r, 400));
          else showToast("No se pudo subir o asociar la imagen: " + err.message, "error");
        }
      }
    };

    await attemptUpload();
    setUploadingAvatar(false);
  };

  const toggleTheme = () => {
    saveTheme(theme === "dark" ? "light" : "dark");
  };

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const isPremium = profile.tier === "premium" || profile.tier === "premium+";

  // Clases condicionales por tema
  const modalBg = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black";
  const headerGradient = theme === "dark" ? "from-indigo-600 to-purple-600" : "from-indigo-500 to-purple-500";
  const inputBg = theme === "dark" ? "bg-gray-800" : "bg-gray-200 text-black";
  const borderColor = theme === "dark" ? "border-white/20" : "border-gray-300";
  const textGray = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const tabActive = theme === "dark" ? "text-purple-400 border-purple-400" : "text-purple-600 border-purple-600";
  const tabInactive = theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800";
  const buttonGreen = theme === "dark" ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600";
  const buttonRed = theme === "dark" ? "bg-red-600/80 hover:bg-red-700" : "bg-red-500 hover:bg-red-600";

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-white text-xl animate-pulse">Cargando perfil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-8 rounded-2xl text-center max-w-sm">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={onClose} className="px-6 py-3 bg-purple-600 rounded-xl text-white">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/80 flex flex-col z-50 ${modalBg}`}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in-out ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className={`relative bg-gradient-to-r ${headerGradient} h-32 flex-shrink-0`}>
        <button
          onClick={onClose}
          aria-label="Cerrar perfil"
          className="absolute top-4 right-16 text-white text-3xl font-light hover:text-gray-200 z-10"
        >
          ×
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="absolute top-4 right-4 text-white text-2xl hover:text-yellow-300 transition-colors z-10"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Avatar fijo centrado en la parte superior */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-28 z-20">
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          alt="Tu avatar"
          className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg"
          onError={(e) => ((e.target as HTMLImageElement).src = "/default-avatar.png")}
        />

        {/* Lápiz para cambiar avatar */}
        <div
          onClick={() => avatarInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1.5 cursor-pointer hover:bg-purple-700 shadow-lg flex items-center justify-center"
          title="Cambiar avatar"
        >
          ✏️
        </div>

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
          disabled={uploadingAvatar}
        />
      </div>

      {/* Contenido principal con focus trap */}
      <div className="flex-1 overflow-y-auto" ref={focusTrapRef}>
        <div className="pt-14 px-6 pb-6">
          {/* El resto del contenido se mantiene igual */}
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className={`bg-transparent text-2xl font-bold w-full focus:outline-none ${textGray}`}
            placeholder="Tu nombre"
            maxLength={50}
          />
          <p className={textGray + " mt-1"}>@{profile.username || "sin_username"}</p>

          {isPremium && (
            <div className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold rounded-full">
              PREMIUM
            </div>
          )}

          <textarea
            value={profile.bio}
            onChange={(e) => {
              const val = e.target.value.slice(0,160);
              setProfile({ ...profile, bio: val });
              setBioLength(val.length);
            }}
            placeholder="Escribe tu bio..."
            maxLength={160}
            className={`mt-4 w-full ${inputBg} text-white p-4 rounded-2xl resize-none h-28 focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
          <div className={`text-right text-xs ${textGray} mt-1`}>{bioLength}/160</div>

          <div className="flex gap-6 mt-6 text-sm">
            <div>
              <span className="font-bold text-white">{profile.following_count}</span>{" "}
              <span className={textGray}>Siguiendo</span>
            </div>
            <div>
              <span className="font-bold text-white">{profile.followers_count}</span>{" "}
              <span className={textGray}>Seguidores</span>
            </div>
            <div className={textGray}>
              Se unió en <span className="text-white">{joinedDate}</span>
            </div>
          </div>

          <div className={`mt-5 flex flex-wrap gap-4 text-sm ${textGray}`}>
            {(profile.city || profile.country) && (
              <div>📍 {profile.city}{profile.country ? `, ${profile.country}` : ""}</div>
            )}
            {profile.birthdate && (
              <div>🎂 {new Date(profile.birthdate).toLocaleDateString("es-MX")}</div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${borderColor} sticky top-0 ${modalBg} z-10`}>
          {(["posts", "responses", "likes"] as const).map((tab) => (
            <button
              key={tab}
