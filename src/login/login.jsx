// Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../auth/auth.context";
import { colores } from "../colores"; // Asegúrate de ajustar la ruta

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
      const { access_token } = data;
      try {
        const decoded = jwt_decode(access_token);
        if (decoded.exp * 1000 < Date.now()) {
          setError("El token ha expirado.");
          return;
        }
      } catch (err) {
        console.error("Error decodificando el token", err);
      }
      // Actualiza el contexto de autenticación
      login(access_token);
      if (onLoginSuccess) onLoginSuccess(access_token);
      navigate("/");
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
      const { access_token } = data;
      login(access_token);
      if (onLoginSuccess) onLoginSuccess(access_token);
      navigate("/");
    } catch (err) {
      console.error("Error en Google login:", err);
      setError("Error al iniciar sesión con Google");
    }
  };

  const handleGoogleLoginError = () => {
    setError("Error al iniciar sesión con Google");
  };

  return (
    <div
      className="login-container max-w-md mx-auto p-6 rounded shadow-md"
      style={{ backgroundColor: colores.fondoPrincipal }}
    >
      <h2
        className="text-2xl font-bold mb-4 text-center uppercase tracking-wide"
        style={{ color: colores.acento }}
      >
        Iniciar Sesión
      </h2>
      {error && <p className="mb-4" style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1" style={{ color: colores.acento }}>
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <label htmlFor="password" className="block mb-1" style={{ color: colores.acento }}>
            Contraseña:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
          Ingresar
        </button>
      </form>
      <div className="mt-4">
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
        />
      </div>
      <p className="mt-4 text-center">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          style={{ color: colores.link, textDecoration: "underline" }}
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
};

export default Login;
