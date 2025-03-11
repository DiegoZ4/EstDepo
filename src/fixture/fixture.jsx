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
      <h2 className="text-lg font-medium text-center text-white mb-4">
        Fecha {currentFecha} | Libre: G. y Esgrima LP
      </h2>
      
      {/* Mensaje si no hay partidos */}
      {partidos.length === 0 && (
        <p className="text-center text-red-500 mb-4">No hay partidos para esta fecha.</p>
      )}
      
      {/* Renderizado del fixture */}
      <div className="grid grid-cols-1 gap-4">
        {partidos.map((partido, index) => (
          <div
            key={index}
            className="flex items-center relative justify-between bg-purple-800 text-white p-4 rounded-md shadow-lg"
          >
            {/* Equipo Local */}
            
  <div className="flex items-center space-x-2">
    <img
      src={partido.equipoLocal.image}
      alt={partido.equipoLocal.name}
      className="w-10  "
    />
    <span className="font-medium ml-2">{partido.equipoLocal.name}</span>
  </div>

            {/* VS */}
            <span className="text-lg absolute left-0 right-0 justify-center text-center font-bold">
              VS
            </span>

            {/* Equipo Visitante */}
            <div className="flex items-center ">
    <span className="mr-2 font-medium">{partido.equipoVisitante.name}</span>
    <img
      src={partido.equipoVisitante.image}
      alt={partido.equipoVisitante.name}
      className="w-10  "
    />
  </div>
          </div>
        ))}
      </div>
      
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
