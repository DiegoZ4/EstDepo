
import React from "react";

const ListaPais = ({ pais, onEdit, onDelete }) => {
  return (
    <div className="w-4/5 mx-auto bg-[#141414] p-4 rounded-lg shadow-md text-white border border-[#003c3c]">
  <div className="mb-4 flex justify-end">
  </div>

  <table className="w-full text-sm text-left border-collapse">
    <thead className="bg-[#003c3c] text-[#a0f000] uppercase text-xs">
      <tr>
        <th className="px-4 py-2">ID</th>
        <th className="px-4 py-2">Nombre</th>
        <th className="px-4 py-2">Bandera</th>
        <th className="px-4 py-2">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {pais.map((pais, index) => (
        <tr
          key={pais.id}
          className={`${
            index % 2 === 0 ? "bg-[#143c3c]" : "bg-[#003c3c]"
          } hover:bg-[#a0f000] hover:text-black transition duration-300`}
        >
          <td className="px-4 py-2">{pais.id}</td>
          <td className="px-4 py-2">{pais.name}</td>
          <td className="px-4 py-2  w-20 overflow-hidden">
            <img
              src={pais.image}
              alt={pais.name}
              className="h-full w-full object-cover rounded"
            />
          </td>
          <td className="px-4 py-2 space-x-2">
          <button
              onClick={() => onEdit(pais)}
              className="bg-[#a0f000] text-black px-4 py-2 rounded hover:bg-[#8cd000] transition"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(pais.id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition"
            >
              Eliminar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default ListaPais;
