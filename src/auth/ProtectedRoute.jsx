// ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("access_token");
  // Si no hay token, redirige a /register (o a /login)
  return token ? <Outlet /> : <Navigate to="/register" replace />;
};

export default ProtectedRoute;
