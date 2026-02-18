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
  

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#a0f000] border-dashed rounded-full animate-spin" /></div>;
  if (!torneo) return <div className="p-4 text-red-400">Torneo no encontrado.</div>;

  const fechas = Array.from({ length: torneo.fechas }, (_, i) => i + 1);

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4">
      <h2 className="text-3xl font-bold text-gradient-accent">Torneo: {torneo.name}</h2>

      {fechas.map((fecha) => {
        const partidosDeFecha = partidosPorFecha[fecha] || [];

        return (
          <div
            key={fecha}
            className="glass-card !p-0 overflow-hidden"
          >
            <div className="flex justify-between items-center p-4">
              <h3 onClick={() => toggleFecha(fecha)} className="text-lg font-semibold text-white cursor-pointer hover:text-[#a0f000] transition">Fecha {fecha}</h3>
              <button
                className="btn-primary px-3 py-1.5 text-sm"
                onClick={() => handleCrearPartido(fecha)}
              >
                + Crear Partido
              </button>
            </div>
            {fechasAbiertas[fecha] && (
  partidosDeFecha.length > 0 ? (
    <div className="overflow-x-auto">
        {partidosDeFecha.length > 0 ? (
    <div className="overflow-x-auto">
    <table className="table-modern w-full">
    <thead>
    <tr>
      <th className="px-4 py-3 text-center">ID</th>
      <th className="px-4 py-3 text-center">Fecha</th>
      <th className="px-4 py-3 text-center">Categoría</th>
      <th className="px-4 py-3 text-center">Local</th>
      <th className="px-4 py-3 text-center">Visitante</th>
      <th className="px-4 py-3 text-center">Acciones</th>
    </tr>
    </thead>
    <tbody>
    {partidosDeFecha.map((partido, index) => (
      <tr
        key={partido.id}
        className="border-t border-gray-700/30 hover:bg-white/5 transition"
      >
        <td className="px-4 py-2.5 text-center text-gray-400">{partido.id}</td>
        <td className="px-4 py-2.5 text-center">{partido.fecha}</td>
        <td className="px-4 py-2.5 text-center text-gray-300">{partido.category?.name}</td>
        <td className="px-4 py-2.5 text-center">{partido.equipoLocal?.name}</td>
        <td className="px-4 py-2.5 text-center">{partido.equipoVisitante?.name}</td>
        <td className="px-4 py-2.5 text-center">
  <div className="flex justify-center gap-1.5">
    <button
      onClick={() => handleEdit(partido)}
      className="btn-outline px-2.5 py-1 text-xs"
      title="Editar"
    >
      <FaPencilAlt />
    </button>
    <button
      onClick={() => handleDelete(partido.id, partido.fecha)}
      className="btn-danger px-2.5 py-1 text-xs"
      title="Eliminar"
    >
      <FaTrashAlt />
    </button>
    <button
      onClick={() => navigate(`/partidos/${partido.id}`)}
      className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs hover:bg-blue-500/30 transition"
      title="Inspeccionar"
    >
      <FaEye />
    </button>
  </div>
</td>

      </tr>
    ))}
    </tbody>
    </table>
    </div>
    ) : (
    <p className="text-gray-500 text-sm px-4 pb-4">No hay partidos para esta fecha.</p>
    )}
    </div>
  ) : (
    <p className="text-gray-500 text-sm px-4 pb-4">No hay partidos para esta fecha.</p>
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
