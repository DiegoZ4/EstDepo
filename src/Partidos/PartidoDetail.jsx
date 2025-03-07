import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import GolForm from "./FormularioGol";

const PartidoDetail = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const [partido, setPartido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGolForm, setShowGolForm] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTorneo, setSelectedTorneo] = useState(null);

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
      if (!response.ok) {
        throw new Error("Error al obtener el partido");
      }
      const data = await response.json();
      setPartido(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPartido();
  }, [id, apiUrl]);

  const handleAddGol = (teamId) => {
    setSelectedTeamId(teamId);
    setSelectedTorneo(partido.torneo);
    setShowGolForm(true);
  };

  const handleSubmitGol = async (golData) => {
    setShowGolForm(false);
    fetchPartido();
  };

  if (loading)
    return <div className="text-center text-white">Cargando...</div>;
  if (error)
    return (
      <div className="text-center text-red-500">Error: {error}</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold text-center text-[#a0f000] mb-6 uppercase">
        Detalles del Partido
      </h1>

      <div className="bg-[#1f1f1f] p-6 rounded-lg shadow-md border border-[#003c3c] space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <h2 className="text-sm text-[#a0f000]">Categoria</h2>
            <p className="font-semibold">{partido.category.name}</p>
          </div>
          <div>
            <h2 className="text-sm text-[#a0f000]">Fecha</h2>
            <p className="font-semibold">{partido.fecha}</p>
          </div>
          <div>
            <h2 className="text-sm text-[#a0f000]">Torneo</h2>
            <p className="font-semibold">{partido.torneo?.name}</p>
          </div>
          <div>
            <h2 className="text-sm text-[#a0f000]">Estado</h2>
            <p
              className={`font-bold ${
                partido.estado === "Finalizado"
                  ? "text-green-500"
                  : "text-yellow-400"
              }`}
            >
              {partido.estado}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="w-1/2 text-center border-r border-[#003c3c] pr-4">
            <h3 className="text-lg font-bold text-[#a0f000]">
              Equipo Local
            </h3>
            <p className="text-xl font-semibold">
              {partido.equipoLocal?.name}
            </p>
            <p className="text-4xl font-bold my-2">
              {partido.golesLocal?.length}
            </p>
            <button
              onClick={() => handleAddGol(partido.equipoLocal.id)}
              className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded transition"
            >
              + Agregar Gol
            </button>
          </div>

          <div className="w-1/2 text-center pl-4">
            <h3 className="text-lg font-bold text-[#a0f000]">
              Equipo Visitante
            </h3>
            <p className="text-xl font-semibold">
              {partido.equipoVisitante?.name}
            </p>
            <p className="text-4xl font-bold my-2">
              {partido.golesVisitante?.length}
            </p>
            <button
              onClick={() => handleAddGol(partido.equipoVisitante.id)}
              className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded transition"
            >
              + Agregar Gol
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Link to="/partidos">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
              Volver
            </button>
          </Link>
        </div>
      </div>

      {showGolForm && (
        <GolForm
          torneoId={selectedTorneo?.id}
          equipoId={selectedTeamId}
          partidoId={partido.id}
          onSubmit={handleSubmitGol}
          onClose={() => setShowGolForm(false)}
        />
      )}
    </div>
  );
};

export default PartidoDetail;
