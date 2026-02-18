// Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FiUserPlus, FiMail, FiLock, FiUser, FiCalendar, FiArrowRight } from "react-icons/fi";

const apiUrl = import.meta.env.VITE_API_URL;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    rol: "freeUser",
    bornDate: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        setError(errorMessage);
        return;
      }
      navigate("/login");
    } catch (err) {
      console.error("Error en el registro:", err);
      setError("Error al registrarse. Intenta de nuevo.");
    }
  };

  const handleGoogleRegisterSuccess = async (credentialResponse) => {
    setError("");
    try {
      const response = await fetch(`${apiUrl}/auth/google/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      if (!response.ok) {
        const errorMsg = await response.text();
        setError(errorMsg);
        return;
      }
      navigate("/login");
    } catch (err) {
      console.error("Error en registro con Google:", err);
      setError("Error al registrarse con Google");
    }
  };

  const handleGoogleRegisterError = () => {
    setError("Error al registrarse con Google");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[#a0f000]/10 mb-4">
              <FiUserPlus className="w-6 h-6 text-[#a0f000]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Crear Cuenta</h2>
            <p className="text-gray-400 text-sm mt-1">Unite a la comunidad de EstDepo</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="tu@email.com"
                  className="input-modern w-full !pl-12"
                />
              </div>
            </div>
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1.5">
                Nombre
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  id="nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu nombre"
                  className="input-modern w-full !pl-12"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contraseña" className="block text-sm font-medium text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  id="contraseña"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="input-modern w-full !pl-12"
                />
              </div>
            </div>
            <div>
              <label htmlFor="nacimiento" className="block text-sm font-medium text-gray-300 mb-1.5">
                Fecha de Nacimiento
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  id="nacimiento"
                  name="bornDate"
                  value={formData.bornDate}
                  onChange={handleInputChange}
                  className="input-modern w-full !pl-12"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              Registrarse <FiArrowRight className="w-4 h-4" />
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
              onSuccess={handleGoogleRegisterSuccess}
              onError={handleGoogleRegisterError}
            />
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-[#a0f000] hover:text-[#8cd000] font-medium">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
