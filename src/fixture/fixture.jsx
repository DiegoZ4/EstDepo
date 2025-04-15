import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Fixture = () => {
  // Extraemos los parámetros de la URL: torneoId, categoriaId y fecha (si no existe, se usa 1)
  const { torneoId, categoriaId, fecha: initialFecha } = useParams();
  const navigate = useNavigate();

  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFecha, setCurrentFecha] = useState(
    initialFecha ? Number(initialFecha) : 1
  );
  

  const [expandedIndex, setExpandedIndex] = useState(null); // para mostrar goles

  const [maxFecha, setMaxFecha] = useState(null);
  const [torneo, setTorneo] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Obtener datos del torneo (incluye nombre y matchdays máximos)
  useEffect(() => {
    const fetchTorneo = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/torneo/${torneoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          console.error("Error fetching torneo:", await response.text());
          return;
        }
        const data = await response.json();
        setTorneo(data);
        // Suponemos que data.fechas es el número máximo de matchdays
        setMaxFecha(data.fechas || 1);
      } catch (error) {
        console.error("Error fetching torneo:", error);
      }
    };

    fetchTorneo();
  }, [apiUrl, torneoId]);

  // Fetch de fixture según torneo, categoría y fecha (matchday)
  useEffect(() => {
    if (!torneoId || !categoriaId || !currentFecha) return;
    const fetchFixture = async () => {
      const token = localStorage.getItem("access_token");
      setLoading(true);
      try {
        const response = await fetch(
          `${apiUrl}/partido/${torneoId}/fixture/${categoriaId}/${currentFecha}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error al obtener los partidos:", errorText);
          setPartidos([]);
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setPartidos(data);
        } else {
          console.error("Respuesta inesperada:", data);
          setPartidos([]);
        }
      } catch (error) {
        console.error("Error al obtener los partidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFixture();
    // Actualizamos la URL para reflejar el matchday actual
    navigate(`/torneo/${torneoId}/fixture/${categoriaId}/${currentFecha}`, { replace: true });
  }, [apiUrl, torneoId, categoriaId, currentFecha, navigate]);

  // Funciones de navegación entre fechas
  const goToFirst = () => {
    setCurrentFecha(1);
  };

  const goToPrev = () => {
    if (currentFecha > 1) {
      setCurrentFecha(currentFecha - 1);
    }
  };

  const goToNext = () => {
    if (maxFecha && currentFecha < maxFecha) {
      setCurrentFecha(currentFecha + 1);
    }
  };

  const goToLast = () => {
    if (maxFecha) {
      setCurrentFecha(maxFecha);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Título con nombre del torneo */}
      <h1 className="text-2xl font-bold text-center text-white mb-6">
        {torneo ? torneo.name : "Torneo"}
      </h1>
      {/* Encabezado que muestra la fecha (matchday) */}

      
      {/* Mensaje si no hay partidos */}
      {partidos.length === 0 && (
        <p className="text-center text-red-500 mb-4">No hay partidos para esta fecha.</p>
      )}
      
{/* Renderizado del fixture agrupado por grupos */}

{Object.entries(
  partidos.reduce((acc, partido) => {
    const grupo = partido.group || "Sin grupo";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(partido);
    return acc;
  }, {})
).map(([grupo, listaPartidos]) => (
  <div key={grupo} className="mb-6">
    <h3 className="text-xl font-bold text-white mb-2">Grupo {grupo}</h3>
    <div className="grid grid-cols-1 gap-4">
    {listaPartidos.map((partido, index) => {
  const indexKey = `${grupo}-${index}`;
  const isExpanded = expandedIndex === indexKey;

  return (
    <div key={index}>
      {/* Bloque clickeable */}
      <div
        onClick={() => setExpandedIndex(isExpanded ? null : indexKey)}
        className="flex flex-col cursor-pointer bg-purple-800 text-white p-4 rounded-md shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center h-full w-1/4 space-x-2">
            <img src={partido.equipoLocal.image} alt={partido.equipoLocal.name} className="h-10" />
            <span className="font-medium">{partido.equipoLocal.name}</span>
            
          </div>
          <div className="flex w-1/2 items-center justify-center">
          {partido.estado === "Finalizado" && (
  <h1 className="font-bold mx-4 text-lg">{partido.golesLocal.length}</h1>
)}

          <div className="text-center font-bold">VS</div>
          {partido.estado === "Finalizado" && (
  <h1 className="font-bold mx-4 text-lg">{partido.golesVisitante.length}</h1>
)}
</div>

          <div className="flex  justify-end items-center h-full w-1/4 space-x-2">
            <span className="font-medium">{partido.equipoVisitante.name}</span>
            <img src={partido.equipoVisitante.image} alt={partido.equipoVisitante.name} className="h-10" />
          </div>
        </div>

        {partido.estado === "Finalizado" && (
          <div className="text-sm text-yellow-300 text-center mt-2">
            Finalizado 
          </div>
        )}
      </div>

      {isExpanded && (
  <div className="mt-4 flex justify-between gap-4">
    {/* Goles Local */}
    <div className="w-1/2 bg-gray-800 rounded p-2">
      <h4 className="text-white font-bold mb-2 text-center">Goles Local</h4>
      {partido.golesLocal?.length > 0 ? (
        <ul className="text-white text-sm space-y-1">
          {partido.golesLocal.map((gol, i) => (
            <li key={i} className="flex justify-between">
              <span>{gol.jugador?.name}</span>
              <span>{gol.minuto}'</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm text-center">Sin goles</p>
      )}
    </div>

    {/* Goles Visitante */}
    <div className="w-1/2 bg-gray-800 rounded p-2">
      <h4 className="text-white font-bold mb-2 text-center">Goles Visitante</h4>
      {partido.golesVisitante?.length > 0 ? (
        <ul className="text-white text-sm space-y-1">
          {partido.golesVisitante.map((gol, i) => (
            <li key={i} className="flex justify-between">
              <span>{gol.minuto}'</span>
              <span>{gol.jugador?.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm text-center">Sin goles</p>
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

      
      {/* Controles de navegación de fechas */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={goToFirst}
          disabled={currentFecha === 1}
          className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          {"<<"}
        </button>
        <button
          onClick={goToPrev}
          disabled={currentFecha === 1}
          className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          {"<"}
        </button>
        <span className="px-4 py-2 text-white">{currentFecha}</span>
        <button
          onClick={goToNext}
          disabled={maxFecha ? currentFecha === maxFecha : false}
          className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          {">"}
        </button>
        <button
          onClick={goToLast}
          disabled={maxFecha ? currentFecha === maxFecha : false}
          className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default Fixture;
