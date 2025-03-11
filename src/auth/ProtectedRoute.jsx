import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import jwtDecode from "jwt-decode";

const ProtectedRoute = () => {
  const token = localStorage.getItem("access_token");

  // Si no existe token, redirige
  if (!token) {
    return <Navigate to="/register" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    // jwt exp se define en segundos; se multiplica por 1000 para compararlo con Date.now() (milisegundos)
    if (decoded.exp * 1000 < Date.now()) {
      // Token expirado: eliminarlo y redirigir
      localStorage.removeItem("access_token");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // Token inválido: eliminarlo y redirigir
    localStorage.removeItem("access_token");
    return <Navigate to="/login" replace />;
  }

  // Si el token es válido, renderizamos el componente anidado
  return <Outlet />;
};

export default ProtectedRoute;
