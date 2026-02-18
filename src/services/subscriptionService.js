import { apiRequest } from "./apiService";

/**
 * Iniciar suscripción — el backend crea un preapproval en MP
 * y devuelve { init_point, subscription_id }
 * El frontend redirige al usuario al init_point de MP
 */
export const initiateSubscription = async (email) => {
  const response = await apiRequest("/subscriptions/create", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al iniciar la suscripción");
  }

  return await response.json();
};

/**
 * Obtener el estado de la suscripción del usuario actual
 */
export const getSubscriptionStatus = async () => {
  try {
    const response = await apiRequest("/subscriptions/status", {
      method: "GET",
    });

    if (!response.ok) {
      return { status: "none", subscription: null };
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener estado de suscripción:", error);
    return { status: "none", subscription: null };
  }
};

/**
 * Cancelar la suscripción del usuario
 */
export const cancelSubscription = async () => {
  const response = await apiRequest("/subscriptions/cancel", {
    method: "PUT",
    body: JSON.stringify({ status: "cancelled" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al cancelar la suscripción");
  }

  return await response.json();
};

/**
 * Pausar la suscripción del usuario
 */
export const pauseSubscription = async () => {
  const response = await apiRequest("/subscriptions/cancel", {
    method: "PUT",
    body: JSON.stringify({ status: "paused" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al pausar la suscripción");
  }

  return await response.json();
};

/**
 * Reactivar una suscripción pausada
 */
export const reactivateSubscription = async () => {
  const response = await apiRequest("/subscriptions/reactivate", {
    method: "PUT",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al reactivar la suscripción");
  }

  return await response.json();
};
