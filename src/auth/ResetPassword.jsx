import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiLock, FiArrowRight } from "react-icons/fi";

const apiUrl = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!token) {
      setError("Token inválido o expirado. Solicitá un nuevo link.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!response.ok) {
        try {
          const data = await response.json();
          setError(data.message || "Error al cambiar la contraseña.");
        } catch {
          setError("Error al cambiar la contraseña.");
        }
      } else {
        setMessage("¡Contraseña cambiada con éxito! Ya podés iniciar sesión.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[#a0f000]/10 mb-4">
              <FiLock className="w-6 h-6 text-[#a0f000]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Nueva Contraseña</h2>
            <p className="text-gray-400 text-sm mt-1">Ingresá tu nueva contraseña</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {message ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#a0f000]/10 border border-[#a0f000]/30 text-[#a0f000] text-sm text-center">
                {message}
              </div>
              <Link to="/login" className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                Ir al login <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center text-red-400 text-sm">
              Token inválido o expirado. <Link to="/forgot-password" className="text-[#a0f000] hover:underline">Solicitá un nuevo link.</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nueva contraseña</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-modern w-full !pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-modern w-full !pl-12"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                {loading ? "Guardando..." : (<>Cambiar contraseña <FiArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}

          {!message && (
            <p className="mt-6 text-center text-sm text-gray-400">
              <Link to="/login" className="text-[#a0f000] hover:text-[#8cd000] font-medium">
                Volver al login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
