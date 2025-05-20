import React, { useEffect, useState } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import FormularioPartido from "../Partidos/FormularioPartidos";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa";


const TorneoInspect = () => {
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [torneo, setTorneo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [partidosPorFecha, setPartidosPorFecha] = useState({});
  const [selectedPartido, setSelectedPartido] = useState(null);
  const [fechasAbiertas, setFechasAbiertas] = useState({});
const navigate = useNavigate();


  useEffect(() => {
    const fetchTorneoYPartidos = async () => {
      const token = localStorage.getItem("access_token");
      try {
        // 1. Torneo
        const torneoRes = await fetch(`${apiUrl}/torneo/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!torneoRes.ok) throw new Error(await torneoRes.text());
        const torneoData = await torneoRes.json();
        setTorneo(torneoData);

        const abiertas = {};
        for (let i = 1; i <= torneoData.fechas; i++) {
          abiertas[i] = true;
        }
        setFechasAbiertas(abiertas);
  

        // 2. Partidos agrupados por fecha
        const partidosRes = await fetch(`${apiUrl}/partido/torneo/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!partidosRes.ok) throw new Error(await partidosRes.text());
        const partidosData = await partidosRes.json();
        setPartidosPorFecha(partidosData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTorneoYPartidos();
  }, [apiUrl, id]);

  const toggleFecha = (fecha) => {
    setFechasAbiertas((prev) => ({
      ...prev,
      [fecha]: !prev[fecha],
    }));
  };
  

  const handleDelete = async (id, fecha) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${apiUrl}/partido/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      setPartidosPorFecha((prev) => ({
        ...prev,
        [fecha]: prev[fecha].filter((p) => p.id !== id),
      }));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };
  

  const handleCrearPartido = (fecha) => {
    setSelectedPartido(null);
    setSelectedFecha(fecha);
    setShowForm(true);
  };

  const handleEdit = (partido) => {
    setSelectedFecha(partido.fecha);
    setSelectedPartido(partido);
    setShowForm(true);
  };
  
  const handleSave = async (partidoData, isEdit) => {
    const token = localStorage.getItem("access_token");
  
    try {
      const method = isEdit ? "PUT" : "POST";
      const endpoint = isEdit
        ? `${apiUrl}/partido/${selectedPartido.id}`
        : `${apiUrl}/partido`;
  
      const body = {
        equipoVisitanteId: partidoData.equipoVisitanteId,
        equipoLocalId: partidoData.equipoLocalId,
        torneoId: partidoData.torneoId,
        categoriaId: partidoData.categoriaId,
        fecha: partidoData.fecha,
        date: partidoData.date,
        estado: partidoData.estado,
        group: partidoData.group, // asegurate de que este campo exista en el DTO del backend
        groupLocal: partidoData.groupLocal,
        groupVisitante: partidoData.groupVisitante
      };
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) throw new Error(await response.text());
  
      const updatedPartido = await response.json();
      const fecha = updatedPartido.fecha;
  
      setPartidosPorFecha((prev) => ({
        ...prev,
        [fecha]: isEdit
          ? prev[fecha].map((p) =>
              p.id === updatedPartido.id ? updatedPartido : p
            )
          : [...(prev[fecha] || []), updatedPartido],
      }));
    } catch (error) {
      console.error("Error guardando partido:", error);
    } finally {
      setShowForm(false);
      setSelectedPartido(null);
    }
  };
  

  if (loading) return <div className="p-4 text-white">Cargando torneo...</div>;
  if (!torneo) return <div className="p-4 text-red-500">Torneo no encontrado.</div>;

  const fechas = Array.from({ length: torneo.fechas }, (_, i) => i + 1);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-3xl font-bold text-[#a0f000]">Torneo: {torneo.name}</h2>

      {fechas.map((fecha) => {
        const partidosDeFecha = partidosPorFecha[fecha] || [];

        return (
          <div
            key={fecha}
            className="p-4 border border-[#003c3c] rounded-lg bg-[#1f1f1f] shadow-md space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 onClick={() => toggleFecha(fecha)} className="text-xl font-semibold text-white">Fecha {fecha}</h3>
              <button
                className="bg-[#a0f000] text-black font-bold px-3 py-1 rounded hover:bg-[#8cd000] transition"
                onClick={() => handleCrearPartido(fecha)}
              >
                + Crear Partido
              </button>
            </div>
            {fechasAbiertas[fecha] && (
  partidosDeFecha.length > 0 ? (
    <div className="overflow-x-auto">
      {/* ...tu tabla acá... */}
        {partidosDeFecha.length > 0 ? (
    <div className="overflow-x-auto">
    <table className="w-full text-sm text-left border-collapse border border-[#003c3c]">
    <thead className="bg-[#003c3c] text-[#a0f000] uppercase text-xs">
    <tr>
      <th className="px-4 py-2 text-center">ID</th>
      <th className="px-4 py-2 text-center">Fecha</th>
      <th className="px-4 py-2 text-center">Categoría</th>
      <th className="px-4 py-2 text-center">Local</th>
      <th className="px-4 py-2 text-center">Visitante</th>
      <th className="px-4 py-2 text-center">Acciones</th>
    </tr>
    </thead>
    <tbody>
    {partidosDeFecha.map((partido, index) => (
      <tr
        key={partido.id}
        className={`${
          index % 2 === 0 ? "bg-[#143c3c]" : "bg-[#003c3c]"
        } hover:bg-[#a0f000] hover:text-black transition duration-300`}
      >
        <td className="px-4 py-2 text-center">{partido.id}</td>
        <td className="px-4 py-2 text-center">{partido.fecha}</td>
        <td className="px-4 py-2 text-center">{partido.category?.name}</td>
        <td className="px-4 py-2 text-center">{partido.equipoLocal?.name}</td>
        <td className="px-4 py-2 text-center">{partido.equipoVisitante?.name}</td>
        <td className="px-4 py-2 text-center space-x-2">
  <button
    onClick={() => handleEdit(partido)}
    className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 transition font-semibold"
    title="Editar"
  >
    <FaPencilAlt />
  </button>
  <button
    onClick={() => handleDelete(partido.id, partido.fecha)}
    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition font-semibold"
    title="Eliminar"
  >
    <FaTrashAlt />
  </button>
  <button
    onClick={() => navigate(`/partidos/${partido.id}`)}
    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400 transition font-semibold"
    title="Inspeccionar"
  >
    <FaEye />
  </button>
</td>

      </tr>
    ))}
    </tbody>
    </table>
    </div>
    ) : (
    <p className="text-gray-400 text-sm">No hay partidos para esta fecha.</p>
    )}
    </div>
  ) : (
    <p className="text-gray-400 text-sm">No hay partidos para esta fecha.</p>
  )
)}



          </div>
        );
      })}

      {showForm && (
        <FormularioPartido
  setCreator={setShowForm}
  selectedPartido={selectedPartido} // <-- antes estaba null
  onSave={handleSave}
  initialFecha={selectedFecha}
  torneoInfo={{ id: torneo.id, name: torneo.name }}
/>

      )}
    </div>
  );
};

export default TorneoInspect;
