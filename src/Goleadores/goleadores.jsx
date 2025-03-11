import React, { useState, useEffect } from "react";

const Goleadores = ({ torneoId, categoriaId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [goleadores, setGoleadores] = useState([]);
  const [torneo, setTorneo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!torneoId || !categoriaId) return;
    const fetchGoleadores = async () => {
      const token = localStorage.getItem("access_token");
      setLoading(true);
      try {
        const response = await fetch(
          `${apiUrl}/torneo/${torneoId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          }
        const data = await response.json();
        setTorneo(data);
      } catch (error) {
        console.error("Error fetching torneo:", error);
      }
      try {

        // Se asume que el endpoint acepta los parámetros vía query string
        const response = await fetch(
          `${apiUrl}/jugador/ranking?torneoId=${torneoId}&categoriesIds=${categoriaId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error al obtener goleadores:", errorText);
          setGoleadores([]);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setGoleadores(data);
        } else {
          console.error("Respuesta inesperada:", data);
          setGoleadores([]);
        }
      } catch (error) {
        console.error("Error al obtener goleadores:", error);
      } finally {
        console.log("Goleadores:", goleadores);
        setLoading(false);
      }
    };

    fetchGoleadores();
  }, [apiUrl, torneoId, categoriaId]);

  if (loading) {
    return <div>Loading Goleadores...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-[#141414] text-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase tracking-wide">
        {torneo ? torneo.titulo : "Torneo no encontrado"}
      </h1>

      <div className="overflow-x-auto shadow-lg rounded-lg border border-[#003c3c]">
        <table className="w-full text-sm text-left text-white">
          <thead className="bg-purple-700 text-xs uppercase text-gray-100">
            <tr>
              <th className="px-4 py-3 text-center">#</th>
              <th className="px-4 py-3 text-center">Jugador</th>
              <th className="px-4 py-3 text-center">Equipo</th>
              <th className="px-4 py-3 text-center">Categoría</th>
              <th className="px-4 py-3 text-center">Goles</th>
            </tr>
          </thead>
          <tbody>
            {goleadores.map((goleador, index) => (
              <tr
                key={goleador.jugadorid}
                className={`${
                  index % 2 === 0 ? "bg-purple-900" : "bg-purple-800"
                } hover:bg-green-500 hover:text-black transition duration-300`}
              >
                <td className="px-4 py-3 font-bold text-center">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-center">{goleador.jugadorname}</td>
                <td className="px-4 py-3 text-center">{goleador.equiponame}</td>
                <td className="px-4 py-3 text-center">{goleador.categoriajugador}</td>
                <td className="px-4 py-3 text-center font-semibold">{goleador.totalgoles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goleadores;
