import React, { useState, useEffect } from "react";

const Goleadores = () => {
  const apiUrl = "http://localhost:3000";
  const [goleadores, setGoleadores] = useState([]);

  console.log(goleadores);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/jugador/goleadores`);
        const data = await response.json();
        setGoleadores(data);
      } catch (error) {
        console.error(`Oh no, ocurrió un error: ${error}`);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-[#141414] text-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase tracking-wide">
        Tabla de Goleadores | Torneo de Reserva 2024
      </h1>
  
      <div className="overflow-x-auto shadow-lg rounded-lg border border-[#003c3c]">
        <table className="w-full text-sm text-left text-white">
          <thead className="bg-[#003c3c] text-[#a0f000] uppercase text-xs">
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
                  index % 2 === 0 ? "bg-[#143c3c]" : "bg-[#003c3c]"
                } hover:bg-[#a0f000] hover:text-black transition duration-300`}
              >
                <td className="px-4 py-3 font-bold text-center">{index + 1}</td>
                <td className="px-4 py-3 text-center">{goleador.jugadorname}</td>
                <td className="px-4 py-3 text-center">{goleador.equiponame}</td>
                <td className="px-4 py-3 text-center">{goleador.categorianame}</td>
                <td className="px-4 py-3 text-center font-semibold">
                  {goleador.totalgoles}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
};

export default Goleadores;
