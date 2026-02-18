
import React from "react";

const ListaEquipos = ({ equipos, onEdit, onDelete }) => {
  return (
    <div className="space-y-3">
      {equipos.map((equipo) => (
        <div
          key={equipo.id}
          className="glass-card-sm p-4 flex justify-between items-center"
        >
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <img src={equipo.image} className="h-16 object-contain" alt={equipo.name} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{equipo.name}</h2>
              <p className="text-gray-400 text-sm">{equipo.description}</p>
              <p className="text-gray-500 text-xs mt-0.5">{equipo.pais?.name || "Sin país"}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(equipo)}
              className="btn-outline px-3 py-1.5 text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(equipo.id)}
              className="btn-danger px-3 py-1.5 text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaEquipos;
