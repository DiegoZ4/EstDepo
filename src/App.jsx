import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./navbar/navbar";
import AppRoutes from "./AppRoutes";
import ProtectedRoute from "./auth/ProtectedRoute";
import Register from "./register/register";
import Login from "./login/login";
import "./index.css"; // CSS de Tailwind
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./auth/auth.context";

const App = () => {
const apiKey = import.meta.env.VITE_API_KEY


  return (
    <GoogleOAuthProvider clientId={apiKey}>
       <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#141414] text-white flex flex-col">
          <Navbar />
          <main className="flex-1 mt-16">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                {/* Rutas públicas o de acceso libre */}
                <Route path="/" element={<AppRoutes />} />
                
                {/* Rutas protegidas */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/*" element={<AppRoutes />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
          <footer className="bg-[#003c3c] text-center py-4 text-sm text-gray-300">
            © {new Date().getFullYear()} Est Depo. Todos los derechos reservados.
          </footer>
        </div>
      </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
