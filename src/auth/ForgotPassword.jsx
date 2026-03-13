import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowRight } from "react-icons/fi";

const apiUrl = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        try {
          const data = await response.json();
          setError(data.message || "Error al enviar el correo.");
        } catch {
          setError("Error al enviar el correo.");
        }
      } else {
        setMessage("Te enviamos un correo con el link para restablecer tu contraseña.");
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
              <FiMail className="w-6 h-6 text-[#a0f000]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Recuperar Contraseña</h2>
            <p className="text-gray-400 text-sm mt-1">
              Ingresá tu email y te enviaremos un link para restablecer tu contraseña
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-3 rounded-xl bg-[#a0f000]/10 border border-[#a0f000]/30 text-[#a0f000] text-sm text-center">
              {message}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                    className="input-modern w-full !pl-12"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                {loading ? "Enviando..." : (<>Enviar link <FiArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            <Link to="/login" className="text-[#a0f000] hover:text-[#8cd000] font-medium">
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
