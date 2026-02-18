import { useEffect, useContext, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/auth.context";
import { getSubscriptionStatus } from "../services/subscriptionService";
import { FiCheckCircle, FiXCircle, FiClock, FiArrowRight } from "react-icons/fi";

const SuscripcionResultado = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription } = useContext(AuthContext);

  const [status, setStatus] = useState("loading"); // loading | success | pending | error
  const [message, setMessage] = useState("");

  const checkResult = useCallback(async () => {
    // Mercado Pago puede enviar parámetros como preapproval_id, status, etc.
    const mpStatus = searchParams.get("status");

    // Delay más largo para dar tiempo al webhook de MP
    await new Promise((r) => setTimeout(r, 4000));

    try {
      const data = await getSubscriptionStatus();

      // Verificar si la suscripción está activa (backend devuelve "active" o is_premium = true)
      if (data.is_premium || data.status === "active" || data.status === "authorized" || mpStatus === "authorized") {
        setStatus("success");
        setMessage("¡Tu suscripción Premium está activa!");
        if (refreshSubscription) refreshSubscription();
      } else if (data.status === "pending" || mpStatus === "pending") {
        setStatus("pending");
        setMessage("Tu pago está siendo procesado. Te avisaremos cuando esté listo.");
      } else {
        setStatus("error");
        setMessage("No se pudo completar la suscripción. Intentá de nuevo.");
      }
    } catch (err) {
      console.error("Error verificando suscripción:", err);
      // Si no puede consultar el backend, usamos el status de los query params
      if (mpStatus === "authorized") {
        setStatus("success");
        setMessage("¡Tu suscripción Premium está activa!");
        if (refreshSubscription) refreshSubscription();
      } else if (mpStatus === "pending") {
        setStatus("pending");
        setMessage("Tu pago está siendo procesado.");
      } else {
        setStatus("error");
        setMessage("No se pudo verificar el estado del pago.");
      }
    }
  }, [searchParams, refreshSubscription]);

  useEffect(() => {
    checkResult();
  }, [checkResult]);

  const configs = {
    loading: {
      icon: <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-[#a0f000]" />,
      color: "text-gray-400",
      bg: "border-gray-700/50",
      title: "Verificando tu pago...",
    },
    success: {
      icon: <FiCheckCircle className="w-16 h-16 text-[#a0f000]" />,
      color: "text-[#a0f000]",
      bg: "border-[#a0f000]/30 shadow-[0_0_60px_rgba(160,240,0,0.1)]",
      title: "¡Bienvenido a Premium!",
    },
    pending: {
      icon: <FiClock className="w-16 h-16 text-yellow-400" />,
      color: "text-yellow-400",
      bg: "border-yellow-500/30",
      title: "Pago en proceso",
    },
    error: {
      icon: <FiXCircle className="w-16 h-16 text-red-400" />,
      color: "text-red-400",
      bg: "border-red-500/30",
      title: "Algo salió mal",
    },
  };

  const config = configs[status];

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div
        className={`animate-fade-up max-w-md w-full rounded-3xl p-10 border-2 text-center space-y-6 ${config.bg}`}
        style={{ background: "linear-gradient(180deg, #1a3a3a 0%, #0f2424 100%)" }}
      >
        <div className="flex justify-center">{config.icon}</div>

        <h1 className={`text-2xl font-bold ${config.color}`}>{config.title}</h1>

        <p className="text-gray-400 text-sm leading-relaxed">{message}</p>

        <div className="pt-4 space-y-3">
          {status === "success" && (
            <button
              onClick={() => navigate("/")}
              className="group w-full py-3 rounded-xl font-bold text-black bg-[#a0f000] hover:bg-[#8cd000] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              Empezar a disfrutar
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {status === "pending" && (
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl font-bold text-white border border-gray-600 hover:border-gray-400 transition-all"
            >
              Volver al inicio
            </button>
          )}

          {status === "error" && (
            <>
              <button
                onClick={() => navigate("/suscipcion")}
                className="group w-full py-3 rounded-xl font-bold text-black bg-[#a0f000] hover:bg-[#8cd000] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                Intentar de nuevo
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl font-bold text-gray-400 border border-gray-700 hover:border-gray-500 transition-all"
              >
                Volver al inicio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuscripcionResultado;
