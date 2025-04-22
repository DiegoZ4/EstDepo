import React, { useState, useEffect } from "react";

const Tablas = ({ torneoId, categoriaId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    if (!torneoId || !categoriaId) return;
  
    const fetchTablaAgrupada = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${apiUrl}/torneo/${torneoId}/tabla/${categoriaId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
  
        if (!response.ok) throw new Error("No se pudo obtener la tabla");
  
        const tabla = await response.json();
        setItems(tabla);
        // Extrae y ordena las claves en orden numérico cuando sean números,
// o lexicográfico cuando no lo sean.
const sortedGrupos = Object.keys(tabla).sort((a, b) => {
  const na = parseInt(a, 10);
  const nb = parseInt(b, 10);
  const aEsNum = !isNaN(na);
  const bEsNum = !isNaN(nb);

  if (aEsNum && bEsNum) {
    // Ambos son numéricos → comparo numéricamente
    return na - nb;
  } else if (aEsNum) {
    // Sólo 'a' es numérico → va antes
    return -1;
  } else if (bEsNum) {
    // Sólo 'b' es numérico → va antes
    return 1;
  } else {
    // Ninguno es numérico → comparo como strings
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  }
});
setGrupos(sortedGrupos);

      } catch (err) {
        console.error("Error al cargar la tabla:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTablaAgrupada();
  }, [apiUrl, torneoId, categoriaId]);
  

  if (loading) return <div className="text-white text-center">Cargando tabla...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">


      {grupos.map((grupo) => (
        <div key={grupo} className="mb-6">
          <h2 className="text-xl font-semibold text-[#a0f000] mb-2 text-center">
            Grupo {grupo}
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm text-left text-white">
              <thead className="bg-purple-700 text-xs uppercase text-gray-100">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Club</th>
                  <th className="px-4 py-2">Pts</th>
                  <th className="px-4 py-2">PJ</th>
                  <th className="px-4 py-2">PG</th>
                  <th className="px-4 py-2">PE</th>
                  <th className="px-4 py-2">PP</th>
                  <th className="px-4 py-2">GF</th>
                  <th className="px-4 py-2">GC</th>
                  <th className="px-4 py-2">DIF</th>
                </tr>
              </thead>
              <tbody>
                {items[grupo].map((equipo, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-purple-900" : "bg-purple-800"}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 w-1/6 py-2">{equipo.equipo?.name}</td>
                    <td className="px-4 py-2">{equipo.Pts}</td>
                    <td className="px-4 py-2">{equipo.PJ}</td>
                    <td className="px-4 py-2">{equipo.PG}</td>
                    <td className="px-4 py-2">{equipo.PE}</td>
                    <td className="px-4 py-2">{equipo.PP}</td>
                    <td className="px-4 py-2">{equipo.GF}</td>
                    <td className="px-4 py-2">{equipo.GC}</td>
                    <td className="px-4 py-2">{equipo.DIF}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tablas;
