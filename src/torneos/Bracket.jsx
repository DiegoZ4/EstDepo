import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/auth.context";

// ---- geometría del árbol (rem) ----
const MH = 3.4; // alto de cada card
const G0 = 0.5; // separación DENTRO de un par (1ª ronda)
const GP = 2.4; // separación ENTRE pares (1ª ronda)
const P0 = 2 * MH + G0 + GP; // "pitch" entre pares en la 1ª ronda

const pitchAt = (d) => (d <= 0 ? MH + G0 : P0 * 2 ** (d - 1));
const padAt = (d) => {
  if (d <= 0) return 0;
  let pad = MH / 2 + G0 / 2;
  for (let k = 2; k <= d; k++) pad += pitchAt(k - 1) / 2;
  return pad;
};
const marginBottomAt = (d, idx) => (d <= 0 ? (idx % 2 === 0 ? G0 : GP) : pitchAt(d) - MH);
const vLineHeightAt = (d) => (d <= 0 ? MH + G0 : pitchAt(d));

// "1A" -> "1º Grupo A" | "G-LL3" -> "Ganador llave 3"
const formatOrigen = (o) => {
  if (!o) return "A confirmar";
  let m = /^(\d+)([A-Za-z])$/.exec(o);
  if (m) return `${m[1]}º Grupo ${m[2].toUpperCase()}`;
  m = /^G-(?:LL|QF|SF)(\d+)$/i.exec(o);
  if (m) return `Ganador llave ${m[1]}`;
  return o;
};

const isFin = (p) => String(p?.estado || "").toLowerCase() === "finalizado";

const marcadorLlave = (partidos = []) => {
  const goles = {};
  const penales = {};
  let hayPenales = false;
  let algunoJugado = false;
  let todosFinalizados = partidos.length > 0;
  for (const p of partidos) {
    const localId = p.equipoLocal?.id ?? p.equipoLocalId;
    const visId = p.equipoVisitante?.id ?? p.equipoVisitanteId;
    const gl = Array.isArray(p.golesLocal) ? p.golesLocal.length : Number(p.golesLocal) || 0;
    const gv = Array.isArray(p.golesVisitante) ? p.golesVisitante.length : Number(p.golesVisitante) || 0;
    if (isFin(p)) algunoJugado = true;
    else todosFinalizados = false;
    if (localId != null) goles[localId] = (goles[localId] || 0) + gl;
    if (visId != null) goles[visId] = (goles[visId] || 0) + gv;
    if (p.golesLocalPenales != null || p.golesVisitantePenales != null) {
      hayPenales = true;
      if (localId != null) penales[localId] = Number(p.golesLocalPenales) || 0;
      if (visId != null) penales[visId] = Number(p.golesVisitantePenales) || 0;
    }
  }
  return { goles, penales, hayPenales, algunoJugado, todosFinalizados };
};

const Escudo = ({ equipo, origen }) =>
  equipo?.image ? (
    <img src={equipo.image} alt="" className="h-4 w-4 rounded-full object-contain flex-shrink-0 bg-white/10" />
  ) : (
    <span className="h-4 w-4 flex-shrink-0 rounded-full bg-white/10 text-[9px] font-bold text-gray-400 flex items-center justify-center">
      {(equipo?.name || origen || "?").trim().charAt(0).toUpperCase()}
    </span>
  );

const Fila = ({ equipo, origen, marcador, penal, estado }) => (
  <div className={`bkt-row ${estado}`}>
    <div className="flex items-center gap-1.5 min-w-0">
      <Escudo equipo={equipo} origen={origen} />
      <span className="truncate text-[12px]">{equipo?.name || formatOrigen(origen)}</span>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0 tabular-nums text-[12px]">
      {penal != null && <span className="text-[10px] opacity-70">({penal})</span>}
      <span className="w-3 text-right">{marcador != null ? marcador : ""}</span>
    </div>
  </div>
);

