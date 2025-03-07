// ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import * as jwtDecode from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;

const ProtectedRoute = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/register" replace />;
  }

  
  

  // Si no hay token, redirige a /register (o a /login)
  return token ? <Outlet /> : <Navigate to="/register" replace />;
};

export default ProtectedRoute;
