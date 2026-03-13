// Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../auth/auth.context";
import { FiMail, FiLock, FiArrowRight, FiX } from "react-icons/fi";

const apiUrl = import.meta.env.VITE_API_URL;

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(errorData.message || "Credenciales inválidas");
        } catch {
          setError("Credenciales inválidas");
        }
        return;
      }
      const data = await response.json();
      const { access_token, refresh_token } = data;
      
      try {
        const decoded = jwt_decode(access_token);
        if (decoded.exp * 1000 < Date.now()) {
          setError("El token ha expirado.");
          return;
        }
      } catch (err) {
        console.error("Error decodificando el token", err);
      }
      
      localStorage.setItem("access_token", access_token);
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }
      
      login(access_token, refresh_token);
      if (onLoginSuccess) onLoginSuccess(access_token);
      
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Error en el login:", err);
      setError("Error al iniciar sesión. Intenta de nuevo.");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setError("");
    try {
      const response = await fetch(`${apiUrl}/auth/google/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(errorData.message || "Error al iniciar sesión con Google");
        } catch {
          setError("Error al iniciar sesión con Google");
        }
        return;
      }
      const data = await response.json();
      const { access_token, refresh_token } = data;
      
      localStorage.setItem("access_token", access_token);
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }
      
      login(access_token, refresh_token);
      if (onLoginSuccess) onLoginSuccess(access_token);
      navigate("/");
      window.location.reload();

    } catch (err) {
      console.error("Error en Google login:", err);
      setError("Error al iniciar sesión con Google");
    }
  };

  const handleGoogleLoginError = () => {
    setError("Error al iniciar sesión con Google");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setForgotLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!response.ok) {
        try {
          const data = await response.json();
          setForgotError(data.message || "Error al enviar el correo.");
        } catch {
          setForgotError("Error al enviar el correo.");
        }
      } else {
        setForgotMessage("Te enviamos un correo con el link para restablecer tu contraseña.");
      }
    } catch {
      setForgotError("Error de conexión. Intenta de nuevo.");
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email);
    setForgotMessage("");
    setForgotError("");
    setForgotModal(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Modal olvidé contraseña */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Recuperar contraseña</h3>
              <button onClick={() => setForgotModal(false)} className="p-1 text-gray-400 hover:text-white transition">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
            </p>
            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {forgotError}
              </div>
            )}
            {forgotMessage ? (
              <div className="p-3 rounded-xl bg-[#a0f000]/10 border border-[#a0f000]/30 text-[#a0f000] text-sm text-center">
                {forgotMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                    className="input-modern w-full !pl-12"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {forgotLoading ? "Enviando..." : (<>Enviar link <FiArrowRight className="w-4 h-4" /></>)}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="w-full max-w-md animate-fade-up">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[#a0f000]/10 mb-4">
              <FiLock className="w-6 h-6 text-[#a0f000]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Iniciar Sesión</h2>
            <p className="text-gray-400 text-sm mt-1">Accedé a tu cuenta de EstDepo</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="input-modern w-full !pl-12"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-modern w-full !pl-12"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              Ingresar <FiArrowRight className="w-4 h-4" />
            </button>
            <div className="text-right">
              <button
                type="button"
                onClick={openForgotModal}
                className="text-xs text-gray-400 hover:text-[#a0f000] transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-700/50" />
            <span className="text-xs text-gray-500">o continuar con</span>
            <div className="flex-1 h-px bg-gray-700/50" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-[#a0f000] hover:text-[#8cd000] font-medium">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
