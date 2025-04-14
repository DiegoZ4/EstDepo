import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // <-- usamos useNavigate
import GolForm from "./FormularioGol";

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
  const [goles, setGoles] = useState([]);
  const [editGol, setEditGol] = useState(null);



  const fetchPartido = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/partido/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) throw new Error("Error al obtener el partido");
      const data = await response.json();
      setPartido(data);
setGoles([...(data.golesLocal || []), ...(data.golesVisitante || [])]);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartido();
  }, [id]);

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
        fetchPartido(); // Actualiza goles
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
  
      fetchPartido(); // recarga con nuevo estado
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
    }
  };
  
  

  const handleSubmitGol = () => {
    setShowGolForm(false);
    fetchPartido();
  };

  if (loading) return <div className="text-center text-white">Cargando...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold text-center text-[#a0f000] mb-6 uppercase">
        Detalles del Partido
      </h1>

      <div className="bg-[#1f1f1f] p-6 rounded-lg shadow-md border border-[#003c3c] space-y-4">
        {/* Info general */}
        <div className="flex justify-center">
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
  <div className="flex flex-col items-center justify-center">
    <h2 className="text-sm text-[#a0f000]">Categoria</h2>
    <p className="font-semibold">{partido.category.name}</p>
  </div>

  <div className="flex flex-col items-center justify-center">
    <h2 className="text-sm text-[#a0f000]">Fecha</h2>
    <p className="font-semibold">{partido.fecha}</p>
  </div>

  <div className="flex flex-col items-center justify-center">
    <h2 className="text-sm text-[#a0f000]">Torneo</h2>
    <p className="font-semibold">{partido.torneo?.name}</p>
  </div>
    <div>
      <h2 className="text-sm text-[#a0f000] mb-1">Estado</h2>
      <div className="relative flex w-40 mx-auto border border-[#003c3c] rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-[#a0f000] transition-transform duration-300 rounded-full ${
            partido.estado === "Finalizado" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        <div
          onClick={() => toggleEstado("Pendiente")}
          className={`w-1/2 text-center z-10 py-1 font-bold cursor-pointer transition-colors ${
            partido.estado === "Pendiente" ? "text-black" : "text-[#a0f000]"
          }`}
        >
          Pendiente
        </div>
        <div
          onClick={() => toggleEstado("Finalizado")}
          className={`w-1/2 text-center z-10 py-1 font-bold cursor-pointer transition-colors ${
            partido.estado === "Finalizado" ? "text-black" : "text-[#a0f000]"
          }`}
        >
          Finalizado
        </div>
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
      fetchPartido();
    }}
    onClose={() => {
      setShowGolForm(false);
      setEditGol(null);
    }}
  />
)}

    </div>
  );
};

export default PartidoDetail;
