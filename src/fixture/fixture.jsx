import { useState, useEffect } from "react";
import Paginador from "./Paginador";
import { useParams, useNavigate } from "react-router-dom";

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

  // 1) Traer datos del torneo
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
        setMaxFecha(data.fechas || 1);
      } catch (err) {
        console.error("Error fetching torneo:", err);
      }
    };
    fetchTorneo();
  }, [apiUrl, torneoId]);

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

  if (loading) return <div>Loading...</div>;

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
      {/* Título */}
      <h1 className="text-xl md:text-2xl pt-4 md:pt-6 font-bold text-center text-white mb-4 md:mb-6">
        {torneo?.name || "Torneo"}
      </h1>

      {/* Sin partidos */}
      {partidos.length === 0 && (
        <p className="text-center text-red-500 mb-4">
          No hay partidos para esta fecha.
        </p>
      )}

      {/* Por cada grupo */}
      {grupos.map((grupo) => (
        <div key={grupo} className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 px-2 md:px-0">
            Grupo {grupo}
          </h3>
          <div className="space-y-2 md:space-y-4 px-2 md:px-0">
            {gruposMap[grupo].map((p, i) => {
              const key = `${grupo}-${i}`;
              const expanded = expandedIndex === key;
              return (
                <div key={key}>
                  <div
                    onClick={() =>
                      setExpandedIndex(expanded ? null : key)
                    }
                    className="cursor-pointer bg-purple-800 text-white rounded shadow-lg overflow-hidden"
                  >
                    {/* Layout para móvil */}
                    <div className="md:hidden">
                      {/* Equipos en row para móvil */}
                      <div className="flex justify-between items-center p-3 bg-purple-900">
                        {/* Equipo Local */}
                        <div className="flex items-center space-x-2 flex-1">
                          <img
                            src={p.equipoLocal.image}
                            alt={p.equipoLocal.name}
                            className="h-8 w-8 object-contain"
                          />
                          <span className="text-xs font-medium truncate">
                            {p.equipoLocal.name}
                          </span>
                        </div>
                        
                        {/* Marcador */}
                        <div className="flex items-center justify-center px-3">
                          {p.estado === "Finalizado" ? (
                            <div className="flex items-center space-x-2 text-lg font-bold">
                              <span>{p.golesLocal.length}</span>
                              <span className="text-sm">-</span>
                              <span>{p.golesVisitante.length}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold">VS</span>
                          )}
                        </div>
                        
                        {/* Equipo Visitante */}
                        <div className="flex items-center space-x-2 flex-1 justify-end">
                          <span className="text-xs font-medium truncate">
                            {p.equipoVisitante.name}
                          </span>
                          <img
                            src={p.equipoVisitante.image}
                            alt={p.equipoVisitante.name}
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                      </div>
                      
                      {/* Estado del partido - fuera de la caja principal */}
                      {p.estado !== "Pendiente" && (
                        <div className={`text-xs text-center py-1 ${
                          p.estado === "Finalizado" ? "text-yellow-300 bg-purple-700" :
                          p.estado === "Suspendido" ? "text-red-300 bg-red-900" :
                          p.estado === "Postergado" ? "text-orange-300 bg-orange-900" :
                          "text-gray-300 bg-gray-700"
                        }`}>
                          {p.estado}
                        </div>
                      )}
                    </div>

                    {/* Layout para desktop */}
                    <div className="hidden md:block p-4">
                      <div className="flex flex-row justify-between items-center">
                        {/* Local */}
                        <div className="flex items-center space-x-2 w-1/4 justify-start">
                          <img
                            src={p.equipoLocal.image}
                            alt={p.equipoLocal.name}
                            className="h-10"
                          />
                          <span className="text-base font-medium">
                            {p.equipoLocal.name}
                          </span>
                        </div>
                        
                        {/* VS + goles */}
                        <div className="flex items-center justify-center w-1/2">
                          {p.estado === "Finalizado" && (
                            <h1 className="font-bold mx-2 text-xl">
                              {p.golesLocal.length}
                            </h1>
                          )}
                          <div className="font-bold mx-2">VS</div>
                          {p.estado === "Finalizado" && (
                            <h1 className="font-bold mx-2 text-xl">
                              {p.golesVisitante.length}
                            </h1>
                          )}
                        </div>
                        
                        {/* Visitante */}
                        <div className="flex items-center space-x-2 w-1/4 justify-end">
                          <span className="text-base font-medium">
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
                          p.estado === "Finalizado" ? "text-yellow-300" :
                          p.estado === "Suspendido" ? "text-red-300" :
                          p.estado === "Postergado" ? "text-orange-300" :
                          "text-gray-300"
                        }`}>
                          {p.estado}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detalle goles */}
                  {expanded && (
                    <div className="mt-2 md:mt-4 flex flex-col gap-2 md:gap-4 px-2 md:px-0 md:flex-row">
                      {/* Local */}
                      <div className="flex-1 bg-gray-800 rounded p-2">
                        <h4 className="text-white font-bold mb-2 text-center text-sm md:text-base">
                          Goles Local
                        </h4>
                        {p.golesLocal.length ? (
                          <ul className="text-white text-xs md:text-sm space-y-1">
                            {p.golesLocal.map((g, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between"
                              >
                                <span>{g.jugador?.name}</span>
                                <span>{g.minuto}&apos;</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-center text-xs md:text-sm">
                            Sin goles
                          </p>
                        )}
                      </div>
                      {/* Visitante */}
                      <div className="flex-1 bg-gray-800 rounded p-2">
                        <h4 className="text-white font-bold mb-2 text-center text-sm md:text-base">
                          Goles Visitante
                        </h4>
                        {p.golesVisitante.length ? (
                          <ul className="text-white text-xs md:text-sm space-y-1">
                            {p.golesVisitante.map((g, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between"
                              >
                                <span>{g.minuto}&apos;</span>
                                <span>{g.jugador?.name}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-center text-xs md:text-sm">
                            Sin goles
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Paginador extraído */}
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
    </div>
  );
};

export default Fixture;
