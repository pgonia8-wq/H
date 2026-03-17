import React, { useEffect, useState, useContext, useRef } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../lib/ThemeContext";
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";
import { useLanguage } from '../LanguageContext';

const RECEIVER = "0xdf4a991bc05945bd0212e773adcff6ea619f4c4b";

interface ProfileModalProps {
  id: string | null;
  onClose: () => void;
  currentUserId: string | null;
  showUpgradeButton?: boolean;
  onOpenChat?: (otherUserId: string) => void;
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
  profile_visible: boolean;
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
  profile_visible: true,
};

const ProfileModal: React.FC<ProfileModalProps> = ({
  id,
  onClose,
  currentUserId,
  showUpgradeButton,
  onOpenChat,
}) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [bioLength, setBioLength] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // NUEVO: estados para subir avatar desde teléfono
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { theme, username: globalUsername } = useContext(ThemeContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        const updatedProfile = {
          ...emptyProfile,
          ...data,
          username: data?.username || globalUsername || `@${id.slice(0, 10)}`,
        };

        setProfile(updatedProfile);
        setBioLength(updatedProfile.bio.length || 0);
      } catch (err: any) {
        setToast({ message: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, globalUsername]);

  const refreshProfile = async () => {
    if (!id) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (data) {
      setProfile({
        ...emptyProfile,
        ...data,
        username: data.username || globalUsername || `@${id.slice(0, 10)}`,
      });
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          bio: profile.bio,
          birthdate: profile.birthdate,
          city: profile.city,
          country: profile.country,
          profile_visible: profile.profile_visible,
        })
        .eq("id", id);

      if (error) throw error;

      await refreshProfile();
      setToast({ message: t("perfil_guardado"), type: "success" });
      setEditMode(false);
    } catch (err: any) {
      setToast({ message: t("error_guardar") + ": " + err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // NUEVO: Seleccionar imagen del teléfono
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  // NUEVO: Subir avatar a Supabase y actualizar perfil
  const handleUploadAvatar = async () => {
    if (!selectedFile || !currentUserId) return;

    setUploadingAvatar(true);

    try {
      const fileExt = selectedFile.name.split(".").pop() || "jpg";
      const fileName = `\( {currentUserId}- \){Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const avatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      // Refrescar perfil local
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      setPreviewAvatar(null);
      setSelectedFile(null);

      setToast({ message: t("avatar_subido_exito") || "Avatar actualizado correctamente", type: "success" });
    } catch (err: any) {
      console.error("[ProfileModal] Error subiendo avatar:", err);
      setToast({ message: err.message || t("error_subir_avatar") || "Error al subir avatar", type: "error" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  
const toggleProfileVisibility = () => {
    setProfile(prev => ({ ...prev, profile_visible: !prev.profile_visible }));
  };

  const handlePremiumChat = async () => {
    if (!currentUserId) {
      setToast({ message: t("id_no_encontrado"), type: "error" });
      return;
    }

    if (profile.tier === "premium" || profile.tier === "premium+") {
      window.location.href = "/chat/premium";
      return;
    }

    try {
      if (!MiniKit.isInstalled()) throw new Error(t("minikit_no_detectado"));

      const payRes = await MiniKit.commandsAsync.pay({
        reference: "premium-chat-" + Date.now(),
        to: RECEIVER,
        tokens: [{ symbol: Tokens.WLD, token_amount: tokenToDecimals(5, Tokens.WLD).toString() }],
        description: t("suscripcion_chat_exclusivo"),
      });

      if (payRes?.finalPayload?.status !== "success") {
        throw new Error(t("pago_cancelado"));
      }

      await fetch("/api/subscribePremiumChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          transactionId: payRes.finalPayload.transaction_id
        }),
      });

      alert(t("suscripcion_exitosa"));
      window.location.href = "/chat/premium";
    } catch (err: any) {
      setToast({ message: err.message || t("error_pago"), type: "error" });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 px-2 overflow-y-auto pt-10"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-white/10 space-y-4 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Botón cerrar X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          aria-label={t("cerrar_modal")}
        >
          ×
        </button>

        {loading ? (
          <p className="text-white text-center py-8">{t("cargando_perfil")}</p>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{t("tu_perfil")}</h2>
              <span className={`px-3 py-1 text-xs rounded-full ${
                profile.tier === "premium+" ? "bg-yellow-500 text-black"
                : profile.tier === "premium" ? "bg-purple-600 text-white"
                : "bg-gray-600 text-white"
              }`}>
                {profile.tier.toUpperCase()}
              </span>
            </div>

            {/* AVATAR CON SUBIDA */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-4 border-purple-600 group">
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                )}

                <img
                  src={previewAvatar || profile.avatar_url || "/default-avatar.png"}
                  alt={t("avatar")}
                  className="w-full h-full object-cover"
                />

                {isOwnProfile && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <span className="text-white text-2xl">📷</span>
                  </label>
                )}

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </div>

              {/* Botones Cancelar/Guardar - aparecen solo si hay preview */}
              {previewAvatar && isOwnProfile && (
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => {
                      setPreviewAvatar(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    {t("cancelar")}
                  </button>
                  <button
                    onClick={handleUploadAvatar}
                    disabled={uploadingAvatar}
                    className={`px-4 py-2 rounded-lg font-medium min-w-[120px] ${
                      uploadingAvatar
                        ? "bg-gray-600 cursor-not-allowed text-gray-300"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {uploadingAvatar ? t("subiendo") || "Subiendo..." : t("guardar_avatar") || "Guardar avatar"}
                  </button>
                </div>
              )}

              <h2 className="text-2xl font-bold">{profile.username || t("usuario_anonimo")}</h2>
              <p className="text-gray-400">@{profile.username?.toLowerCase() || "anon"}</p>
              <p className="text-center max-w-xs">{profile.bio || t("sin_bio")}</p>
              <p className="text-sm text-gray-500">
                {profile.city || t("sin_ciudad")} • {profile.country || t("sin_pais")}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div>
                <p className="text-2xl font-bold">{postsCount}</p>
                <p className="text-gray-400 text-sm">{t("publicaciones")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{followersCount}</p>
                <p className="text-gray-400 text-sm">{t("seguidores")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{followingCount}</p>
                <p className="text-gray-400 text-sm">{t("siguiendo")}</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mb-6">
              {currentUserId && currentUserId !== id ? (
                <>
                  <button
                    onClick={handleFollow}
                    className={`flex-1 py-3 rounded-xl font-bold transition ${
                      followStatus === "following"
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {followStatus === "following" ? t("siguiendo") : t("seguir")}
                  </button>

                  <button
                    onClick={() => onOpenChat?.(id!)}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                  >
                    {t("mensaje")}
                  </button>
                </>
              ) : isOwnProfile ? (
                <button
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition"
                >
                  {t("editar_perfil")}
                </button>
              ) : null}
            </div>

            {/* Sección de upgrade */}
            {showUpgradeButton && !profile.tier && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl mb-6">
                <h3 className="font-bold text-yellow-400 mb-2">{t("mejora_tu_perfil")}</h3>
                <p className="text-sm text-gray-300 mb-4">{t("accede_a_funciones_exclusivas")}</p>
                <button className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition">
                  {t("ver_planes")}
                </button>
              </div>
            )}

            {/* Chat exclusivo */}
            {profile.tier === "premium" && (
              <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-4 rounded-xl mb-6">
                <h3 className="font-bold text-purple-400 mb-2">{t("chat_exclusivo")}</h3>
                <button
                  onClick={() => onOpenChat?.(id!)}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
                >
                  {t("chat_exclusivo_creadores_tokens")}
                </button>
              </div>
            )}

            {toast && (
              <p
                className={`text-center py-2 rounded mt-4 ${
                  toast.type === "success"
                    ? "bg-green-900 text-green-300"
                    : "bg-red-900 text-red-300"
                }`}
              >
                {toast.message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
  
