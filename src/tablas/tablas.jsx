import React, { useState, useEffect } from "react";

const Tablas = ({ torneoId, categoriaId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    console.log("🔍 Verificando parámetros - torneoId:", torneoId, "categoriaId:", categoriaId);
    
    if (!torneoId || !categoriaId) {
      console.warn("⚠️ Falta torneoId o categoriaId. No se cargará la tabla.");
      setLoading(false);
      return;
    }
  
    const fetchTablaAgrupada = async () => {
      console.log("🔄 Iniciando carga de tabla...");
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const url = `${apiUrl}/torneo/${torneoId}/tabla/${categoriaId}`;
        console.log("📡 Haciendo request a:", url);
        
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
  
        console.log("📥 Respuesta recibida - Status:", response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Error del servidor:", errorText);
          throw new Error("No se pudo obtener la tabla");
        }
  
        const tabla = await response.json();
        console.log("✅ Tabla obtenida:", tabla);
        console.log("📊 Tipo de datos recibidos:", typeof tabla, Array.isArray(tabla) ? "Array" : "Object");
        console.log("📦 Claves del objeto:", Object.keys(tabla));
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
        console.log("✅ Grupos ordenados:", sortedGrupos);

      } catch (err) {
        console.error("❌ Error al cargar la tabla:", err);
        console.error("❌ Detalles del error:", err.message);
      } finally {
        console.log("🏁 Finalizando carga - setLoading(false)");
        setLoading(false);
      }
    };
  
    fetchTablaAgrupada();
  }, [apiUrl, torneoId, categoriaId]);
  

  if (loading) return <div className="text-white text-center">Cargando tabla...</div>;

  if (!grupos || grupos.length === 0) {
    return (
      <div className="text-white text-center p-8">
        <p className="text-xl mb-2">No hay datos de tabla disponibles</p>
        <p className="text-gray-400 text-sm">
          TorneoId: {torneoId} | CategoríaId: {categoriaId}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Verifica la consola del navegador (F12) para más detalles
        </p>
      </div>
    );
  }

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
  {items[grupo].map((row, index) => (
    <tr
      key={index}
      className={index % 2 === 0 ? "bg-purple-900" : "bg-purple-800"}
    >
      <td className="px-4 py-2 w-1">{index + 1}</td>
      
      {/* Aquí pongo la imagen y el nombre */}
      <td className="px-4 py-2 flex items-center space-x-2">
        <div className="w-9 flex justify-center">
        <img
          src={row.equipo.image}
          alt={row.equipo.name}
          className="h-9 object-cover"
        />

        </div>
        <span className="w-20">{row.equipo.name}</span>
      </td>

      <td className="px-4 py-2">{row.Pts}</td>
      <td className="px-4 py-2">{row.PJ}</td>
      <td className="px-4 py-2">{row.PG}</td>
      <td className="px-4 py-2">{row.PE}</td>
      <td className="px-4 py-2">{row.PP}</td>
      <td className="px-4 py-2">{row.GF}</td>
      <td className="px-4 py-2">{row.GC}</td>
      <td className="px-4 py-2">{row.DIF}</td>
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
