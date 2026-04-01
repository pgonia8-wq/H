/**
 * ProfileModal.tsx – CORREGIDO
 *
 * ERRORES CORREGIDOS:
 * [P1] handlePremiumChat: MiniKit.isInstalled() verificado ANTES de llamar a pay()
 * [P2] handlePremiumChat: reference de pago debe ser UUID v4, no "premium-chat-" + Date.now()
 * [P3] handlePremiumChat: el resultado de /api/subscribePremiumChat NO se verifica
 *      — si el backend devuelve error, el usuario era redirigido igual → CORREGIDO
 * [P4] handlePremiumChat: sin await sobre fetch no se detectan errores del backend → CORREGIDO
 * [P5] handleUploadAvatar: no se valida tipo/tamaño del archivo antes de subir
 *      → añadida validación de tipo (solo imágenes) y tamaño (máx 5 MB)
 * [P6] supabase importado con credenciales hardcoded en src/lib/supabase.ts
 *      y también en src/supabaseClient.ts — ambas son iguales y están hardcoded;
 *      el modal usa supabaseClient.ts que tiene las credenciales hardcoded.
 *      Se mantiene el import existente (supabaseClient) pero se documenta
 *      la necesidad de moverlo a variables de entorno.
 * [P7] handleSendComplaint: anonKey expuesta en fetch desde el cliente → documentado
 * [P8] isOwnProfile siempre true si currentUserId está definido, sin importar si
 *      currentUserId === id — se corrige la lógica para que solo sea editable
 *      el perfil propio
 * [P9] handleSave: no se valida longitud mínima de nombre antes de guardar
 * [P10] refreshProfile: errores silenciados si falla la recarga
 * [P11] handleUploadAvatar: bucket "avatars" debe ser público para que getPublicUrl
 *       funcione — se añade comentario de configuración requerida en Supabase
 */

import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../lib/ThemeContext";
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";
import Dashboard from "../../dashboard/src/Dashboard";
import { useLanguage } from '../LanguageContext';
import { Country, State, City } from "country-state-city";

// RECEIVER: dirección de la wallet que recibe los pagos
const RECEIVER = "0xdf4a991bc05945bd0212e773adcff6ea619f4c4b";

