import React from "react";
import { useNavigate } from "react-router-dom"; // <--- Importar navigate

const ListaTorneos = ({ torneos, onEdit, onDelete }) => {
  const navigate = useNavigate(); // <--- Hook de navegación

  function onInspect(torneo) {
    navigate(`/torneos/inspect/${torneo.id}`); // <--- Redireccionar al ID del torneo
  }
  return (
    <div className="space-y-4">
    {torneos.map((torneo) => (
      <div
        key={torneo.id}
        className="p-4 bg-[#143c3c] border border-[#003c3c] rounded-lg shadow-md flex justify-between items-center hover:bg-[#a0f000] hover:text-black transition duration-300"
      >
        <div>
          <h2 className="text-xl font-bold text-[#a0f000] group-hover:text-black transition">
            {torneo.name}
          </h2>
          <p>Descripción: {torneo.description || "N/A"}</p>
          <p>País: {torneo.pais?.name || "N/A"}</p>
        </div>

        

        <div className="space-x-2">
        <button
            onClick={() => onInspect(torneo)}
            className="bg-blue-500 text-black px-3 py-1 rounded-md font-semibold hover:bg-yellow-400 transition"
          >
            Inspeccionar
          </button>
          <button
            onClick={() => onEdit(torneo)}
            className="bg-yellow-500 text-black px-3 py-1 rounded-md font-semibold hover:bg-yellow-400 transition"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(torneo.id)}
            className="bg-red-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    ))}
  </div>
  );
};

export default ListaTorneos;
