import React, { useState, useEffect } from "react";
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
    
    <div className="max-w-4xl mx-auto p-4">

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
      <h1 className="text-2xl pt-6 font-bold text-center text-white mb-6">
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
        <div key={grupo} className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">
            Grupo {grupo}
          </h3>
          <div className="space-y-4">
            {gruposMap[grupo].map((p, i) => {
              const key = `${grupo}-${i}`;
              const expanded = expandedIndex === key;
              return (
                <div key={key}>
                  <div
                    onClick={() =>
                      setExpandedIndex(expanded ? null : key)
                    }
                    className="flex flex-col cursor-pointer bg-purple-800 text-white p-4 rounded shadow-lg"
                  >
                    {/* Flex container responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      {/* Local */}
                      <div className="flex items-center space-x-2 w-full sm:w-1/4 justify-center sm:justify-start mb-2 sm:mb-0">
                        <img
                          src={p.equipoLocal.image}
                          alt={p.equipoLocal.name}
                          className="h-10"
                        />
                        <span className="text-sm sm:text-base font-medium">
                          {p.equipoLocal.name}
                        </span>
                      </div>
                      {/* VS + goles */}
                      <div className="flex items-center justify-center w-full sm:w-1/2 mb-2 sm:mb-0">
                        {p.estado === "Finalizado" && (
                          <h1 className="font-bold mx-2 text-lg sm:text-xl">
                            {p.golesLocal.length}
                          </h1>
                        )}
                        <div className="font-bold mx-2">VS</div>
                        {p.estado === "Finalizado" && (
                          <h1 className="font-bold mx-2 text-lg sm:text-xl">
                            {p.golesVisitante.length}
                          </h1>
                        )}
                      </div>
                      {/* Visitante */}
                      <div className="flex items-center space-x-2 w-full sm:w-1/4 justify-center sm:justify-end mb-2 sm:mb-0">
                        <span className="text-sm sm:text-base font-medium">
                          {p.equipoVisitante.name}
                        </span>
                        <img
                          src={p.equipoVisitante.image}
                          alt={p.equipoVisitante.name}
                          className="h-10"
                        />
                      </div>
                    </div>
                    {/* Estado finalizado */}
                    {p.estado === "Finalizado" && (
                      <div className="text-sm text-yellow-300 text-center mt-2">
                        Finalizado
                      </div>
                    )}
                  </div>

                  {/* Detalle goles */}
                  {expanded && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                      {/* Local */}
                      <div className="flex-1 bg-gray-800 rounded p-2">
                        <h4 className="text-white font-bold mb-2 text-center">
                          Goles Local
                        </h4>
                        {p.golesLocal.length ? (
                          <ul className="text-white text-sm space-y-1">
                            {p.golesLocal.map((g, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between"
                              >
                                <span>{g.jugador?.name}</span>
                                <span>{g.minuto}'</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-center">
                            Sin goles
                          </p>
                        )}
                      </div>
                      {/* Visitante */}
                      <div className="flex-1 bg-gray-800 rounded p-2">
                        <h4 className="text-white font-bold mb-2 text-center">
                          Goles Visitante
                        </h4>
                        {p.golesVisitante.length ? (
                          <ul className="text-white text-sm space-y-1">
                            {p.golesVisitante.map((g, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between"
                              >
                                <span>{g.minuto}'</span>
                                <span>{g.jugador?.name}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-center">
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
