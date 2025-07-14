import jwt_decode from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;

// Función para refrescar el token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    const { access_token, refresh_token: newRefreshToken } = data;
    
    // Actualizar tokens en localStorage
    localStorage.setItem("access_token", access_token);
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken);
    }
    
    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Si falla el refresh, limpiar tokens y redirigir al login
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    throw error;
  }
};

// Función para verificar si el token ha expirado y refrescarlo si es necesario
const getValidToken = async () => {
  try {
    let token = localStorage.getItem("access_token");
    
    if (!token) {
      throw new Error("No access token available");
    }

    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    // Si el token expira en los próximos 5 minutos, refrescarlo
    if (decoded.exp - currentTime < 300) {
      console.log("Token expiring soon, refreshing...");
      token = await refreshToken();
    }
    
    return token;
  } catch (err) {
    console.error("Error getting valid token:", err);
    // Intentar refrescar el token
    return await refreshToken();
  }
};

// Función wrapper para fetch con manejo automático de tokens
export const apiRequest = async (url, options = {}) => {
  try {
    const token = await getValidToken();
    
    const defaultHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(`${apiUrl}${url}`, config);
    
    // Si el token está expirado (401), intentar refrescar y reintentar una vez
    if (response.status === 401) {
      console.log("Token expired, refreshing and retrying...");
      const newToken = await refreshToken();
      
      config.headers.Authorization = `Bearer ${newToken}`;
      return await fetch(`${apiUrl}${url}`, config);
    }
    
    return response;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// Función para logout que limpia los tokens
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};

export { refreshToken, getValidToken };
