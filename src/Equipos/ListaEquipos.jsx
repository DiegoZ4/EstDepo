
import React from "react";

const ListaEquipos = ({ equipos, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {equipos.map((equipo) => (
        <div
          key={equipo.id}
          className="p-4 border-2 border-[#003c3c] rounded-lg shadow-md bg-[#141414] text-white flex justify-between items-center hover:shadow-xl transition-shadow duration-300"
        >
          <div>
            <h2 className="text-xl font-bold text-[#a0f000]">{equipo.name}</h2>
            <p className="text-gray-300">Descripción: {equipo.description}</p>
            <p className="text-gray-400">País: {equipo.pais?.name || "Sin país"}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(equipo)}
              className="bg-[#a0f000] text-black px-4 py-2 rounded hover:bg-[#8cd000] transition"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(equipo.id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition"
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
