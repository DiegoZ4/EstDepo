import React from "react";
import { useNavigate } from "react-router-dom";

const ListaTorneos = ({ torneos, onEdit, onDelete }) => {
  const navigate = useNavigate();

  function onInspect(torneo) {
    navigate(`/torneos/inspect/${torneo.id}`);
  }
  return (
    <div className="space-y-3">
      {torneos.map((torneo) => (
        <div
          key={torneo.id}
          className="glass-card-sm p-4 flex justify-between items-center hover:border-[#a0f000]/30 transition-all duration-200 group"
        >
          <div>
            <h2 className="text-lg font-bold text-[#a0f000] group-hover:text-[#b8ff33] transition">
              {torneo.name}
            </h2>
            <p className="text-sm text-gray-400">Descripción: {torneo.description || "N/A"}</p>
            <p className="text-sm text-gray-500">País: {torneo.pais?.name || "N/A"}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onInspect(torneo)}
              className="btn-outline px-3 py-1.5 text-xs"
            >
              Inspeccionar
            </button>
            <button
              onClick={() => onEdit(torneo)}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(torneo.id)}
              className="btn-danger px-3 py-1.5 text-xs"
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
