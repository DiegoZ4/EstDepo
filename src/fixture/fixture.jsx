import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../auth/auth.context";
import { FiLock, FiArrowRight } from "react-icons/fi";
import Paginador from "./Paginador";

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
  const { isSubscribed } = useContext(AuthContext);

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

        // Buscar la última fecha que tenga partidos cargados
        if (!isSubscribed && categoriaId) {
          let found = null;
          for (let f = totalFechas; f >= 1; f--) {
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
              if (r.ok) {
                const arr = await r.json();
                if (Array.isArray(arr) && arr.length > 0) {
                  found = f;
                  break;
                }
              }
            } catch (e) { /* skip */ }
          }
          const ultima = found || 1;
          setCurrentFecha(ultima);
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

  }, [apiUrl, torneoId, categoriaId, currentFecha, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // 3) Agrupar por grupo y luego ordenarlos
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
      <h1 className="text-xl md:text-2xl pt-4 md:pt-6 font-bold text-center text-gradient-accent mb-4 md:mb-6">
        {torneo?.name || "Torneo"}
      </h1>

      {/* Sin partidos */}
      {partidos.length === 0 && (
        <p className="text-center text-gray-500 mb-4 text-sm">
          No hay partidos para esta fecha.
        </p>
      )}

      {/* Por cada grupo */}
      {grupos.map((grupo) => (
        <div key={grupo} className="mb-4 md:mb-6 animate-fade-up">
          <h3 className="text-lg md:text-xl font-bold text-[#a0f000] mb-3 px-2 md:px-0">
            Grupo {grupo}
          </h3>
          <div className="space-y-2 md:space-y-3 px-2 md:px-0">
            {gruposMap[grupo].map((p, i) => {
              const key = `${grupo}-${i}`;
              const expanded = expandedIndex === key;
              return (
                <div key={key}>
                  <div
                    onClick={() =>
                      setExpandedIndex(expanded ? null : key)
                    }
                    className="cursor-pointer glass-card-sm overflow-hidden hover:border-[#a0f000]/30 transition-all duration-200"
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
                        <div className={`text-xs text-center py-1 border-t border-gray-700/30 ${
                          p.estado === "Finalizado" ? "text-[#a0f000]" :
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
                        <div className={`text-sm text-center mt-2 ${
                          p.estado === "Finalizado" ? "text-[#a0f000]" :
                          p.estado === "Suspendido" ? "text-red-400" :
                          p.estado === "Postergado" ? "text-orange-400" :
                          "text-gray-400"
                        }`}>
                          {p.estado}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detalle goles */}
                  {expanded && (
                    isSubscribed ? (
                      <div className="mt-2 md:mt-3 flex flex-col gap-2 md:gap-3 px-2 md:px-0 md:flex-row animate-fade-in">
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
                      <div className="mt-2 glass-card-sm p-4 text-center animate-fade-in">
                        <FiLock className="mx-auto text-gray-500 mb-2 w-5 h-5" />
                        <p className="text-sm text-gray-400 mb-2">Suscribite para ver el detalle de goles</p>
                        <NavLink to="/suscipcion" className="text-[#a0f000] text-sm hover:underline inline-flex items-center gap-1">
                          Ver planes <FiArrowRight className="w-3.5 h-3.5" />
                        </NavLink>
                      </div>
                    )
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
    </div>
  );
};

export default Fixture;
