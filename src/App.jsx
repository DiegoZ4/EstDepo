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
        <div className="min-h-screen bg-page-gradient text-white flex flex-col">
          <Navbar />
          <main className="flex-1 mt-16">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
              </div>
            }>
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
          <footer className="border-t border-gray-700/40 bg-black/20 backdrop-blur-sm text-center py-6 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} <span className="text-[#a0f000] font-semibold">EstDepo</span>. Todos los derechos reservados.</p>
          </footer>
        </div>
      </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
