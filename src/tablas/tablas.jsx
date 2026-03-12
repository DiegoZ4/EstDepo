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
  

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!grupos || grupos.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-400 mb-2">No hay datos de tabla disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-4 space-y-6">
      {grupos.map((grupo) => (
        <div key={grupo} className="glass-card overflow-hidden animate-fade-up">
          <div className="px-5 py-3 border-b border-gray-700/40">
            <h2 className="text-lg font-bold text-[#a0f000]">
              Grupo {grupo}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="w-10 text-center">#</th>
                  <th>Club</th>
                  <th className="text-center">Pts</th>
                  <th className="text-center">PJ</th>
                  <th className="text-center">PG</th>
                  <th className="text-center">PE</th>
                  <th className="text-center">PP</th>
                  <th className="text-center">GF</th>
                  <th className="text-center">GC</th>
                  <th className="text-center">DIF</th>
                </tr>
              </thead>
              <tbody>
                {items[grupo].map((row, index) => (
                  <tr key={index}>
                    <td className="text-center font-bold text-[#a0f000]">{index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center flex-shrink-0">
                          <img
                            src={row.equipo.image}
                            alt={row.equipo.name}
                            className="h-8 object-cover"
                          />
                        </div>
                        <span className="font-medium text-white">{row.equipo.name}</span>
                      </div>
                    </td>
                    <td className="text-center font-bold text-white">{row.Pts}</td>
                    <td className="text-center">{row.PJ}</td>
                    <td className="text-center">{row.PG}</td>
                    <td className="text-center">{row.PE}</td>
                    <td className="text-center">{row.PP}</td>
                    <td className="text-center">{row.GF}</td>
                    <td className="text-center">{row.GC}</td>
                    <td className={`text-center font-semibold ${row.DIF > 0 ? 'text-green-400' : row.DIF < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {row.DIF > 0 ? `+${row.DIF}` : row.DIF}
                    </td>
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
