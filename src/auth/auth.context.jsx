import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { refreshToken as refreshTokenService } from "../services/apiService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Función para verificar y refrescar el token automáticamente
  const checkTokenValidity = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return false;

    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // Si el token expira en los próximos 5 minutos, refrescarlo
      if (decoded.exp - currentTime < 300) {
        console.log("Token expiring soon, refreshing automatically...");
        const newToken = await refreshTokenService();
        const newDecoded = jwt_decode(newToken);
        setUser(newDecoded);
        setIsAuthenticated(true);
        return true;
      }
      
      // Si el token es válido
      setUser(decoded);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Error checking token validity:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    checkTokenValidity();
    
    // Configurar un intervalo para verificar el token cada 4 minutos
    const interval = setInterval(checkTokenValidity, 4 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const login = (token, refreshToken = null) => {
    localStorage.setItem("access_token", token);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    
    try {
      const decoded = jwt_decode(token);
      setUser(decoded);
      setIsAuthenticated(true);
      window.location.reload();
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      checkTokenValidity 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
