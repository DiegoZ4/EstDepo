import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/auth.context";
import { apiRequest } from "../services/apiService";
import {
  getSubscriptionStatus,
  cancelSubscription,
  reactivateSubscription,
} from "../services/subscriptionService";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiEdit3,
  FiLock,
  FiStar,
  FiX,
  FiAlertTriangle,
  FiShield,
  FiCreditCard,
  FiArrowLeft,
  FiSave,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const Perfil = () => {
  const { isAuthenticated, user, isSubscribed, refreshSubscription, logout } =
    useContext(AuthContext);
  const navigate = useNavigate();

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bornDate: "",
  });
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPw, setShowNewPw] = useState(false);

  // Subscription state
  const [subData, setSubData] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelProcessing, setCancelProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadProfile();
    loadSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const userId = user?.sub || user?.id;
      if (!userId) {
        throw new Error("No user ID found");
      }
      const res = await apiRequest(`/users/${userId}`, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || user?.name || "",
          email: data.email || user?.email || "",
          bornDate: data.bornDate ? data.bornDate.split("T")[0] : "",
        });
        setNewName(data.name || user?.name || "");
      } else {
        // Fallback to JWT data
        setProfileData({
          name: user?.name || "",
          email: user?.email || "",
          bornDate: "",
        });
        setNewName(user?.name || "");
      }
    } catch {
      setProfileData({
        name: user?.name || "",
        email: user?.email || "",
        bornDate: "",
      });
      setNewName(user?.name || "");
    }
  };

  const loadSubscription = async () => {
    try {
      setSubLoading(true);
      const data = await getSubscriptionStatus();
      setSubData(data);
    } catch (err) {
      console.error("Error cargando suscripción:", err);
    } finally {
      setSubLoading(false);
    }
  };

  // ── Save name ──────────────────────────────────
  const handleSaveName = async () => {
    if (!newName.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const userId = user?.sub || user?.id;
      if (!userId) {
        setError("No se pudo obtener el ID del usuario.");
        setSaving(false);
        return;
      }
      const res = await apiRequest(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setProfileData((prev) => ({ ...prev, name: newName.trim() }));
        setEditingName(false);
        setSuccess("Nombre actualizado correctamente.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || "Error al actualizar el nombre.");
      }
    } catch {
      setError("Error de conexión al actualizar el nombre.");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const userId = user?.sub || user?.id;
      if (!userId) {
        setError("No se pudo obtener el ID del usuario.");
        setSaving(false);
        return;
      }
      const res = await apiRequest(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });
      if (res.ok) {
        setShowPasswordForm(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setSuccess("Contraseña actualizada correctamente.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || "Error al cambiar la contraseña.");
      }
    } catch {
      setError("Error de conexión al cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel subscription ────────────────────────
  const handleCancelSubscription = async () => {
    setCancelProcessing(true);
    setError(null);
    try {
      const result = await cancelSubscription();
      // El backend decide automáticamente si cancela ahora o al final del período
      if (result.message) {
        setSuccess(result.message);
      } else {
        setSuccess("Suscripción cancelada correctamente.");
      }
      setShowCancelModal(false);
      loadSubscription();
      if (refreshSubscription) refreshSubscription();
    } catch (err) {
      setError(err.message || "Error al cancelar la suscripción.");
      setShowCancelModal(false);
    } finally {
      setCancelProcessing(false);
    }
  };

  const handleReactivate = async () => {
    setCancelProcessing(true);
    setError(null);
    try {
      await reactivateSubscription();
      setSuccess("¡Suscripción reactivada!");
      loadSubscription();
      if (refreshSubscription) refreshSubscription();
    } catch (err) {
      setError(err.message || "Error al reactivar la suscripción.");
    } finally {
      setCancelProcessing(false);
    }
  };

  // ── Helpers ────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      active: { label: "Activa", color: "text-[#a0f000]", bg: "bg-[#a0f000]/10" },
      authorized: { label: "Activa", color: "text-[#a0f000]", bg: "bg-[#a0f000]/10" },
      paused: { label: "Pausada", color: "text-yellow-400", bg: "bg-yellow-400/10" },
      cancelled: { label: "Cancelada", color: "text-red-400", bg: "bg-red-400/10" },
      pending: { label: "Pendiente", color: "text-blue-400", bg: "bg-blue-400/10" },
      none: { label: "Sin suscripción", color: "text-gray-400", bg: "bg-gray-400/10" },
    };
    return map[status] || map.none;
  };

  if (!isAuthenticated) return null;

  const subStatus = subData?.status || "none";
  const statusInfo = getStatusLabel(subStatus);
  const isActive = subStatus === "active" || subStatus === "authorized";

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Grid Layout ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ─── LEFT COLUMN ──────────────────────────────── */}
      <div className="space-y-6">

      {/* ─── Profile Card ─────────────────────────────── */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-full bg-[#a0f000]/10 flex items-center justify-center">
            <FiUser className="w-6 h-6 text-[#a0f000]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profileData.name}</h2>
            <p className="text-xs text-gray-400">{profileData.email}</p>
          </div>
          {user?.rol === "admin" ? (
            <span className="ml-auto text-[10px] bg-[#a0f000]/20 text-[#a0f000] px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <FiShield className="w-3 h-3" />
              ADMIN
            </span>
          ) : isSubscribed && (
            <span className="ml-auto text-[10px] bg-[#a0f000]/20 text-[#a0f000] px-2 py-1 rounded-full font-bold">
              PREMIUM
            </span>
          )}
        </div>

        <hr className="border-gray-700/40" />

        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </label>
          {editingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-modern flex-1"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="p-2.5 rounded-xl bg-[#a0f000]/10 text-[#a0f000] hover:bg-[#a0f000]/20 transition"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNewName(profileData.name);
                }}
                className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{profileData.name}</span>
              <button
                onClick={() => setEditingName(true)}
                className="p-2 rounded-xl text-gray-400 hover:text-[#a0f000] hover:bg-white/5 transition"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </label>
          <div className="flex items-center gap-2">
            <FiMail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">{profileData.email}</span>
          </div>
        </div>

        {/* Born date */}
        {profileData.bornDate && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de nacimiento
            </label>
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-300">
                {formatDate(profileData.bornDate)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Password Card ────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiLock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Contraseña</span>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-xs text-[#a0f000] hover:text-[#b8ff33] transition font-medium"
            >
              Cambiar
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            {/* New password */}
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                }
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                className="input-modern w-full pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNewPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm password */}
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              placeholder="Confirmar nueva contraseña"
              className="input-modern w-full"
              required
              minLength={6}
            />

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2 px-4 text-sm font-medium flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                Guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ newPassword: "", confirmPassword: "" });
                }}
                className="py-2 px-4 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      </div>{/* END LEFT COLUMN */}

      {/* ─── RIGHT COLUMN ─────────────────────────────── */}
      <div className="space-y-6">

      {/* ─── Subscription Card ────────────────────────── */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FiStar className="w-4 h-4 text-[#a0f000]" />
          <span className="text-sm font-semibold text-white">Suscripción</span>
        </div>

        {subLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : user?.rol === "admin" ? (
          // Admin user - show special message
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 bg-[#a0f000]/10 text-[#a0f000] text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <FiShield className="w-3.5 h-3.5" />
              ADMINISTRADOR
            </div>
            <p className="text-sm text-gray-300 mb-1">Acceso completo ilimitado</p>
            <p className="text-xs text-gray-400">
              Como administrador, tenés acceso premium automático a todas las funciones de la plataforma.
            </p>
          </div>
        ) : (
          <>
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Estado</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>

            {/* Start date */}
            {subData?.subscription_start_date && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Suscrito desde</span>
                <span className="text-xs text-gray-300">
                  {formatDate(subData.subscription_start_date)}
                </span>
              </div>
            )}

            {/* End date / next billing */}
            {subData?.subscription_end_date && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {isActive ? "Próxima facturación" : "Finaliza"}
                </span>
                <span className="text-xs text-gray-300">
                  {formatDate(subData.subscription_end_date)}
                </span>
              </div>
            )}

            <hr className="border-gray-700/40" />

            {/* Actions */}
            {isActive && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition flex items-center justify-center gap-2"
              >
                <FiAlertTriangle className="w-4 h-4" />
                Cancelar suscripción
              </button>
            )}

            {subStatus === "paused" && (
              <div className="space-y-2">
                <button
                  onClick={handleReactivate}
                  disabled={cancelProcessing}
                  className="btn-primary w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                >
                  {cancelProcessing ? "Procesando..." : "Reactivar suscripción"}
                </button>
              </div>
            )}

            {(subStatus === "none" || subStatus === "cancelled") && (
              <button
                onClick={() => navigate("/suscipcion")}
                className="btn-primary w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2"
              >
                <FiCreditCard className="w-4 h-4" />
                Suscribirse a Premium
              </button>
            )}
          </>
        )}
      </div>

      {/* ─── Danger Zone ──────────────────────────────── */}
      <div className="glass-card p-6 border-red-500/10">
        <div className="flex items-center gap-2 mb-4">
          <FiShield className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-gray-300">Zona de riesgo</span>
        </div>
        <button
          onClick={() => {
            if (confirm("¿Seguro que querés cerrar sesión?")) logout();
          }}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition"
        >
          Cerrar sesión
        </button>
      </div>

      </div>{/* END RIGHT COLUMN */}

      </div>{/* END GRID */}

      {/* ─── Cancel Modal ────────────────────────────── */}
      {showCancelModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div 
            className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border-red-500/20 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-xl bg-red-500/10 text-red-400 mb-3">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cancelar Suscripción</h3>
              <div className="text-xs text-gray-400 space-y-2 text-left bg-white/5 rounded-lg p-4">
                <p className="flex items-start gap-2">
                  <span className="text-[#a0f000] mt-0.5">•</span>
                  <span>Si cancelás <strong className="text-white">antes de 10 días</strong> desde tu suscripción, se cancela inmediatamente y se te reembolsa el pago.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#a0f000] mt-0.5">•</span>
                  <span>Si cancelás <strong className="text-white">después de 10 días</strong>, mantenés acceso premium hasta el final del período actual.</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelProcessing}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition flex items-center justify-center gap-2"
              >
                {cancelProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FiX className="w-4 h-4" />
                    Confirmar cancelación
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelProcessing}
                className="w-full py-2.5 text-sm text-gray-400 hover:text-white transition"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Perfil;
