// Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../auth/auth.context";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

const apiUrl = import.meta.env.VITE_API_URL;

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        const errorMessage = await response.text();
        setError(errorMessage);
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
        const errorMsg = await response.text();
        setError(errorMsg);
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
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
