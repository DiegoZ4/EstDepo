import React, { useState, useEffect } from "react";

const Fixture = () => {
  const [partidos, setPartidos] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPartidos = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/partido`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error al obtener los partidos:", errorText);
          setPartidos([]); // Para evitar que partidos sea algo distinto a un array
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
      }
    };

    fetchPartidos();
  }, [apiUrl]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-white mb-6">
        Campeonato Sub 14, Sub 16 y Sub 19 2024
      </h1>
      <h2 className="text-lg font-medium text-center text-white mb-4">
        Fecha 18 | Libre: G. y Esgrima LP
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {partidos.map((partido, index) => (
          <div
            key={index}
            className="flex items-center relative justify-between bg-purple-800 text-white p-4 rounded-md shadow-lg"
          >
            {/* Equipo Local */}
            <div className="flex mx-5 items-center space-x-2">
              <img
                src={`path/to/logos/${partido.equipoLocal.image}`}
                alt={partido.equipoLocal.name}
                className="w-10 h-10"
              />
              <span className="font-medium ml-2">
                {partido.equipoLocal.name}
              </span>
            </div>

            {/* VS */}
            <span className="text-lg absolute left-0 right-0 justify-center text-center font-bold">
              VS
            </span>

            {/* Equipo Visitante */}
            <div className="mx-5 flex items-center space-x-2">
              <span className="mr-2 font-medium">
                {partido.equipoVisitante.name}
              </span>
              <img
                src={`path/to/logos/${partido.equipoVisitante.image}`}
                alt={partido.equipoVisitante.name}
                className="w-10 h-10"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fixture;
