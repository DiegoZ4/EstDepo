
import React from "react";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa";
const ListaPais = ({ pais, onEdit, onDelete }) => {
  return (
    <div className="glass-card !p-0 overflow-hidden">

  <table className="table-modern w-full">
    <thead>
      <tr>
        <th className="px-4 py-3">ID</th>
        <th className="px-4 py-3">Nombre</th>
        <th className="px-4 py-3">Bandera</th>
        <th className="px-4 py-3">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {pais.map((pais, index) => (
        <tr
          key={pais.id}
          className="border-t border-gray-700/30 hover:bg-white/5 transition"
        >
          <td className="px-4 py-2.5 text-gray-400">{pais.id}</td>
          <td className="px-4 py-2.5">{pais.name}</td>
          <td className="px-4 py-2.5 w-16">
            <img
              src={pais.image}
              alt={pais.name}
              className="h-8 w-12 object-cover rounded"
            />
          </td>
          <td className="px-4 py-2.5">
            <div className="flex gap-1.5">
              <button
                onClick={() => onEdit(pais)}
                className="btn-outline px-2.5 py-1 text-xs"
                title="Editar"
              >
                <FaPencilAlt />
              </button>
              <button
                onClick={() => onDelete(pais.id)}
                className="btn-danger px-2.5 py-1 text-xs"
                title="Eliminar"
              >
                <FaTrashAlt />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default ListaPais;
