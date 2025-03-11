// Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { colores } from "../colores"; // Ajusta la ruta según tu estructura

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
      // Registro exitoso: redirige a login
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
    <div
      className="max-w-md mx-auto p-6 rounded shadow-md"
      style={{ backgroundColor: colores.fondoPrincipal }}
    >
      <h2
        className="text-2xl font-bold mb-4 text-center uppercase tracking-wide"
        style={{ color: colores.acento }}
      >
        Registro de Usuario
      </h2>
      {error && <p className="mb-4" style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block mb-1"
            style={{ color: colores.acento }}
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colores.inputBg,
              borderColor: colores.acento,
              color: colores.texto,
            }}
          />
        </div>
        <div>
          <label
            htmlFor="nombre"
            className="block mb-1"
            style={{ color: colores.acento }}
          >
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colores.inputBg,
              borderColor: colores.acento,
              color: colores.texto,
            }}
          />
        </div>
        <div>
          <label
            htmlFor="contraseña"
            className="block mb-1"
            style={{ color: colores.acento }}
          >
            Contraseña:
          </label>
          <input
            type="password"
            id="contraseña"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colores.inputBg,
              borderColor: colores.acento,
              color: colores.texto,
            }}
          />
        </div>
        <div>
          <label
            htmlFor="rol"
            className="block mb-1"
            style={{ color: colores.acento }}
          >
            Rol:
          </label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colores.inputBg,
              borderColor: colores.acento,
              color: colores.texto,
            }}
          >
            <option value="freeUser">freeUser</option>
            <option value="SubsUser">SubsUser</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="nacimiento"
            className="block mb-1"
            style={{ color: colores.acento }}
          >
            Fecha de Nacimiento:
          </label>
          <input
            type="date"
            id="nacimiento"
            name="bornDate"
            value={formData.bornDate}
            onChange={handleInputChange}
            className="w-full p-2 rounded border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colores.inputBg,
              borderColor: colores.acento,
              color: colores.texto,
            }}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded transition"
          style={{
            backgroundColor: colores.buttonBg,
            color: "black",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = colores.buttonHover)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = colores.buttonBg)
          }
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
        <Link
          to="/login"
          style={{ color: colores.link, textDecoration: "underline" }}
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
};

export default Register;