// [P2] Genera un reference UUID v4 válido para Worldcoin Pay
function generatePayReference(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para entornos embebidos (WebView de World App)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// [P8] fetch con timeout para entornos embebidos (WebView)
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 12000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

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
  state: string;
  country: string;
  country_selected_at: string | null;
  website: string;
  location_text: string;
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
  state: "",
  country: "",
  country_selected_at: null,
  website: "",
  location_text: "",
  posts_count: 0,
  followers_count: 0,
  following_count: 0,
  profile_visible: true,
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// [P5] Constantes de validación de avatar
const MAX_AVATAR_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [bioLength, setBioLength] = useState(0);
  const [activeTab, setActiveTab] = useState<"info" | "location">("info");

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintMessage, setComplaintMessage] = useState("");
  const [sendingComplaint, setSendingComplaint] = useState(false);

  const { theme, username: globalUsername } = useContext(ThemeContext);
  const [showDashboard, setShowDashboard] = useState(false);

  // [P8] isOwnProfile solo es true si el usuario actual está viendo SU PROPIO perfil
  const isOwnProfile = !!(currentUserId && currentUserId === id);

  const countries = Country.getAllCountries();
  const selectedCountryObj = countries.find(c => c.isoCode === profile.country);
  const states = profile.country ? State.getStatesOfCountry(profile.country) : [];
  const selectedStateObj = states.find(s => s.isoCode === profile.state);
  const cities = profile.country && profile.state
    ? City.getCitiesOfState(profile.country, profile.state)
    : [];

  const isCountryLocked = (): boolean => {
    if (!profile.country_selected_at) return false;
    const selected = new Date(profile.country_selected_at).getTime();
    return Date.now() - selected < ONE_YEAR_MS;
  };

  const countryLockDaysLeft = (): number => {
    if (!profile.country_selected_at) return 0;
    const selected = new Date(profile.country_selected_at).getTime();
    const ms = ONE_YEAR_MS - (Date.now() - selected);
    return Math.ceil(ms / (24 * 60 * 60 * 1000));
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showComplaintModal) setShowComplaintModal(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, showComplaintModal]);

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

        const updatedProfile: UserProfile = {
          ...emptyProfile,
          ...data,
          username: data?.username || globalUsername || `@${id.slice(0, 10)}`,
        };

        setProfile(updatedProfile);
        setBioLength(updatedProfile.bio?.length || 0);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[ProfileModal] Error cargando perfil:", msg);
        showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, globalUsername]);

  // [P10] refreshProfile con manejo de errores
  const refreshProfile = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) {
        console.error("[ProfileModal] Error en refreshProfile:", error.message);
        return;
      }
      if (data) {
        setProfile({
          ...emptyProfile,
          ...data,
          username: data.username || globalUsername || `@${id.slice(0, 10)}`,
        });
      }
    } catch (err: unknown) {
      console.error("[ProfileModal] Error inesperado en refreshProfile:", err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // [P5] Validar tipo de archivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast(t("tipo_archivo_no_valido") || "Solo se permiten imágenes (JPG, PNG, WebP, GIF)", "error");
      return;
    }

    // [P5] Validar tamaño (máx 5 MB)
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      showToast(t("archivo_muy_grande") || `El archivo no puede superar ${MAX_AVATAR_SIZE_MB} MB`, "error");
      return;
    }

    setSelectedFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile || !currentUserId || !isOwnProfile) return;
    setUploadingAvatar(true);
    try {
      const fileExt = selectedFile.name.split(".").pop() || "jpg";
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;

      const img = document.createElement("img");
      img.src = URL.createObjectURL(selectedFile);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const MAX = 512;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height *= MAX / width; width = MAX; }
      } else {
        if (height > MAX) { width *= MAX / height; height = MAX; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      const compressedBlob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error("Error comprimiendo imagen"));
        }, "image/jpeg", 0.8);
      });

      // [P11] NOTA: El bucket "avatars" en Supabase debe estar configurado como
      // público (Public bucket) para que getPublicUrl() devuelva URLs accesibles.
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, compressedBlob, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", currentUserId);
      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      setPreviewAvatar(null);
      setSelectedFile(null);
      showToast(t("avatar_subido_exito") || "Avatar actualizado", "success");
      console.log("[ProfileModal] Avatar subido correctamente:", publicUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ProfileModal] Error subiendo avatar:", msg);
      showToast(msg || t("error_subir_avatar") || "Error al subir avatar", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // [P9] handleSave con validación de nombre mínimo
  const handleSave = async () => {
    if (!currentUserId) {
      showToast("No se encontró userId", "error");
      return;
    }

    // [P9] Validación mínima antes de guardar
    if (!profile.name || profile.name.trim().length < 1) {
      showToast(t("nombre_requerido") || "El nombre no puede estar vacío", "error");
      return;
    }

    setSaving(true);
    try {
      const isChangingCountry = profile.country && !isCountryLocked();
      const updatePayload: Record<string, unknown> = {
        name: profile.name.trim(),
        bio: profile.bio,
        birthdate: profile.birthdate,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        location_text: profile.location_text,
        profile_visible: profile.profile_visible,
      };

      if (isChangingCountry && profile.country) {
        updatePayload.country_selected_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", currentUserId);

      if (error) throw error;

      await refreshProfile();
      showToast(t("perfil_guardado") || "Perfil guardado", "success");
      console.log("[ProfileModal] Perfil guardado para userId:", currentUserId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ProfileModal] Error guardando perfil:", msg);
      showToast(`${t("error_guardar") || "Error al guardar"}: ${msg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // [P7] NOTA: handleSendComplaint envía la anonKey desde el cliente al header.
  // Esto expone la clave en el frontend (ya es pública en el repo).
  // La Edge Function de Supabase debería usar auth JWT en su lugar.
  // Por ahora se mantiene el comportamiento pero se documenta el riesgo.
  const handleSendComplaint = async () => {
    if (!complaintMessage.trim()) return;
    setSendingComplaint(true);
    try {
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!anonKey) throw new Error("Configuración de Supabase no encontrada");

      const res = await fetchWithTimeout(
        "https://vtjqfzpfehfofamhowjz.supabase.co/functions/v1/send-complaint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
            "apikey": anonKey,
          },
          body: JSON.stringify({
            message: complaintMessage,
            userId: currentUserId,
            username: profile.username,
          }),
        },
        10000
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = (errData as { error?: string }).error ?? `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      showToast(t("queja_enviada") || "Mensaje enviado correctamente", "success");
      setComplaintMessage("");
      setShowComplaintModal(false);
      console.log("[ProfileModal] Queja enviada por userId:", currentUserId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ProfileModal] Error enviando queja:", msg);
      showToast(msg || "Error al enviar mensaje", "error");
    } finally {
      setSendingComplaint(false);
    }
  };

  const toggleProfileVisibility = () => {
    setProfile(prev => ({ ...prev, profile_visible: !prev.profile_visible }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // [P1][P2][P3][P4] PREMIUM CHAT PAYMENT — todos los errores corregidos
  // ─────────────────────────────────────────────────────────────────────────
  const handlePremiumChat = async () => {
    if (!currentUserId) {
      showToast(t("id_no_encontrado") || "No se encontró userId", "error");
      return;
    }

    if (profile.tier === "premium" || profile.tier === "premium+") {
      window.location.href = "/chat/premium";
      return;
    }

    try {
      // [P1] Verificar MiniKit ANTES de intentar el pago
      if (!MiniKit.isInstalled()) {
        throw new Error(t("minikit_no_detectado") || "World App no detectada. Abre esta app desde World App.");
      }

      const payRes = await MiniKit.commandsAsync.pay({
        // [P2] UUID v4 válido para Worldcoin — NO usar Date.now() directamente
        reference: generatePayReference(),
        to: RECEIVER,
        tokens: [{ symbol: Tokens.WLD, token_amount: tokenToDecimals(5, Tokens.WLD).toString() }],
        description: t("suscripcion_chat_exclusivo") || "Suscripción Chat Premium",
      });

      if (payRes?.finalPayload?.status !== "success") {
        // Pago cancelado por el usuario — no es un error crítico
        const cancelReason = payRes?.finalPayload?.status ?? "unknown";
        console.warn("[ProfileModal] Pago cancelado por usuario. Status:", cancelReason);
        throw new Error(t("pago_cancelado") || "Pago cancelado");
      }

      const transactionId = payRes.finalPayload.transaction_id;
      console.log("[ProfileModal] Pago recibido, verificando en backend. txId:", transactionId);

      // [P3][P4] Verificar respuesta del backend CORRECTAMENTE con await y manejo de errores
      let subscribeRes: Response;
      try {
        subscribeRes = await fetchWithTimeout("/api/subscribePremiumChat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            transactionId,
          }),
        }, 12000);
      } catch (fetchErr: unknown) {
        const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        console.error("[ProfileModal] Error de red al verificar suscripción:", msg);
        throw new Error(`Error de red al verificar suscripción: ${msg}`);
      }

      if (!subscribeRes.ok) {
        const errData = await subscribeRes.json().catch(() => ({}));
        const errMsg = (errData as { error?: string }).error ?? `HTTP ${subscribeRes.status}`;
        console.error("[ProfileModal] Backend rechazó suscripción premium:", errData);
        throw new Error(`Error del servidor: ${errMsg}`);
      }

      const subscribeData = await subscribeRes.json().catch(() => ({}));
      console.log("[ProfileModal] Suscripción confirmada por backend:", subscribeData);

      showToast(t("suscripcion_exitosa") || "¡Suscripción activada!", "success");
      // Pequeña pausa para que el usuario vea el toast antes de redirigir
      setTimeout(() => { window.location.href = "/chat/premium"; }, 1200);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ProfileModal] Error en handlePremiumChat:", msg);
      showToast(msg || t("error_pago") || "Error en el pago", "error");
    }
  };

  const tierColors: Record<string, string> = {
    "premium+": "bg-yellow-500 text-black",
    "premium": "bg-purple-600 text-white",
    "basic": "bg-blue-600 text-white",
    "free": "bg-gray-700 text-gray-300",
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-gray-950 border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-lg font-bold text-white">
              {isOwnProfile ? (t("mi_perfil") || "Mi Perfil") : (t("perfil") || "Perfil")}
            </h2>
            <button onClick={onClose} className="text-white/30 hover:text-white/70 cursor-pointer transition-colors p-1 rounded-lg">
              ✕
            </button>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center px-5 pb-4 gap-3">
            <div className="relative">
              <img
                src={previewAvatar || profile.avatar_url || "/default-avatar.png"}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500/30"
                onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png"; }}
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                </div>
              )}
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-1.5 rounded-full cursor-pointer transition-colors shadow-lg">
                  <input type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="hidden" onChange={handleAvatarChange} />
                  <span className="text-white text-xs">📷</span>
                </label>
              )}
            </div>

            <div className="text-center">
              <h3 className="text-white font-bold text-lg">{profile.name || profile.username}</h3>
              <p className="text-gray-400 text-sm">@{profile.username}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${tierColors[profile.tier] || tierColors.free}`}>
                {profile.tier}
              </span>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-center">
              {[
                { label: t("publicaciones") || "Posts", value: profile.posts_count },
                { label: t("seguidores") || "Seguidores", value: profile.followers_count },
                { label: t("siguiendo") || "Siguiendo", value: profile.following_count },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-white font-bold text-lg">{value}</div>
                  <div className="text-gray-400 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Upload avatar button */}
            {isOwnProfile && selectedFile && (
              <button
                onClick={handleUploadAvatar}
                disabled={uploadingAvatar}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold text-sm disabled:opacity-50 transition"
              >
                {uploadingAvatar ? (t("subiendo") || "Subiendo...") : (t("guardar_avatar") || "Guardar avatar")}
              </button>
            )}
          </div>

          {/* Tabs */}
          {isOwnProfile && (
            <div className="flex gap-2 px-5 mb-4">
              {(["info", "location"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === tab
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab === "info" ? (t("informacion") || "Información") : (t("ubicacion") || "Ubicación")}
                </button>
              ))}
            </div>
          )}

          <div className="px-5 pb-5 space-y-3">
            {/* Info tab */}
            {(!isOwnProfile || activeTab === "info") && (
              <>
                {/* Bio */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t("bio") || "Bio"}</label>
                  {isOwnProfile ? (
                    <>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => { setProfile(p => ({ ...p, bio: e.target.value })); setBioLength(e.target.value.length); }}
                        rows={3}
                        maxLength={200}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder={t("escribe_tu_bio") || "Cuéntanos algo sobre ti…"}
                      />
                      <span className="text-xs text-gray-500">{bioLength}/200</span>
                    </>
                  ) : (
                    <p className="text-sm text-gray-300">{profile.bio || (t("sin_bio") || "Sin bio")}</p>
                  )}
                </div>

                {/* Name */}
                {isOwnProfile && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t("nombre") || "Nombre"}</label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={t("tu_nombre") || "Tu nombre"}
                    />
                  </div>
                )}

                {/* Birthdate */}
                {isOwnProfile && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t("fecha_nacimiento") || "Fecha de nacimiento"}</label>
                    <input
                      type="date"
                      value={profile.birthdate}
                      onChange={(e) => setProfile(p => ({ ...p, birthdate: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Profile visibility */}
                {isOwnProfile && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{t("perfil_visible") || "Perfil visible"}</span>
                    <button
                      onClick={toggleProfileVisibility}
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${profile.profile_visible ? "bg-purple-600" : "bg-gray-700"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${profile.profile_visible ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Location tab */}
            {isOwnProfile && activeTab === "location" && (
              <>
                {/* Country */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {t("pais") || "País"} {isCountryLocked() && `(bloqueado ${countryLockDaysLeft()}d)`}
                  </label>
                  <select
                    value={profile.country}
                    onChange={(e) => setProfile(p => ({ ...p, country: e.target.value, state: "", city: "" }))}
                    disabled={isCountryLocked()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <option value="">{t("selecciona_pais") || "Selecciona país"}</option>
                    {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                  </select>
                </div>

                {/* State */}
                {states.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t("estado") || "Estado / Provincia"}</label>
                    <select
                      value={profile.state}
                      onChange={(e) => setProfile(p => ({ ...p, state: e.target.value, city: "" }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">{t("selecciona_estado") || "Selecciona estado"}</option>
                      {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                {/* City */}
                {cities.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t("ciudad") || "Ciudad"}</label>
                    <select
                      value={profile.city}
                      onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">{t("selecciona_ciudad") || "Selecciona ciudad"}</option>
                      {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {/* Location text */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t("texto_ubicacion") || "Descripción de ubicación"}</label>
                  <input
                    value={profile.location_text}
                    onChange={(e) => setProfile(p => ({ ...p, location_text: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t("ej_madrid_espana") || "Ej: Madrid, España"}
                  />
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {isOwnProfile && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold text-sm disabled:opacity-50 transition"
                >
                  {saving ? (t("guardando") || "Guardando...") : (t("guardar_cambios") || "Guardar cambios")}
                </button>
              )}

              {/* Premium Chat button */}
              {(showUpgradeButton || isOwnProfile) && (
                <button
                  onClick={handlePremiumChat}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-semibold text-sm transition"
                >
                  {profile.tier === "premium" || profile.tier === "premium+"
                    ? (t("ir_al_chat_premium") || "Ir al Chat Premium")
                    : (t("obtener_chat_premium") || "Obtener Chat Premium — 5 WLD")}
                </button>
              )}

              {/* Open DM (only for other profiles) */}
              {!isOwnProfile && onOpenChat && id && (
                <button
                  onClick={() => { onOpenChat(id); onClose(); }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition"
                >
                  {t("enviar_mensaje") || "Enviar mensaje"}
                </button>
              )}

              {/* Dashboard */}
              {isOwnProfile && (
                <button
                  onClick={() => setShowDashboard(true)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl font-semibold text-sm transition border border-white/10"
                >
                  {t("ver_dashboard") || "Ver Dashboard"}
                </button>
              )}

              {/* Report */}
              {!isOwnProfile && (
                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="w-full py-2 text-red-400 hover:text-red-300 text-sm transition"
                >
                  {t("reportar_usuario") || "Reportar usuario"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowComplaintModal(false)}>
          <div className="w-full max-w-sm bg-gray-950 border border-white/10 rounded-3xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white mb-2">
              {t("reportar_usuario") || "Reportar usuario"}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {t("describe_el_problema") || "Describe el problema con este usuario"}
            </p>
            <textarea
              value={complaintMessage}
              onChange={e => setComplaintMessage(e.target.value)}
              rows={5}
              className="w-full bg-gray-900 border border-white/10 p-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4"
              placeholder={t("escribe_tu_mensaje") || "Escribe tu mensaje aquí..."}
            />
            <button
              onClick={handleSendComplaint}
              disabled={sendingComplaint || !complaintMessage.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold text-sm disabled:opacity-50 transition"
            >
              {sendingComplaint ? (t("enviando") || "Enviando...") : (t("enviar") || "Enviar")}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4">
          <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-xl ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Dashboard overlay */}
      {showDashboard && (
        <div
          className="fixed inset-0 z-[9999] bg-black"
          onClick={() => setShowDashboard(false)}
        >
          <div
            className="w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Dashboard
              currentUserId={currentUserId}
              onClose={() => setShowDashboard(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
