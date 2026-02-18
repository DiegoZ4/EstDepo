import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { refreshToken as refreshTokenService } from "../services/apiService";
import { getSubscriptionStatus } from "../services/subscriptionService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("none");

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
        // Admin users get automatic premium access
        if (newDecoded.rol === "admin") {
          setIsSubscribed(true);
        }
        // Cargar estado de suscripción
        loadSubscription();
        return true;
      }
      
      // Si el token es válido
      setUser(decoded);
      setIsAuthenticated(true);
      // Admin users get automatic premium access
      if (decoded.rol === "admin") {
        setIsSubscribed(true);
      }
      // Cargar estado de suscripción
      loadSubscription();
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

  const loadSubscription = async () => {
    try {
      const data = await getSubscriptionStatus();
      const status = data.status || "none";
      setSubscriptionStatus(status);
      // Admin users get automatic premium access
      const token = localStorage.getItem("access_token");
      const decoded = token ? jwt_decode(token) : null;
      const isAdmin = decoded?.rol === "admin";
      // El backend puede devolver "active" o "authorized"
      setIsSubscribed(isAdmin || status === "authorized" || status === "active" || data.is_premium === true);
    } catch (err) {
      console.error("Error cargando suscripción:", err);
      // Check if user is admin even if subscription check fails
      const token = localStorage.getItem("access_token");
      const decoded = token ? jwt_decode(token) : null;
      const isAdmin = decoded?.rol === "admin";
      setIsSubscribed(isAdmin);
      setSubscriptionStatus("none");
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
      checkTokenValidity,
      isSubscribed,
      subscriptionStatus,
      refreshSubscription: loadSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};
