import { useState, useEffect } from "react";

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filtrado por nombre y orden por rank
  const filtered = goleadores
    .filter(g =>
      g.jugadorname.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-4">
      <h1 className="text-xl md:text-3xl font-extrabold text-center mb-4 md:mb-6 text-gradient-accent uppercase tracking-wide px-2">
        {torneo ? torneo.titulo : "Goleadores"}
      </h1>

      {/* Buscador */}
      <div className="flex justify-center mb-5 px-2">
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="input-modern w-full max-w-sm text-sm"
        />
      </div>

      <div className="px-2 md:px-0">
        <div className="glass-card overflow-hidden animate-fade-up">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="text-center w-12 md:w-16">#</th>
                <th>Jugador</th>
                <th className="text-center w-12 md:w-auto">Equipo</th>
                <th className="text-center w-16 md:w-20">Goles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500 text-sm">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}

              {filtered.map(g => {
                const equipo = equiposMap[g.equipoid];
                return (
                  <tr key={g.jugadorid}>
                    <td className="text-center font-bold text-[#a0f000]">{g.rank}</td>
                    <td>
                      <span className="text-sm font-medium">{g.jugadorname}</span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        {equipo && (
                          <img
                            src={equipo.image}
                            alt={equipo.name}
                            className="h-6 w-6 object-contain flex-shrink-0"
                          />
                        )}
                        <span className="hidden md:inline text-sm text-gray-400 truncate">
                          {equipo ? equipo.name : g.equiponame}
                        </span>
                      </div>
                    </td>
                    <td className="text-center font-bold text-white text-sm md:text-base">
                      {g.totalgoles}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Goleadores;
