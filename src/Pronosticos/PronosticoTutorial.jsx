import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiTarget, FiBarChart2 } from "react-icons/fi";
import { getCookie, setCookie } from "../utils/cookies";

const COOKIE_KEY = "est_pronostico_tut";

// Modal que explica el sistema de pronósticos. Aparece una sola vez:
// al cerrarlo o saltarlo se guarda en una cookie para no volver a mostrarlo.
const PronosticoTutorial = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_KEY)) {
      setOpen(true);
    }
  }, []);

  const cerrar = () => {
    setCookie(COOKIE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={cerrar}
    >
      <div
        className="glass-card max-w-md w-full p-6 pt-7 relative animate-fade-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={cerrar}
          className="absolute top-3 right-3 text-gray-500 hover:text-white"
          aria-label="Cerrar"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gradient-accent leading-relaxed py-0.5 mb-1 pr-8">¡Nuevo! Pronósticos</h3>
        <p className="text-sm text-gray-400 mb-5">
          Decí quién pensás que va a ganar y mirá qué opina el resto de la comunidad.
        </p>

        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#a0f000]/15 text-[#a0f000]">
              <FiTarget className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Elegí tu favorito</p>
              <p className="text-xs text-gray-400">
                Tocá un partido para abrirlo y elegí el equipo que creés que gana. Podés cambiar tu voto cuando quieras antes de que empiece.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-400/15 text-blue-300">
              <FiBarChart2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Mirá los porcentajes</p>
              <p className="text-xs text-gray-400">
                La barra muestra en vivo cuánta gente banca a cada equipo.
              </p>
            </div>
          </li>
        </ul>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={cerrar} className="text-sm text-gray-400 hover:text-white px-3 py-2">
            Saltar
          </button>
          <button onClick={cerrar} className="btn-primary px-5 py-2 text-sm">
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PronosticoTutorial;
