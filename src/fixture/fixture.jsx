import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../auth/auth.context";
import { FiLock, FiArrowRight, FiEdit2, FiCalendar } from "react-icons/fi";
import Paginador from "./Paginador";
import Pronostico from "../Pronosticos/Pronostico";
import PronosticoTutorial from "../Pronosticos/PronosticoTutorial";
import FormularioPartido from "../Partidos/FormularioPartidos";

// Formatea la fecha/hora del partido en español.
// Se fija la zona en UTC para mostrar exactamente la hora cargada (la fecha se
// guarda en UTC y, en Argentina UTC-3, el navegador la mostraría 3 horas menos).
const formatFechaPartido = (iso) => {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      timeZone: "UTC",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

// ¿Ya pasó la hora de inicio? La fecha se guarda en UTC pero representa hora
// argentina (UTC-3), así que sumamos 3h para comparar contra el instante real.
const partidoYaEmpezo = (p) => {
  if (!p?.date) return false;
  const inicio = new Date(p.date).getTime() + 3 * 60 * 60 * 1000;
  return Number.isFinite(inicio) && inicio <= Date.now();
};

const Fixture = () => {
  const { torneoId, categoriaId, fecha: initialFecha } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFecha, setCurrentFecha] = useState(
    initialFecha ? Number(initialFecha) : 1
  );
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [maxFecha, setMaxFecha] = useState(null);
  const [torneo, setTorneo] = useState(null);
  const [equipoLibre, setEquipoLibre] = useState(null);
  const { isSubscribed, isAdmin } = useContext(AuthContext);

  // Edición de partido (solo admin)
  const [editPartido, setEditPartido] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  // 1) Traer datos del torneo y buscar última fecha con datos
  useEffect(() => {
    const fetchTorneo = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(`${apiUrl}/torneo/${torneoId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setTorneo(data);
        const totalFechas = data.fechas || 1;
        setMaxFecha(totalFechas);

        // Buscar la última fecha con partidos cargados y aplicar lógica de día
        if (categoriaId) {
          // Lunes=1 ... Jueves=4 → última fecha con ≥70% partidos finalizados
          // Viernes=5, Sábado=6, Domingo=0 → fecha siguiente (próxima jornada)
          const diaSemana = new Date().getDay(); // 0=Dom, 1=Lun ... 6=Sab
          const esFinde = diaSemana === 0 || diaSemana === 5 || diaSemana === 6;

          // Función que verifica si una fecha tiene al menos 70% de partidos finalizados
          const fechaTienePartidosFinalizados = async (f) => {
            try {
              const r = await fetch(
                `${apiUrl}/partido/${torneoId}/fixture/${categoriaId}/${f}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                  },
                }
              );
              if (!r.ok) return false;
              const arr = await r.json();
              if (!Array.isArray(arr) || arr.length === 0) return false;
              const finalizados = arr.filter(p =>
                p.estado === "Finalizado" || p.estado === "finalizado"
              ).length;
              return finalizados / arr.length >= 0.7;
            } catch (e) { return false; }
          };

          let ultimaConPartidos = null;
          for (let f = totalFechas; f >= 1; f--) {
            if (await fechaTienePartidosFinalizados(f)) {
              ultimaConPartidos = f;
              break;
            }
          }

          let fechaTarget;
          if (esFinde) {
            // Viernes-Domingo: mostrar la fecha siguiente a la última jugada
            fechaTarget = ultimaConPartidos
              ? Math.min(ultimaConPartidos + 1, totalFechas)
              : 1;
          } else {
            // Lunes-Jueves: mostrar la última fecha con partidos
            fechaTarget = ultimaConPartidos || 1;
          }
          setCurrentFecha(fechaTarget);
        }
      } catch (err) {
        console.error("Error fetching torneo:", err);
      }
    };
    fetchTorneo();
  }, [apiUrl, torneoId, categoriaId, isSubscribed]);

  // 2) Traer fixture
  useEffect(() => {
    if (!torneoId || !categoriaId || !currentFecha) return;
    const fetchFixture = async () => {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      // Fetch equipo libre de esta fecha/categoría en paralelo
      fetch(`${apiUrl}/equipo-libre/${torneoId}/${categoriaId}/${currentFecha}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return setEquipoLibre(null);
          // El endpoint puede devolver array o un objeto único
          const item = Array.isArray(data) ? data[0] : data;
          setEquipoLibre(item?.equipo || null);
        })
        .catch(() => setEquipoLibre(null));
      try {
        const res = await fetch(
          `${apiUrl}/partido/${torneoId}/fixture/${categoriaId}/${currentFecha}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPartidos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching fixture:", err);
        setPartidos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFixture();
    navigate(
      `/torneo/${torneoId}/fixture/${categoriaId}/${currentFecha}`,
      { replace: true }
    );
    console.log(currentFecha);

  }, [apiUrl, torneoId, categoriaId, currentFecha, navigate, reloadFlag]);

  // Edición de partido (admin) — abre el formulario y refresca al guardar
  const handleEditPartido = (partido) => {
    setEditPartido(partido);
    setShowForm(true);
  };

  const handleSavePartido = async (partidoData) => {
    const token = localStorage.getItem("access_token");
    try {
      const body = {
        equipoVisitanteId: partidoData.equipoVisitanteId,
        equipoLocalId: partidoData.equipoLocalId,
        torneoId: partidoData.torneoId,
        categoriaId: partidoData.categoriaId,
        fecha: partidoData.fecha,
        date: partidoData.date,
        estado: partidoData.estado,
        group: partidoData.group,
        groupLocal: partidoData.groupLocal,
        groupVisitante: partidoData.groupVisitante,
        fechaDeterminada: partidoData.fechaDeterminada,
      };
      const res = await fetch(`${apiUrl}/partido/${editPartido.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setReloadFlag((f) => f + 1);
    } catch (err) {
      console.error("Error guardando partido:", err);
    } finally {
      setShowForm(false);
      setEditPartido(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // 3) Agrupar por grupo y luego ordenarlos
  const hasRealGroups = partidos.some(p => p.group);
  const gruposMap = partidos.reduce((acc, p) => {
    const g = p.group || "Sin grupo";
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});
  const grupos = Object.keys(gruposMap).sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    const aNum = !isNaN(na);
    const bNum = !isNaN(nb);
    if (aNum && bNum) return na - nb;
    if (aNum) return -1;
    if (bNum) return 1;
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });

  // Navegación fechas


  return (

    <div className="max-w-4xl mx-auto p-2 md:p-4">

      {/* Tutorial de pronósticos (se muestra una sola vez, guardado en cookie) */}
      <PronosticoTutorial />

      {isSubscribed ? (
        <Paginador
          current={currentFecha}
          max={maxFecha || 1}
          onFirst={() => setCurrentFecha(1)}
          onPrev={() => currentFecha > 1 && setCurrentFecha(currentFecha - 1)}
          onSelect={(f) => setCurrentFecha(f)}
          onNext={() =>
            maxFecha && currentFecha < maxFecha && setCurrentFecha(currentFecha + 1)
          }
          onLast={() => maxFecha && setCurrentFecha(maxFecha)}
        />
      ) : (
        <div className="text-center py-3">
          <div className="inline-flex items-center gap-2 glass-card-sm !rounded-xl px-4 py-2">
            <span className="text-sm text-gray-300 font-medium">Fecha {currentFecha}</span>
            <span className="text-gray-600">·</span>
            <NavLink to="/suscipcion" className="text-[#a0f000] text-sm hover:underline inline-flex items-center gap-1">
              <FiLock className="w-3 h-3" /> Ver todas las fechas
            </NavLink>
          </div>
        </div>
      )}
      {/* Título */}
      <h1 className="text-xl md:text-2xl pt-4 md:pt-6 font-bold text-center text-gradient-accent mb-2">
        {torneo?.name || "Torneo"}
      </h1>

      {/* Equipo libre */}
      {equipoLibre && (
        <div className="flex justify-end mb-4 md:mb-6 px-2">
          <div className="inline-flex items-center gap-2 glass-card-sm !rounded-xl px-3 py-1.5 text-xs">
            <span className="text-gray-500">Libre:</span>
            {equipoLibre.image && (
              <img src={equipoLibre.image} alt={equipoLibre.name} className="h-5 w-5 object-contain" />
            )}
            <span className="font-medium text-white">{equipoLibre.name}</span>
          </div>
        </div>
      )}
      {!equipoLibre && <div className="mb-4 md:mb-6" />}

      {/* Sin partidos */}
      {partidos.length === 0 && (
        <p className="text-center text-gray-500 mb-4 text-sm">
          No hay partidos para esta fecha.
        </p>
      )}

      {/* Por cada grupo */}
      {grupos.map((grupo) => (
        <div key={grupo} className="mb-4 md:mb-6 animate-fade-up">
          {hasRealGroups && (
            <h3 className="text-lg md:text-xl font-bold text-[#a0f000] mb-3 px-2 md:px-0">
              Grupo {grupo}
            </h3>
          )}
          <div className="space-y-2 md:space-y-3 px-2 md:px-0">
            {gruposMap[grupo].map((p, i) => {
              const key = `${grupo}-${i}`;
              const expanded = expandedIndex === key;
              return (
                <div key={key}>
                  <div className="flex items-stretch gap-2">
                  <div
                    onClick={() =>
                      setExpandedIndex(expanded ? null : key)
                    }
                    className="flex-1 min-w-0 cursor-pointer glass-card-sm overflow-hidden hover:border-[#a0f000]/30 transition-all duration-200"
                  >
                    {/* Layout para móvil */}
                    <div className="md:hidden">
                      <div className="flex justify-between items-center p-3">
                        {/* Equipo Local */}
                        <div className="flex items-center space-x-2 flex-1">
                          <img
                            src={p.equipoLocal.image}
                            alt={p.equipoLocal.name}
                            className="h-8 w-8 object-contain"
                          />
                          <span className="text-xs font-medium truncate text-gray-200">
                            {p.equipoLocal.name}
                          </span>
                        </div>

                        {/* Marcador */}
                        <div className="flex items-center justify-center px-3">
                          {p.estado === "Finalizado" ? (
                            <div className="flex items-center space-x-2 text-lg font-bold text-white">
                              <span>{p.golesLocal.length}</span>
                              <span className="text-gray-500 text-sm">-</span>
                              <span>{p.golesVisitante.length}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-400">VS</span>
                          )}
                        </div>

                        {/* Equipo Visitante */}
                        <div className="flex items-center space-x-2 flex-1 justify-end">
                          <span className="text-xs font-medium truncate text-gray-200">
                            {p.equipoVisitante.name}
                          </span>
                          <img
                            src={p.equipoVisitante.image}
                            alt={p.equipoVisitante.name}
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                      </div>

                      {/* Estado del partido */}
                      {p.estado !== "Pendiente" && (
                        <div className={`text-xs text-center py-1 border-t border-gray-700/30 ${p.estado === "Finalizado" ? "text-[#a0f000]" :
                            p.estado === "Suspendido" ? "text-red-400" :
                              p.estado === "Postergado" ? "text-orange-400" :
                                "text-gray-400"
                          }`}>
                          {p.estado}
                        </div>
                      )}
                    </div>

                    {/* Layout para desktop */}
                    <div className="hidden md:block p-4">
                      <div className="flex flex-row justify-between items-center">
                        {/* Local */}
                        <div className="flex items-center space-x-3 w-1/4 justify-start">
                          <img
                            src={p.equipoLocal.image}
                            alt={p.equipoLocal.name}
                            className="h-10"
                          />
                          <span className="text-base font-medium text-gray-200">
                            {p.equipoLocal.name}
                          </span>
                        </div>

                        {/* VS + goles */}
                        <div className="flex items-center justify-center w-1/2">
                          {p.estado === "Finalizado" && (
                            <h1 className="font-bold mx-2 text-xl text-white">
                              {p.golesLocal.length}
                            </h1>
                          )}
                          <div className="font-bold mx-2 text-gray-500">VS</div>
                          {p.estado === "Finalizado" && (
                            <h1 className="font-bold mx-2 text-xl text-white">
                              {p.golesVisitante.length}
                            </h1>
                          )}
                        </div>

                        {/* Visitante */}
                        <div className="flex items-center space-x-3 w-1/4 justify-end">
                          <span className="text-base font-medium text-gray-200">
                            {p.equipoVisitante.name}
                          </span>
                          <img
                            src={p.equipoVisitante.image}
                            alt={p.equipoVisitante.name}
                            className="h-10"
                          />
                        </div>
                      </div>

                      {/* Estado del partido para desktop */}
                      {p.estado !== "Pendiente" && (
                        <div className={`text-sm text-center mt-2 ${p.estado === "Finalizado" ? "text-[#a0f000]" :
                            p.estado === "Suspendido" ? "text-red-400" :
                              p.estado === "Postergado" ? "text-orange-400" :
                                "text-gray-400"
                          }`}>
                          {p.estado}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón editar (solo admin) — a la derecha de la caja */}
                  {isAdmin && (
                    <button
                      onClick={() => handleEditPartido(p)}
                      title="Editar partido"
                      className="flex-shrink-0 px-3 flex items-center justify-center rounded-xl border border-gray-700/40 text-gray-400 hover:text-[#a0f000] hover:border-[#a0f000]/40 transition"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  )}
                  </div>

                  {/* Detalle expandido: pronóstico + goles */}
                  {expanded && (
                    <div className="mt-2 md:mt-3 px-2 md:px-0 space-y-2 md:space-y-3 animate-fade-in">
                      {/* Fecha del partido — solo si está confirmada */}
                      {p.fechaDeterminada && p.date && (
                        <div className="glass-card-sm p-3 flex items-center justify-center gap-2 text-center">
                          <FiCalendar className="w-4 h-4 text-[#a0f000] flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400 leading-none mb-0.5">Fecha del partido</p>
                            <p className="text-sm font-semibold text-white capitalize">{formatFechaPartido(p.date)}</p>
                          </div>
                        </div>
                      )}

                      {/* Pronóstico (favorito) — visible para todos */}
                      <Pronostico partido={p} isSubscribed={isSubscribed} />

                      {/* Detalle de goles — si está finalizado o ya empezó (aunque siga pendiente) */}
                      {(p.estado === "Finalizado" || (p.estado === "Pendiente" && partidoYaEmpezo(p))) && (
                      isSubscribed ? (
                      <div className="flex flex-col gap-2 md:gap-3 md:flex-row">
                        {/* Local */}
                        <div className="flex-1 glass-card-sm p-3">
                          <h4 className="text-[#a0f000] font-semibold mb-2 text-center text-sm">
                            Goles Local
                          </h4>
                          {p.golesLocal.length ? (
                            <ul className="text-gray-300 text-xs md:text-sm space-y-1">
                              {p.golesLocal.map((g, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between py-1 px-2 rounded hover:bg-white/5"
                                >
                                  <span>{g.jugador?.name}</span>
                                  <span className="text-gray-500">{g.minuto}&apos;</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-600 text-center text-xs md:text-sm">
                              Sin goles
                            </p>
                          )}
                        </div>
                        {/* Visitante */}
                        <div className="flex-1 glass-card-sm p-3">
                          <h4 className="text-[#a0f000] font-semibold mb-2 text-center text-sm">
                            Goles Visitante
                          </h4>
                          {p.golesVisitante.length ? (
                            <ul className="text-gray-300 text-xs md:text-sm space-y-1">
                              {p.golesVisitante.map((g, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between py-1 px-2 rounded hover:bg-white/5"
                                >
                                  <span className="text-gray-500">{g.minuto}&apos;</span>
                                  <span>{g.jugador?.name}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-600 text-center text-xs md:text-sm">
                              Sin goles
                            </p>
                          )}
                        </div>
                      </div>
                      ) : (
                      <div className="glass-card-sm p-4 text-center">
                        <FiLock className="mx-auto text-gray-500 mb-2 w-5 h-5" />
                        <p className="text-sm text-gray-400 mb-2">Suscribite para ver el detalle de goles</p>
                        <NavLink to="/suscipcion" className="text-[#a0f000] text-sm hover:underline inline-flex items-center gap-1">
                          Ver planes <FiArrowRight className="w-3.5 h-3.5" />
                        </NavLink>
                      </div>
                      )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Paginador extraído */}
      {isSubscribed ? (
        <Paginador
          current={currentFecha}
          max={maxFecha || 1}
          onFirst={() => setCurrentFecha(1)}
          onPrev={() => currentFecha > 1 && setCurrentFecha(currentFecha - 1)}
          onSelect={(f) => setCurrentFecha(f)}
          onNext={() =>
            maxFecha && currentFecha < maxFecha && setCurrentFecha(currentFecha + 1)
          }
          onLast={() => maxFecha && setCurrentFecha(maxFecha)}
        />
      ) : (
        <div className="text-center py-3">
          <div className="inline-flex items-center gap-2 glass-card-sm !rounded-xl px-4 py-2">
            <span className="text-sm text-gray-300 font-medium">Fecha {currentFecha}</span>
            <span className="text-gray-600">·</span>
            <NavLink to="/suscipcion" className="text-[#a0f000] text-sm hover:underline inline-flex items-center gap-1">
              <FiLock className="w-3 h-3" /> Ver todas las fechas
            </NavLink>
          </div>
        </div>
      )}

      {/* Formulario de edición de partido (admin) */}
      {showForm && editPartido && (
        <FormularioPartido
          setCreator={setShowForm}
          selectedPartido={editPartido}
          onSave={handleSavePartido}
          initialFecha={editPartido.fecha}
          torneoInfo={{ id: torneoId, name: torneo?.name }}
        />
      )}
    </div>
  );
};

export default Fixture;
