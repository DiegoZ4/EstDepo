import React, { useState, useEffect } from "react";

// Normaliza nombres de equipo para poder cruzar la tabla con los partidos
const norm = (s) => String(s || "").trim().toLowerCase();

// Estilo de cada badge de forma reciente (mismo criterio que Promiedos)
const BADGE = {
  V: "bg-[#a0f000]/20 text-[#a0f000] border-[#a0f000]/40", // Victoria → verde
  E: "bg-amber-400/20 text-amber-300 border-amber-400/40",  // Empate   → amarillo
  D: "bg-red-500/20 text-red-400 border-red-500/40",        // Derrota  → rojo
};

const TITULO = { V: "Victoria", E: "Empate", D: "Derrota" };

const Ultimas = ({ resultados }) => {
  if (!resultados || resultados.length === 0) {
    return <span className="text-gray-600">—</span>;
  }
  return (
    <div className="flex items-center justify-center gap-1">
      {resultados.map((r, i) => (
        <span
          key={i}
          title={TITULO[r] || r}
          className={`inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold border ${BADGE[r] || ""}`}
        >
          {r}
        </span>
      ))}
    </div>
  );
};

const Tablas = ({ torneoId, categoriaId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState([]);
  // Forma reciente por equipo: { byId: { [id]: ["V","E",...] }, byName: { [nombre]: [...] } }
  const [forma, setForma] = useState({ byId: {}, byName: {} });
  // Copa: línea de clasificación { n: puestos que clasifican, label: ronda siguiente }
  const [clasificacion, setClasificacion] = useState(null);

  useEffect(() => {
    console.log("🔍 Verificando parámetros - torneoId:", torneoId, "categoriaId:", categoriaId);

    if (!torneoId || !categoriaId) {
      console.warn("⚠️ Falta torneoId o categoriaId. No se cargará la tabla.");
      setLoading(false);
      return;
    }

    // En torneos "copa" la tabla debe ser SOLO la fase de grupos → resolvemos su faseId.
    // Además calculamos la línea de clasificación (cuántos clasifican + a qué ronda).
    // Si el torneo no tiene fases (liga clásica) devuelve null y el endpoint funciona igual.
    const getFaseGruposId = async (token) => {
      const auth = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      try {
        const [fasesRes, torneoRes] = await Promise.all([
          fetch(`${apiUrl}/fase?torneoId=${torneoId}&categoriaId=${categoriaId}`, { headers: auth }),
          fetch(`${apiUrl}/torneo/${torneoId}`, { headers: auth }),
        ]);
        const fases = fasesRes.ok ? await fasesRes.json() : [];
        const arr = Array.isArray(fases) ? fases : [];
        const grupos = arr.find((f) => String(f.tipo).toLowerCase() === "grupos");

        const torneo = torneoRes.ok ? await torneoRes.json() : null;
        const n = Number(torneo?.equiposClasificanPorGrupo) || 0;
        if (torneo?.formato === "copa" && n > 0) {
          const primeraElim = arr
            .filter((f) => String(f.tipo).toLowerCase() === "eliminatoria")
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))[0];
          setClasificacion({ n, label: primeraElim?.nombre || "Clasifican" });
        } else {
          setClasificacion(null);
        }
        return grupos?.id ?? null;
      } catch {
        setClasificacion(null);
        return null;
      }
    };

    const fetchTablaAgrupada = async () => {
      console.log("🔄 Iniciando carga de tabla...");
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const faseGruposId = await getFaseGruposId(token);
        const url = `${apiUrl}/torneo/${torneoId}/tabla/${categoriaId}${
          faseGruposId ? `?faseId=${faseGruposId}` : ""
        }`;
        console.log("📡 Haciendo request a:", url);

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        console.log("📥 Respuesta recibida - Status:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Error del servidor:", errorText);
          throw new Error("No se pudo obtener la tabla");
        }

        const tabla = await response.json();
        console.log("✅ Tabla obtenida:", tabla);
        console.log("📊 Tipo de datos recibidos:", typeof tabla, Array.isArray(tabla) ? "Array" : "Object");
        console.log("📦 Claves del objeto:", Object.keys(tabla));
        setItems(tabla);
        // Extrae y ordena las claves en orden numérico cuando sean números,
// o lexicográfico cuando no lo sean.
const sortedGrupos = Object.keys(tabla).sort((a, b) => {
  const na = parseInt(a, 10);
  const nb = parseInt(b, 10);
  const aEsNum = !isNaN(na);
  const bEsNum = !isNaN(nb);

  if (aEsNum && bEsNum) {
    // Ambos son numéricos → comparo numéricamente
    return na - nb;
  } else if (aEsNum) {
    // Sólo 'a' es numérico → va antes
    return -1;
  } else if (bEsNum) {
    // Sólo 'b' es numérico → va antes
    return 1;
  } else {
    // Ninguno es numérico → comparo como strings
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  }
});
setGrupos(sortedGrupos);
        console.log("✅ Grupos ordenados:", sortedGrupos);

      } catch (err) {
        console.error("❌ Error al cargar la tabla:", err);
        console.error("❌ Detalles del error:", err.message);
      } finally {
        console.log("🏁 Finalizando carga - setLoading(false)");
        setLoading(false);
      }
    };

    // Calcula la columna "Últimas" (últimos 5 resultados) a partir de los partidos
    // finalizados del torneo/categoría. No bloquea el render de la tabla.
    const fetchForma = async () => {
      setForma({ byId: {}, byName: {} });
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/partido/torneo/${torneoId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.warn("⚠️ No se pudieron cargar los partidos para 'Últimas'");
          return;
        }

        const raw = await res.json();
        // El endpoint puede venir como array o agrupado por fecha { "1": [...], ... }
        const lista = Array.isArray(raw) ? raw : Object.values(raw).flat();

        const finalizados = lista
          .filter((p) => {
            const estado = norm(p.estado);
            const catId = p.category?.id ?? p.categoriaId;
            // La forma reciente es de la fase de grupos: excluimos partidos de eliminatoria
            const esEliminatoria = norm(p.group) === "eliminatoria" || p.llaveId != null;
            return (
              estado === "finalizado" &&
              !esEliminatoria &&
              Number(catId) === Number(categoriaId)
            );
          })
          .sort((a, b) => {
            const fa = Number(a.fecha) || 0;
            const fb = Number(b.fecha) || 0;
            if (fa !== fb) return fa - fb; // por número de jornada
            return new Date(a.date || 0) - new Date(b.date || 0); // desempate por fecha real
          });

        // Cantidad de goles: soporta array de goles o un número directo
        const golesDe = (valor) => {
          if (Array.isArray(valor)) return valor.length;
          const n = Number(valor);
          return Number.isFinite(n) ? n : null;
        };

        const byId = {};
        const byName = {};
        const push = (mapa, clave, valor) => {
          if (clave === null || clave === undefined || clave === "") return;
          (mapa[clave] ||= []).push(valor);
        };

        for (const p of finalizados) {
          const gl = golesDe(p.golesLocal ?? p.golLocal ?? p.golesLocalCount);
          const gv = golesDe(p.golesVisitante ?? p.golVisitante ?? p.golesVisitanteCount);
          if (gl === null || gv === null) continue;

          let resLocal, resVisitante;
          if (gl > gv) { resLocal = "V"; resVisitante = "D"; }
          else if (gl < gv) { resLocal = "D"; resVisitante = "V"; }
          else { resLocal = "E"; resVisitante = "E"; }

          const localId = p.equipoLocal?.id ?? p.equipoLocalId;
          const visitanteId = p.equipoVisitante?.id ?? p.equipoVisitanteId;

          push(byId, localId, resLocal);
          push(byId, visitanteId, resVisitante);
          push(byName, norm(p.equipoLocal?.name), resLocal);
          push(byName, norm(p.equipoVisitante?.name), resVisitante);
        }

        // Nos quedamos con los últimos 5 (el más reciente queda a la derecha)
        for (const k of Object.keys(byId)) byId[k] = byId[k].slice(-5);
        for (const k of Object.keys(byName)) byName[k] = byName[k].slice(-5);

        setForma({ byId, byName });
        console.log("✅ 'Últimas' calculadas para", Object.keys(byId).length, "equipos");
      } catch (err) {
        console.error("❌ Error al calcular 'Últimas':", err);
      }
    };

    fetchTablaAgrupada();
    fetchForma();
  }, [apiUrl, torneoId, categoriaId]);

  // Devuelve los últimos resultados de un equipo (primero por id, luego por nombre)
  const formaDe = (equipo) =>
    forma.byId?.[equipo?.id] || forma.byName?.[norm(equipo?.name)] || [];


  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!grupos || grupos.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-400 mb-2">No hay datos de tabla disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-4 space-y-6">
      {grupos.map((grupo) => (
        <div key={grupo} className="glass-card overflow-hidden animate-fade-up">
          <div className="px-5 py-3 border-b border-gray-700/40">
            <h2 className="text-lg font-bold text-[#a0f000]">
              Grupo {grupo}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="w-10 !text-center">#</th>
                  <th className="!text-center">Club</th>
                  <th className="!text-center">Pts</th>
                  <th className="!text-center">PJ</th>
                  <th className="!text-center">PG</th>
                  <th className="!text-center">PE</th>
                  <th className="!text-center">PP</th>
                  <th className="!text-center">GF</th>
                  <th className="!text-center">GC</th>
                  <th className="!text-center">DIF</th>
                  <th className="!text-center">Últimas</th>
                </tr>
              </thead>
              <tbody>
                {items[grupo].map((row, index) => (
                  <React.Fragment key={index}>
                  <tr>
                    <td className="text-center font-bold text-[#a0f000]">{index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center flex-shrink-0">
                          <img
                            src={row.equipo.image}
                            alt={row.equipo.name}
                            className="h-8 object-cover"
                          />
                        </div>
                        <span className="font-medium text-white">{row.equipo.name}</span>
                      </div>
                    </td>
                    <td className="text-center font-bold text-white">{row.Pts}</td>
                    <td className="text-center">{row.PJ}</td>
                    <td className="text-center">{row.PG}</td>
                    <td className="text-center">{row.PE}</td>
                    <td className="text-center">{row.PP}</td>
                    <td className="text-center">{row.GF}</td>
                    <td className="text-center">{row.GC}</td>
                    <td className={`text-center font-semibold ${row.DIF > 0 ? 'text-green-400' : row.DIF < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {row.DIF > 0 ? `+${row.DIF}` : row.DIF}
                    </td>
                    <td className="text-center">
                      <Ultimas resultados={formaDe(row.equipo)} />
                    </td>
                  </tr>
                  {clasificacion && index + 1 === clasificacion.n && index + 1 < items[grupo].length && (
                    <tr className="pointer-events-none">
                      <td colSpan={11} className="p-0">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#a0f000]/10 border-y border-[#a0f000]/40">
                          <span className="w-2 h-2 rounded-full bg-[#a0f000] flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-[#a0f000] uppercase tracking-wide">
                            {clasificacion.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tablas;
