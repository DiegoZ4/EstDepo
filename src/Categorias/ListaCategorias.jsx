import React from "react";
import { useNavigate } from "react-router-dom";

const ListaCategorias = ({ categorias, onEdit, onDelete }) => {
  return (

<div className="mt-2">
  <h2 className="text-2xl font-bold text-center text-gradient-accent mb-4 uppercase">
    Categorías
  </h2>
  <div className="space-y-2">
    {categorias.map((categoria) => (
      <div
        key={categoria.id}
        className="glass-card-sm p-4 flex justify-between items-center"
      >
        <span className="font-medium text-white">{categoria.name}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(categoria)}
            className="btn-outline px-3 py-1.5 text-sm"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(categoria.id)}
            className="btn-danger px-3 py-1.5 text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
  );
};

export default ListaCategorias;
