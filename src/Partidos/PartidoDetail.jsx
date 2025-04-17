import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // <-- usamos useNavigate
import GolForm from "./FormularioGol";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { to } from "react-spring";

const PartidoDetail = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate(); // <-- hook para navegar "hacia atrás"
  const [partido, setPartido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGolForm, setShowGolForm] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [torneoId, setTorneoId] = useState(null);
  const [goles, setGoles] = useState([]);
  const [editGol, setEditGol] = useState(null);
  const [partidosList, setPartidosList] = useState([]);
const [currentIndex, setCurrentIndex] = useState(null);



  // 👉 Solo para primera carga (con spinner)
useEffect(() => {
  const initialLoad = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 750)); // delay estético
    await refreshData();
    setLoading(false);
  };

  initialLoad();
}, [id]);

// 👉 Refrescado sin interrumpir UX (para toggleEstado, etc.)
const refreshData = async () => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${apiUrl}/partido/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) throw new Error("Error al obtener el partido");
    const data = await response.json();
    setTorneoId(data.torneo.id);
    setPartido(data);
setGoles([...(data.golesLocal || []), ...(data.golesVisitante || [])]);

if (data.torneo?.id) {
  fetchAllPartidos(data.torneo.id);
}

  } catch (error) {
    setError(error.message);
  }
};
const fetchAllPartidos = async (torneoId) => {
  const token = localStorage.getItem("access_token");
  try {
    // 1. Traigo los partidos de este torneo
    const res = await fetch(`${apiUrl}/partido/torneo/${torneoId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    if (!res.ok) throw new Error("Error al cargar los partidos del torneo");

    const raw = await res.json();

    // 2. En algunos backends vienen agrupados por fecha: { "1": [ ... ], "2": [ ... ] }
    //    Si raw es un objeto, lo aplanamos; si ya es array, lo usamos directamente.
    const list = Array.isArray(raw) ? raw : Object.values(raw).flat();

    // 3. Guardamos la lista en el state
    setPartidosList(list);

    // 4. Buscamos la posición del partido actual
    const idx = list.findIndex((p) => p.id === Number(id));
    setCurrentIndex(idx);
  } catch (err) {
    console.error(err);
  }
};

  
  const handleAddGol = (teamId) => {
    setSelectedTeamId(teamId);
    setSelectedTorneo(partido.torneo);
    setShowGolForm(true);
  };

  const handleDeleteGol = async (golId) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/goles/${golId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
  
      if (response.ok) {
        refreshData(); // Actualiza goles
      } else {
        console.error("Error al eliminar gol:", await response.text());
      }
    } catch (err) {
      console.error("Error eliminando gol:", err);
    }
  };
  
  const toggleEstado = async (nuevoEstado) => {
    if (partido.estado === nuevoEstado) return;
  
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${apiUrl}/partido/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
  
      if (!res.ok) {
        const error = await res.text();
        console.error("Error al actualizar estado:", error);
        return;
      }
  
      refreshData(); // recarga con nuevo estado
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
    }
  };
  
  

  const handleSubmitGol = () => {
    setShowGolForm(false);
    refreshData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#141414]">
        <div style={{ animationDuration: "2s" }} className="w-12 h-12 border-4 border-[#a0f000] border-dashed rounded-full animate-spin " />
      </div>
    );
    
  }
  
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold text-center text-[#a0f000] mb-6 uppercase">
        Detalles del Partido
      </h1>

      <div className="bg-[#1f1f1f] p-6 rounded-lg shadow-md border border-[#003c3c] space-y-4">
        {/* Info general */}
        <div className="flex justify-center">
  <div className="grid grid-cols-8 gap-4 w-full text-center items-center ">
    {/* Categoria (col-span-2) */}
    <div className="col-start-2 col-end-2 flex flex-col items-center justify-center">
      <h2 className="text-sm text-[#a0f000]">Categoria</h2>
      <p className="font-semibold">{partido.category.name}</p>
    </div>

    {/* Fecha (col-span-1) */}
    <div className="col-span-1 flex flex-col items-center justify-center">
      <h2 className="text-sm text-[#a0f000]">Fecha</h2>
      <p className="font-semibold">{partido.fecha}</p>
    </div>

    {/* Torneo (col-span-3) */}
    <div className="col-span-3 flex flex-col items-center justify-center">
      <h2 className="text-sm text-[#a0f000]">Torneo</h2>
      <p className="font-semibold">{partido.torneo?.name}</p>
    </div>

    {/* Estado - toggle switch (col-span-2) */}
    <div className="col-span-1 flex flex-col items-center justify-center">
  <h2 className="text-sm text-[#a0f000] mb-2">Finalizado</h2>
  <div
    onClick={() => toggleEstado(partido.estado === "Finalizado" ? "Pendiente" : "Finalizado")}
    className={`relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer ${
      partido.estado === "Finalizado" ? "bg-[#a0f000]" : "bg-gray-600"
    }`}
  >
<div
  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
    partido.estado === "Finalizado" ? "translate-x-[1.75rem]" : "translate-x-0"
  }`}
/>
  </div>
</div>

  </div>
</div>



        {/* Equipos */}
        <div className="flex justify-between items-center mt-6">
          <div className="w-1/2 text-center border-r border-[#003c3c] pr-4">
            <h3 className="text-lg font-bold text-[#a0f000]">Equipo Local</h3>
            <p className="text-xl font-semibold">{partido.equipoLocal?.name}</p>
            <p className="text-4xl font-bold my-2">{partido.golesLocal?.length}</p>
            <button
              onClick={() => handleAddGol(partido.equipoLocal.id)}
              className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded transition"
            >
              + Agregar Gol
            </button>
          </div>

          <div className="w-1/2 text-center pl-4">
            <h3 className="text-lg font-bold text-[#a0f000]">Equipo Visitante</h3>
            <p className="text-xl font-semibold">{partido.equipoVisitante?.name}</p>
            <p className="text-4xl font-bold my-2">{partido.golesVisitante?.length}</p>
            <button
              onClick={() => handleAddGol(partido.equipoVisitante.id)}
              className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded transition"
            >
              + Agregar Gol
            </button>
          </div>
        </div>

        {/* Botón Volver */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => navigate(-1)} // <-- volvemos a la pantalla anterior
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
          >
            Volver
          </button>
        </div>

      </div>

      {/* Lista de goles */}
{goles.length > 0 && (
  <div className="mt-8">
    <h3 className="text-xl font-bold mb-2 text-center text-[#a0f000]">
      Goles Registrados
    </h3>
    <div className="space-y-2">
    {goles.map((gol) => (
  <div
    key={gol.id}
    className="flex justify-between items-center bg-[#292929] p-3 rounded-md border border-[#003c3c]"
  >
    <div>
      <p>
        <strong>Jugador:</strong> {gol.jugador?.name || "Desconocido"}
      </p>
      <p>
        <strong>Minuto:</strong> {gol.minuto}'
      </p>
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => setEditGol(gol)} // Setea el gol a editar
        className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded"
      >
        Editar
      </button>
      <button
        onClick={() => handleDeleteGol(gol.id)}
        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
      >
        Eliminar
      </button>
    </div>
  </div>
))}
{/* Navegación entre partidos */}


    </div>
  </div>
)}


      {/* Formulario de Gol */}
      {(showGolForm || editGol) && (
  <GolForm
    torneoId={selectedTorneo?.id}
    equipoId={selectedTeamId || editGol?.equipo?.id}
    partidoId={partido.id}
    gol={editGol} // si es edición, se le pasa el gol
    onSubmit={() => {
      setShowGolForm(false);
      setEditGol(null);
      refreshData();
    }}
    onClose={() => {
      setShowGolForm(false);
      setEditGol(null);
    }}
  />
)}
<div className="flex justify-between items-center mt-10">
  {/* Flecha izquierda */}
  <button
    disabled={currentIndex <= 0}
    onClick={() =>
      navigate(`/partidos/${partidosList[currentIndex - 1]?.id}`)
    }
    className={`text-4xl px-4 py-2 rounded-full transition ${
      currentIndex <= 0
        ? "opacity-30 "
        : "text-[#a0f000] hover:scale-125"
    }`}
    aria-label="Partido anterior"
  >
    <IoIosArrowBack />
  </button>

  {/* Flecha derecha */}
  <button
    disabled={
      currentIndex === null ||
      currentIndex >= partidosList.length - 1
    }
    onClick={() =>
      navigate(`/partidos/${partidosList[currentIndex + 1]?.id}`)
    }
    className={`text-4xl px-4 py-2 rounded-full transition ${
      currentIndex === null || currentIndex >= partidosList.length - 1
        ? "opacity-30 "
        : "text-[#a0f000]  hover:scale-125"
    }`}
    aria-label="Partido siguiente"
  >
    <IoIosArrowForward />
  </button>
</div>



    </div>
  );
};

export default PartidoDetail;
