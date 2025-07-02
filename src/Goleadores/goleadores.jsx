import React, { useState, useEffect } from "react";

const Goleadores = ({ torneoId, categoriaId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [goleadores, setGoleadores] = useState([]);
  const [torneo, setTorneo] = useState(null);
  const [equiposMap, setEquiposMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1) Traer torneo y ranking de goleadores, asignar rank a cada uno
  useEffect(() => {
    if (!torneoId || !categoriaId) return;

    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      try {
        // Traigo info del torneo
        const resT = await fetch(`${apiUrl}/torneo/${torneoId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        });
        if (resT.ok) {
          const dto = await resT.json();
          setTorneo(dto);
        }

        // Traigo ranking de goleadores
        const resG = await fetch(
          `${apiUrl}/jugador/ranking?torneoId=${torneoId}&categoriesIds=${categoriaId}`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        if (resG.ok) {
          const data = await resG.json();
          if (Array.isArray(data)) {
            // Añadir rank según posición original
            const withRank = data.map((g, idx) => ({ ...g, rank: idx + 1 }));
            setGoleadores(withRank);
          } else {
            setGoleadores([]);
          }
        } else {
          console.error("Error al obtener goleadores:", await resG.text());
          setGoleadores([]);
        }
      } catch (err) {
        console.error(err);
        setGoleadores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, torneoId, categoriaId]);

  // 2) Fetch de cada equipo para obtener imagen
  useEffect(() => {
    if (goleadores.length === 0) return;

    const ids = [...new Set(goleadores.map(g => g.equipoid))];
    const token = localStorage.getItem("access_token");

    Promise.all(
      ids.map(id =>
        fetch(`${apiUrl}/equipo/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        })
          .then(res => (res.ok ? res.json() : null))
          .then(equipo => [id, equipo])
      )
    )
      .then(results => {
        const map = {};
        results.forEach(([id, equipo]) => {
          if (equipo) map[id] = equipo;
        });
        setEquiposMap(map);
      })
      .catch(err => console.error("Error fetch equipos:", err));
  }, [apiUrl, goleadores]);

  if (loading) {
    return <div>Loading Goleadores...</div>;
  }

  // Filtrado por nombre y orden por rank
  const filtered = goleadores
    .filter(g =>
      g.jugadorname.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-[#141414] text-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase tracking-wide">
        {torneo ? torneo.titulo : "Torneo no encontrado"}
      </h1>

      {/* Buscador */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-3 py-2 rounded bg-[#1f1f1f] border border-[#003c3c] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
        />
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg border border-[#003c3c]">
        <table className="w-full text-sm text-white">
          <thead className="bg-purple-700 text-xs uppercase text-gray-100">
            <tr>
              <th className="px-4 py-3 text-center">#</th>
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-center">Equipo</th>
              <th className="px-4 py-3 text-center">Goles</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
                  No se encontraron resultados.
                </td>
              </tr>
            )}

            {filtered.map(g => {
              const equipo = equiposMap[g.equipoid];
              return (
                <tr
                  key={g.jugadorid}
                  className={`${
                    g.rank % 2 === 0 ? "bg-purple-900" : "bg-purple-800"
                  } hover:bg-green-500 hover:text-black transition duration-300`}
                >
                  <td className="px-4 py-3 text-center font-bold">{g.rank}</td>
                  <td className="px-4 py-3 text-left">{g.jugadorname}</td>
                  <td className="px-4 py-3 text-center flex items-center justify-center space-x-2">
                    <div className="w-1/4"></div>
                    <div className="flex items-center w-1/2 space-x-2">
                    {equipo && (
                      <img
                        src={equipo.image}
                        alt={equipo.name}
                        className="h-auto w-6 object-cover"
                      />
                    )}
                    <span>{equipo ? equipo.name : g.equiponame}</span>

                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    {g.totalgoles}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goleadores;
