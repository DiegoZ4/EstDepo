import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const apiUrl = import.meta.env.VITE_API_URL;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    rol: "freeUser", // Valor por defecto
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

      // Registro exitoso: redirige a la página de login
      navigate("/login");
    } catch (err) {
      console.error("Error en el registro:", err);
      setError("Error al registrarse. Intenta de nuevo.");
    }
  };

  // Función para manejar el registro con Google
  const handleGoogleRegisterSuccess = async (credentialResponse) => {
    setError("");
    try {
      // Envía el token de Google a tu backend
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
      // Registro con Google exitoso, redirige a login o directamente al home
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
    <div className="max-w-md mx-auto p-4 bg-gray-800 text-white rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro de Usuario</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="nombre" className="block mb-1">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="contraseña" className="block mb-1">Contraseña:</label>
          <input
            type="password"
            id="contraseña"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="rol" className="block mb-1">Rol:</label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="freeUser">freeUser</option>
            <option value="SubsUser">SubsUser</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="nacimiento" className="block mb-1">Fecha de Nacimiento:</label>
          <input
            type="date"
            id="nacimiento"
            name="bornDate"
            value={formData.bornDate}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded"
        >
          Registrarse
        </button>
      </form>

      <div className="mt-4">
      <GoogleLogin
  onSuccess={handleGoogleRegisterSuccess}
  onError={handleGoogleRegisterError}
/>

      </div>

      <p className="mt-4 text-center">
        ¿Ya tienes una cuenta?{" "}
        <Link to="/login" className="text-blue-400 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
};

export default Register;
