// Ejemplo de cómo usar el nuevo servicio de API con refresh automático de tokens
// Puedes aplicar esto a todos tus componentes que hacen llamadas a la API

import { apiRequest } from "../services/apiService";

// En lugar de usar fetch directamente, usa apiRequest:

// ANTES:
// const token = localStorage.getItem("access_token");
// const res = await fetch(`${apiUrl}/torneo/${torneoId}`, {
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: token ? `Bearer ${token}` : "",
//   },
// });

// DESPUÉS:
const res = await apiRequest(`/torneo/${torneoId}`);

// Para llamadas POST:
const res = await apiRequest('/partido', {
  method: 'POST',
  body: JSON.stringify(data)
});

// Para llamadas PUT:
const res = await apiRequest(`/equipo/${id}`, {
  method: 'PUT',
  body: JSON.stringify(updateData)
});

// Para llamadas DELETE:
const res = await apiRequest(`/jugador/${id}`, {
  method: 'DELETE'
});

// Ventajas del nuevo sistema:
// 1. Manejo automático de refresh de tokens
// 2. No necesitas pasar manualmente el token en cada llamada
// 3. Si el token expira, se refresca automáticamente
// 4. Si el refresh falla, redirige automáticamente al login
// 5. Código más limpio y consistente
