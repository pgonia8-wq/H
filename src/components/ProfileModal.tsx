import React, { useEffect, useState, useContext, useRef } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../lib/ThemeContext";
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";

interface ProfileModalProps {
  id: string | null;
  onClose: () => void;
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
  profile_visible: true
};

// Dirección del receiver para pagos WLD
const RECEIVER = "0xdf4a991bc05945bd0212e773adcff6ea619f4c4b";

const ProfileModal: React.FC<ProfileModalProps> = ({ id, onClose }) => {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [subscribed, setSubscribed] = useState(false); // Suscripción al chat premium

  const { theme } = useContext(ThemeContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return setLoading(false);

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;

        setProfile(data || emptyProfile);

        // Verificar si tiene suscripción activa
        const { data: subData, error: subError } = await supabase
          .from("premium_subscriptions")
          .select("*")
          .eq("user_id", id)
          .eq("active", true)
          .maybeSingle();

        if (subError) throw subError;
        setSubscribed(!!subData);

      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

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
          profile_visible: profile.profile_visible
        })
        .eq("id", id);
      if (error) throw error;
      setToast({ message: "Perfil guardado", type: "success" });
    } catch (err: any) {
      setToast({ message: "Error guardando perfil", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploadingAvatar(true);
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(`${id}/${file.name}`, file);
      if (error) throw error;

      const { data: publicURLData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);
      const publicUrl = publicURLData.publicUrl;

      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", id);

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChatPremium = async () => {
    if (!id) return;

    if (subscribed) {
      // Abrir chat premium
      window.location.href = "/chat/premium";
      return;
    }

    // Si no está suscripto → pagar 5 WLD
    if (!MiniKit.isInstalled()) {
      alert("MiniKit no detectado en World App");
      return;
    }

    try {
      const price = 5;
      const payRes = await MiniKit.commandsAsync.pay({
        reference: "premium_chat-" + Date.now(),
        to: RECEIVER,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(price, Tokens.WLD).toString()
          }
        ],
        description: "Suscripción mensual Chat Premium"
      });

      if (payRes?.finalPayload?.status !== "success") {
        alert("Pago cancelado o fallido");
        return;
      }

      const transactionId = payRes?.finalPayload?.transaction_id;

      // Guardar la suscripción en Supabase
      const { error } = await supabase.from("premium_subscriptions").upsert({
        user_id: id,
        active: true,
        transaction_id: transactionId,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      if (error) throw error;

      setSubscribed(true);
      alert("¡Suscripción activa! Ahora puedes acceder al chat premium.");
      window.location.href = "/chat/premium";

    } catch (err: any) {
      console.error(err);
      alert("Error procesando el pago: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-2 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-white/10 space-y-4">
        {loading ? (
          <p>Cargando perfil...</p>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white">Tu Perfil</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-purple-600 p-1 rounded-full"
                >
                  ✏️
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div>
                <p className="text-white font-bold">{profile.name || "Tu nombre"}</p>
                <input
                  value={`@${id?.slice(0, 10)}`}
                  disabled
                  className="bg-transparent text-gray-400 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <textarea
              value={profile.bio}
              onChange={(e) => {
                if (e.target.value.length <= 160) {
                  setProfile({ ...profile, bio: e.target.value });
                }
              }}
              className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white"
              placeholder="Escribe tu bio"
            />

            <input
              type="date"
              value={profile.birthdate}
              onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white"
            />

            <input
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="Ciudad"
              className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white"
            />

            <input
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              placeholder="País"
              className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-green-600 text-white rounded-full"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3 bg-red-600 text-white rounded-full"
              >
                Cancelar
              </button>
            </div>

            {/* === NUEVO BOTÓN CHAT PREMIUM === */}
            <button
              onClick={handleChatPremium}
              className="w-full py-3 bg-purple-600 text-white rounded-full font-medium mt-4"
            >
              Abrir Chat Exclusivo para Creadores de Tokens
            </button>

          </>
        )}

        {toast && (
          <p className={toast.type === "success" ? "text-green-500" : "text-red-500"}>
            {toast.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
