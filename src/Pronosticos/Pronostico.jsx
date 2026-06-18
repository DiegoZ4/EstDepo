import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { FiLock, FiArrowRight, FiX, FiCheck } from "react-icons/fi";
import {
  getResumenPronostico,
  getMiPronostico,
  votarPronostico,
  borrarPronostico,
} from "./pronosticoService";

// Saca el id del equipo elegido de la respuesta de /mio, sea cual sea su forma.
const extraerVotoId = (mio) =>
  mio?.equipoElegido?.id ?? mio?.equipoElegidoId ?? mio?.equipoElegido ?? null;

const Pronostico = ({ partido, isSubscribed }) => {
  const token = localStorage.getItem("access_token");
  const localId = partido?.equipoLocal?.id;
  const visitanteId = partido?.equipoVisitante?.id;

  // El partido ya no admite votos si arrancó o no está pendiente.
  const yaEmpezo =
    (partido?.date && new Date(partido.date) <= new Date()) ||
    (partido?.estado && partido.estado !== "Pendiente");

  const [resumen, setResumen] = useState(null);
  const [miVotoId, setMiVotoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showSubPrompt, setShowSubPrompt] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [res, mio] = await Promise.all([
        getResumenPronostico(partido.id),
        getMiPronostico(partido.id),
      ]);
      setResumen(res);
      setMiVotoId(extraerVotoId(mio));
    } catch (e) {
      setError("No se pudieron cargar los pronósticos");
    } finally {
      setLoading(false);
    }
  }, [partido.id, token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleVote = async (equipoId) => {
    if (yaEmpezo || voting) return;
    if (!isSubscribed) {
      setShowSubPrompt(true);
      return;
    }
    setVoting(true);
    setError(null);
    const prev = miVotoId;
    setMiVotoId(equipoId); // optimista
    try {
      await votarPronostico(partido.id, equipoId);
      const res = await getResumenPronostico(partido.id);
      setResumen(res);
    } catch (e) {
      setMiVotoId(prev);
      setError(e.message || "No se pudo registrar el voto");
    } finally {
      setVoting(false);
    }
  };

  const handleRemove = async () => {
    if (yaEmpezo || voting) return;
    setVoting(true);
    setError(null);
    const prev = miVotoId;
    setMiVotoId(null);
    try {
      await borrarPronostico(partido.id);
      const res = await getResumenPronostico(partido.id);
      setResumen(res);
    } catch (e) {
      setMiVotoId(prev);
      setError(e.message || "No se pudo borrar el voto");
    } finally {
      setVoting(false);
    }
  };

  // Sin sesión: invitamos a entrar (los endpoints requieren JWT).
  if (!token) {
    return (
      <div className="glass-card-sm p-4 text-center">
        <p className="text-sm text-gray-300 mb-2">¿Quién pensás que va a ganar?</p>
        <NavLink
          to="/login"
          className="text-[#a0f000] text-sm hover:underline inline-flex items-center gap-1"
        >
          Iniciá sesión para votar <FiArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card-sm p-4 flex justify-center">
        <div className="w-5 h-5 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const localPct = resumen?.local?.porcentaje ?? 0;
  const visitantePct = resumen?.visitante?.porcentaje ?? 0;
  const localVotos = resumen?.local?.votos ?? 0;
  const visitanteVotos = resumen?.visitante?.votos ?? 0;
  const totalVotos = resumen?.totalVotos ?? 0;

  const TeamButton = ({ equipoId, equipo, alineacion }) => {
    const elegido = miVotoId != null && miVotoId === equipoId;
    return (
      <button
        type="button"
        onClick={() => handleVote(equipoId)}
        disabled={yaEmpezo || voting}
        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          alineacion === "right" ? "flex-row-reverse text-right" : ""
        } ${
          elegido
            ? "bg-[#a0f000]/15 border-[#a0f000]/50 text-[#a0f000]"
            : "border-gray-700/40 text-gray-300 hover:border-[#a0f000]/30 hover:text-white"
        } ${yaEmpezo ? "cursor-default opacity-80" : "cursor-pointer"}`}
      >
        {equipo?.image && (
          <img src={equipo.image} alt={equipo.name} className="h-7 w-7 object-contain" />
        )}
        <span className="text-xs font-medium truncate flex-1">{equipo?.name}</span>
        {elegido && <FiCheck className="w-4 h-4 flex-shrink-0" />}
      </button>
    );
  };

  return (
    <div className="glass-card-sm p-3 md:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[#a0f000] font-semibold text-sm">
          {yaEmpezo ? "Pronóstico de la comunidad" : "¿Quién va a ganar?"}
        </h4>
        {miVotoId != null && !yaEmpezo && (
          <button
            onClick={handleRemove}
            disabled={voting}
            className="text-xs text-gray-500 hover:text-red-400 inline-flex items-center gap-1"
          >
            <FiX className="w-3 h-3" /> Quitar voto
          </button>
        )}
      </div>

      {/* Botones para elegir favorito */}
      <div className="flex items-stretch gap-2">
        <TeamButton equipoId={localId} equipo={partido.equipoLocal} alineacion="left" />
        <TeamButton equipoId={visitanteId} equipo={partido.equipoVisitante} alineacion="right" />
      </div>

      {/* Barra de porcentajes */}
      <div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-700/40">
          <div
            className="bg-[#a0f000] transition-all duration-500"
            style={{ width: `${localPct}%` }}
          />
          <div
            className="bg-blue-400 transition-all duration-500"
            style={{ width: `${visitantePct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-[#a0f000] font-semibold">
            {localPct}% <span className="text-gray-500 font-normal">({localVotos})</span>
          </span>
          <span className="text-gray-500">{totalVotos} votos</span>
          <span className="text-blue-300 font-semibold">
            <span className="text-gray-500 font-normal">({visitanteVotos})</span> {visitantePct}%
          </span>
        </div>
      </div>

      {yaEmpezo && (
        <p className="text-xs text-gray-500 text-center">Pronósticos cerrados — el partido ya comenzó.</p>
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      {/* Aviso de suscripción para quien no es sub */}
      {showSubPrompt && !isSubscribed && (
        <div className="rounded-lg bg-[#a0f000]/10 border border-[#a0f000]/30 p-3 text-center animate-fade-in">
          <FiLock className="mx-auto text-[#a0f000] mb-1 w-5 h-5" />
          <p className="text-sm text-gray-200 mb-2">Suscribite para votar tu pronóstico</p>
          <div className="flex items-center justify-center gap-3">
            <NavLink
              to="/suscipcion"
              className="text-[#a0f000] text-sm hover:underline inline-flex items-center gap-1"
            >
              Ver planes <FiArrowRight className="w-3.5 h-3.5" />
            </NavLink>
            <button
              onClick={() => setShowSubPrompt(false)}
              className="text-gray-500 text-sm hover:text-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pronostico;
