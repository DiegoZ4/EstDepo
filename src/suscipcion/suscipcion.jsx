import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/auth.context";
import {
  initiateSubscription,
  getSubscriptionStatus,
  cancelSubscription,
  reactivateSubscription,
} from "../services/subscriptionService";
import { FiCheck, FiX, FiCreditCard, FiShield, FiStar, FiMail, FiArrowLeft, FiAlertTriangle } from "react-icons/fi";

const Suscripcion = () => {
  const { isAuthenticated, refreshSubscription } = useContext(AuthContext);
  const navigate = useNavigate();

  const [subscriptionStatus, setSubscriptionStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadSubscriptionStatus();
    else setLoading(false);
  }, [isAuthenticated]);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionStatus();
      setSubscriptionStatus(data.status || "none");
    } catch (err) {
      console.error("Error cargando estado:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!payerEmail || !payerEmail.includes("@")) {
      setError("Ingresá un email válido de Mercado Pago.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const data = await initiateSubscription(payerEmail.trim());
      if (data.init_point) window.location.href = data.init_point;
      else setError("No se pudo obtener el enlace de pago.");
    } catch (err) {
      setError(err.message || "Error al iniciar la suscripción.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    setProcessing(true);
    setError(null);
    try {
      const result = await cancelSubscription();
      setSubscriptionStatus("cancelled");
      if (result.message) {
        setSuccess(result.message);
      } else {
        setSuccess("Suscripción cancelada correctamente.");
      }
      setShowCancelModal(false);
      if (refreshSubscription) refreshSubscription();
    } catch (err) {
      setError(err.message || "Error al cancelar la suscripción.");
      setShowCancelModal(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivate = async () => {
    setProcessing(true);
    try {
      await reactivateSubscription();
      setSubscriptionStatus("authorized");
      setSuccess("¡Suscripción reactivada!");
      if (refreshSubscription) refreshSubscription();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const features = [
    "Tabla de posiciones completa",
    "Ranking de goleadores",
    "Fixture completo (todas las fechas)",
    "Detalle de goles por partido",
  ];

  return (
    <>
    <div className="max-w-md mx-auto py-10 px-4 animate-fade-up">

      {/* Error / Success */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><FiX className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}><FiX className="w-4 h-4" /></button>
        </div>
      )}

      {/* Card */}
      <div className="glass-card p-8 text-center border-[#a0f000]/20">
        <div className="inline-flex items-center gap-2 bg-[#a0f000]/10 text-[#a0f000] text-xs font-bold px-3 py-1 rounded-full mb-4">
          <FiStar className="w-3.5 h-3.5" />
          PREMIUM
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">EstDepo Premium</h1>
        <p className="text-gray-400 text-sm mb-6">Accedé a todo el contenido</p>

        <div className="flex items-end justify-center gap-1 mb-6">
          <span className="text-4xl font-black text-white">$2.000</span>
          <span className="text-gray-400 pb-1">/mes</span>
        </div>

        {/* Features */}
        <ul className="text-left space-y-3 mb-8">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
              <FiCheck className="text-[#a0f000] flex-shrink-0 w-4 h-4" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {!isAuthenticated ? (
          <button
            onClick={() => navigate("/login")}
            className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            Iniciá sesión para suscribirte
          </button>
        ) : (subscriptionStatus === "authorized" || subscriptionStatus === "active") ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-[#a0f000] font-semibold text-sm py-2">
              <FiCheck className="w-5 h-5" /> Plan activo
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={processing}
              className="btn-danger w-full py-2.5 text-sm"
            >
              Cancelar suscripción
            </button>
          </div>
        ) : subscriptionStatus === "paused" ? (
          <div className="space-y-3">
            <p className="text-yellow-400 text-sm">⏸ Suscripción en pausa</p>
            <button
              onClick={handleReactivate}
              disabled={processing}
              className="btn-primary w-full py-3 text-sm font-bold"
            >
              {processing ? "Procesando..." : "Reactivar"}
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={processing}
              className="btn-danger w-full py-2.5 text-sm"
            >
              Cancelar definitivamente
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setShowEmailForm(true)}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              Suscribirse con Mercado Pago
              <FiCreditCard className="w-4 h-4" />
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-gray-700/50 w-full" />
              <span className="bg-transparent px-3 text-gray-500 text-xs absolute">o</span>
            </div>

            <button
              onClick={() => {
                setShowEmailForm(true);
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-300 border border-gray-600/50 hover:border-[#a0f000]/30 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <FiCreditCard className="w-4 h-4" />
              Pagar con tarjeta de crédito/débito
            </button>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
              <FiShield className="w-3 h-3" />
              Pago seguro · Cancelás cuando quieras
            </div>
          </div>
        )}
      </div>
      {/* FAQ */}
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 text-center">Preguntas frecuentes</h3>
        {[
          {
            q: "¿Es seguro ingresar mis datos de pago?",
            a: "Totalmente seguro. Mercado Pago renderiza un formulario de pago certificado dentro de nuestro sitio (iframe seguro). Tus datos de tarjeta van directo a los servidores de Mercado Pago, nunca pasan por nuestro servidor. Contamos con los más altos estándares de seguridad PCI-DSS."
          },
          {
            q: "¿Por qué me piden el email de Mercado Pago?",
            a: "Mercado Pago requiere que indiquemos el email de la cuenta que va a realizar el pago para crear la suscripción. Esto asegura que el cobro se haga correctamente a la cuenta correcta."
          },
          {
            q: "¿Puedo cancelar cuando quiera?",
            a: "Sí, podés cancelar tu suscripción en cualquier momento desde esta misma página. Sin compromisos ni permanencia."
          },
          {
            q: "¿Qué métodos de pago acepta?",
            a: "Podés pagar con tarjeta de crédito, débito o saldo de tu cuenta de Mercado Pago."
          },
        ].map((faq, i) => (
          <details
            key={i}
            className="group glass-card-sm overflow-hidden"
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-300 flex items-center justify-between hover:text-white transition-colors">
              {faq.q}
              <span className="text-[#a0f000] text-lg group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <div className="px-4 pb-3 text-xs text-gray-400 leading-relaxed">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>

      {/* Modal de Email */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEmailForm(false)}>
          <div className="glass-card p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto border-[#a0f000]/20 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowEmailForm(false)}
              className="text-gray-400 hover:text-white mb-4 inline-flex items-center gap-1 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" /> Volver
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex p-3 rounded-xl bg-[#a0f000]/10 text-[#a0f000] mb-3">
                <FiMail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Email de Mercado Pago</h3>
              <p className="text-gray-400 text-xs">
                Ingresá el email de la cuenta de Mercado Pago con la que se va a realizar el pago.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <input
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                placeholder="ejemplo@email.com"
                className="input-modern w-full"
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                    Redirigiendo a MP...
                  </>
                ) : (
                  <>
                    Continuar con Mercado Pago
                    <FiCreditCard className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-3">
              <FiShield className="w-3 h-3" />
              Pago seguro · Cancelás cuando quieras
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div 
            className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border-red-500/20 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-xl bg-red-500/10 text-red-400 mb-3">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cancelar Suscripción</h3>
              <div className="text-xs text-gray-400 space-y-2 text-left bg-white/5 rounded-lg p-4">
                <p className="flex items-start gap-2">
                  <span className="text-[#a0f000] mt-0.5">•</span>
                  <span>Si cancelás <strong className="text-white">antes de 10 días</strong> desde tu suscripción, se cancela inmediatamente y se te reembolsa el pago.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#a0f000] mt-0.5">•</span>
                  <span>Si cancelás <strong className="text-white">después de 10 días</strong>, mantenés acceso premium hasta el final del período actual.</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCancel}
                disabled={processing}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FiX className="w-4 h-4" />
                    Confirmar cancelación
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCancelModal(false)}
                disabled={processing}
                className="w-full py-2.5 text-sm text-gray-400 hover:text-white transition"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Suscripcion;
