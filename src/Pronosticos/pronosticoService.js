import { apiRequest } from "../services/apiService";

// Resumen de votos + favorito de un partido.
// { partidoId, totalVotos, favoritoId, local:{...}, visitante:{...} }
export const getResumenPronostico = async (partidoId) => {
  const res = await apiRequest(`/pronosticos/partido/${partidoId}/resumen`, { method: "GET" });
  if (!res.ok) throw new Error("No se pudo cargar el resumen de pronósticos");
  return res.json();
};

// Mi voto en ese partido (o null si todavía no voté).
export const getMiPronostico = async (partidoId) => {
  const res = await apiRequest(`/pronosticos/partido/${partidoId}/mio`, { method: "GET" });
  if (!res.ok) return null;
  return res.json().catch(() => null);
};

// Voto o cambio de voto. Body: { partidoId, equipoElegidoId }
export const votarPronostico = async (partidoId, equipoElegidoId) => {
  const res = await apiRequest("/pronosticos", {
    method: "POST",
    body: JSON.stringify({ partidoId, equipoElegidoId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "No se pudo registrar el voto");
  }
  return res.json();
};

// Borro mi voto de ese partido.
export const borrarPronostico = async (partidoId) => {
  const res = await apiRequest(`/pronosticos/partido/${partidoId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo borrar el voto");
  return true;
};