const TarjetaLlave = ({ llave, partidos, onClick }) => {
  const localId = llave.equipoLocal?.id ?? llave.equipoLocalId;
  const visId = llave.equipoVisitante?.id ?? llave.equipoVisitanteId;
  const { goles, penales, hayPenales, algunoJugado } = marcadorLlave(partidos);
  const resuelta = llave.ganadorEquipoId != null;
  const estadoDe = (id) => (resuelta && id != null ? (llave.ganadorEquipoId === id ? "gana" : "pierde") : "");

  return (
    <div
      className={`bkt-card${onClick ? " bkt-card--editable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Fila
        equipo={llave.equipoLocal}
        origen={llave.origenLocal}
        marcador={localId != null && algunoJugado ? goles[localId] ?? 0 : null}
        penal={hayPenales && localId != null ? penales[localId] : null}
        estado={estadoDe(localId)}
      />
      <div className="bkt-sep" />
      <Fila
        equipo={llave.equipoVisitante}
        origen={llave.origenVisitante}
        marcador={visId != null && algunoJugado ? goles[visId] ?? 0 : null}
        penal={hayPenales && visId != null ? penales[visId] : null}
        estado={estadoDe(visId)}
      />
    </div>
  );
};

// Modal admin: ver/editar los partidos de una llave y cerrarla
const EditorLlave = ({ llave, faseNombre, partidos, onEditarPartido, onCerrar, cerrando, onClose }) => {
  const localId = llave.equipoLocal?.id ?? llave.equipoLocalId;
  const visId = llave.equipoVisitante?.id ?? llave.equipoVisitanteId;
  const resuelta = llave.ganadorEquipoId != null;
  const todosFin =
    partidos.length > 0 && partidos.every((p) => String(p.estado || "").toLowerCase() === "finalizado");
  const puedeCerrar = !resuelta && todosFin && localId != null && visId != null;
  const gol = (p, s) => (Array.isArray(p[s]) ? p[s].length : Number(p[s]) || 0);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div className="glass-card p-5 w-full max-w-md mx-4 text-white space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#a0f000]">
            {faseNombre} · Llave {llave.numero ?? llave.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>

        {partidos.length === 0 ? (
          <p className="text-sm text-gray-400">
            Esta llave todavía no tiene partidos (se crean al resolverse la ronda anterior).
          </p>
        ) : (
          <div className="space-y-2">
            {partidos
              .slice()
              .sort((a, b) => (a.esVuelta ? 1 : 0) - (b.esVuelta ? 1 : 0))
              .map((p) => (
                <div key={p.id} className="glass-card-sm !rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 uppercase">{p.esVuelta ? "Vuelta" : "Ida"} · {p.estado}</p>
                    <p className="text-sm truncate">
                      {p.equipoLocal?.name} <span className="font-bold text-white">{gol(p, "golesLocal")}</span>
                      {" - "}
                      <span className="font-bold text-white">{gol(p, "golesVisitante")}</span> {p.equipoVisitante?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => onEditarPartido(p.id)}
                    className="btn-outline px-2.5 py-1 text-xs flex-shrink-0"
                  >
                    Editar
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          {puedeCerrar && (
            <button
              onClick={() => onCerrar(llave)}
              disabled={cerrando}
              className="btn-primary px-4 py-1.5 text-sm disabled:opacity-50"
            >
              {cerrando ? "Cerrando…" : "Cerrar llave"}
            </button>
          )}
          <button onClick={onClose} className="btn-outline px-4 py-1.5 text-sm !text-gray-400 !border-gray-600">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const CSS = `
  .bkt { --mh: ${MH}rem; --gap: 1.75rem; display:flex; align-items:flex-start; }
  .bkt-col { display:flex; flex-direction:column; width:13.5rem; flex:0 0 13.5rem; }
  .bkt-col + .bkt-col { margin-left: var(--gap); }
  .bkt-col-title { text-align:center; font-size:11px; font-weight:700; letter-spacing:.06em;
    text-transform:uppercase; color:#9ca3af; margin-bottom:.5rem; }
  .bkt-match { position:relative; height: var(--mh); display:flex; align-items:center; }
  .bkt-match > .bkt-card { width:100%; }
  .bkt-col:not(:last-child) .bkt-match::after {
    content:""; position:absolute; left:100%; top:50%; width: var(--gap);
    border-top:2px solid rgba(160,240,0,.5);
  }
  .bkt-col:not(:last-child) .bkt-match:nth-child(odd)::before {
    content:""; position:absolute; left:calc(100% + var(--gap)); top:50%;
    height: var(--vh); border-left:2px solid rgba(160,240,0,.5);
  }
  .bkt-card { height: var(--mh); display:flex; flex-direction:column;
    border:1px solid rgba(107,114,128,.4); border-radius:6px; overflow:hidden; background:#132523; }
  .bkt-card--editable { cursor:pointer; }
  .bkt-card--editable:hover { border-color: rgba(160,240,0,.55); }
  .bkt-row { flex:1; display:flex; align-items:center; justify-content:space-between; gap:.5rem; padding:0 .5rem; }
  .bkt-sep { border-top:1px solid rgba(107,114,128,.4); }
  .bkt-row.gana { background:rgba(160,240,0,.16); color:#a0f000; font-weight:700; box-shadow: inset 3px 0 0 #a0f000; }
  .bkt-row.pierde { color:#6b7280; }
  .bkt-row:not(.gana):not(.pierde) { color:#e5e7eb; }
`;

const Bracket = ({ torneoId, categoriaId, formato }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);
  const [fases, setFases] = useState([]);
  const [partidosPorLlave, setPartidosPorLlave] = useState({});
  const [gruposFaseId, setGruposFaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accion, setAccion] = useState(null);
  const [error, setError] = useState("");
  const [mobileRound, setMobileRound] = useState(0);
  const [editLlave, setEditLlave] = useState(null); // { llave, faseNombre }

  const headers = useCallback(() => {
    const token = localStorage.getItem("access_token");
    return { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" };
  }, []);

  const cargar = useCallback(async () => {
    if (!torneoId || !categoriaId) return;
    setLoading(true);
    setError("");
    try {
      const [braRes, fasesRes] = await Promise.all([
        fetch(`${apiUrl}/llave/bracket?torneoId=${torneoId}&categoriaId=${categoriaId}`, { headers: headers() }),
        fetch(`${apiUrl}/fase?torneoId=${torneoId}&categoriaId=${categoriaId}`, { headers: headers() }),
      ]);

      const bra = braRes.ok ? await braRes.json() : [];
      const lista = (Array.isArray(bra) ? bra : bra.fases || bra.bracket || [])
        .slice()
        .sort((a, b) => (a.fase?.orden ?? a.orden ?? 0) - (b.fase?.orden ?? b.orden ?? 0));
      setFases(lista);
      setMobileRound((i) => Math.min(i, Math.max(0, lista.length - 1)));

      if (fasesRes.ok) {
        const todas = await fasesRes.json();
        setGruposFaseId(
          (Array.isArray(todas) ? todas : []).find((f) => String(f.tipo).toLowerCase() === "grupos")?.id ?? null
        );
      }

      const mapa = {};
      await Promise.all(
        lista.map(async (item) => {
          const faseId = item.fase?.id ?? item.id;
          if (!faseId) return;
          try {
            const r = await fetch(`${apiUrl}/partido/fase/${faseId}`, { headers: headers() });
            if (!r.ok) return;
            const ps = await r.json();
            for (const p of Array.isArray(ps) ? ps : []) {
              const lid = p.llaveId ?? p.llave?.id;
              if (lid == null) continue;
              (mapa[lid] ||= []).push(p);
            }
          } catch {
            /* ignore */
          }
        })
      );
      setPartidosPorLlave(mapa);
    } catch (e) {
      console.error("Error cargando cuadro:", e);
      setError("No se pudo cargar el cuadro.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, torneoId, categoriaId, headers]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const generarCuadro = async () => {
    if (!gruposFaseId) return;
    setAccion("generar");
    setError("");
    try {
      const res = await fetch(`${apiUrl}/fase/${gruposFaseId}/generar-bracket`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await res.text());
      await cargar();
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el cuadro. ¿Terminó la fase de grupos?");
    } finally {
      setAccion(null);
    }
  };

  const cerrarLlave = async (llave) => {
    setAccion(llave.id);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/llave/${llave.id}/cerrar`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await res.text());
      await cargar();
    } catch (e) {
      console.error(e);
      setError("No se pudo cerrar la llave (revisá el resultado).");
    } finally {
      setAccion(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rondas = fases.map((item) => ({
    fase: item.fase || item,
    llaves: (item.llaves || []).slice().sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0)),
  }));
  const vacio = rondas.length === 0 || rondas.every((r) => r.llaves.length === 0);

  const card = (llave, faseNombre) => (
    <TarjetaLlave
      llave={llave}
      partidos={partidosPorLlave[llave.id] || []}
      onClick={isAdmin ? () => setEditLlave({ llave, faseNombre }) : undefined}
    />
  );

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-4 space-y-4">
      <style>{CSS}</style>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
      )}

      {isAdmin && formato === "copa" && gruposFaseId && vacio && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={generarCuadro}
            disabled={accion === "generar"}
            className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
          >
            {accion === "generar" ? "Generando…" : "Generar cuadro desde la fase de grupos"}
          </button>
        </div>
      )}

      {vacio ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-400 mb-1">Todavía no hay cuadro para esta categoría.</p>
          <p className="text-sm text-gray-600">Se arma al cerrar la fase de grupos.</p>
        </div>
      ) : (
        <>
          <h2 className="text-center text-lg font-bold text-[#a0f000] uppercase tracking-wide">Cuadro</h2>

          {/* Desktop / tablet: árbol con conectores */}
          <div className="hidden md:flex justify-center overflow-x-auto">
            <div className="bkt" style={{ minWidth: "min-content" }}>
              {rondas.map(({ fase, llaves }, d) => (
                <div key={fase.id} className="bkt-col">
                  <div className="bkt-col-title">{fase.nombre}</div>
                  <div
                    style={{
                      paddingTop: `${padAt(d)}rem`,
                      paddingBottom: `${padAt(d)}rem`,
                      "--vh": `${vLineHeightAt(d)}rem`,
                    }}
                  >
                    {llaves.map((llave, idx) => (
                      <div
                        key={llave.id}
                        className="bkt-match"
                        style={{ marginBottom: `${marginBottomAt(d, idx)}rem` }}
                      >
                        {card(llave, fase.nombre)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: selector de ronda + lista */}
          <div className="md:hidden">
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
              {rondas.map((r, i) => (
                <button
                  key={r.fase.id}
                  type="button"
                  onClick={() => setMobileRound(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition ${
                    i === mobileRound ? "bg-[#a0f000] text-black" : "glass-card-sm !rounded-lg text-gray-400"
                  }`}
                >
                  {r.fase.nombre}
                </button>
              ))}
            </div>
            <div className="space-y-3 mt-2">
              {(rondas[mobileRound]?.llaves || []).map((llave) => (
                <div key={llave.id}>
                  <p className="text-[11px] text-gray-500 mb-1">Llave {llave.numero ?? llave.id}</p>
                  {card(llave, rondas[mobileRound]?.fase?.nombre)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {editLlave && (
        <EditorLlave
          llave={editLlave.llave}
          faseNombre={editLlave.faseNombre}
          partidos={partidosPorLlave[editLlave.llave.id] || []}
          cerrando={accion === editLlave.llave.id}
          onEditarPartido={(id) => navigate(`/partidos/${id}`)}
          onCerrar={async (ll) => {
            await cerrarLlave(ll);
            setEditLlave(null);
          }}
          onClose={() => setEditLlave(null)}
        />
      )}
    </div>
  );
};

export default Bracket;
