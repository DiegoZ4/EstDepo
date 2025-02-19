import React from "react";

const ListaUsuarios = ({ usuarios, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {usuarios.map((usuario) => (
        <div 
          key={usuario.id}
          className="p-4 border-2 border-[#003c3c] rounded-lg shadow-md bg-[#141414] text-white flex justify-between items-center hover:shadow-xl transition-shadow duration-300"
        >
          <div>
            <h2 className="text-xl font-bold text-[#a0f000]">{usuario.name}</h2>
            <p className="text-gray-300">Email: {usuario.email}</p>
            <p className="text-gray-300">Rol: {usuario.rol}</p>
            {usuario.bornDate && (
              <p className="text-gray-300">
                Nacimiento: {new Date(usuario.bornDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="space-x-2">
            <button 
              onClick={() => onEdit(usuario)}
              className="bg-[#a0f000] text-black px-4 py-2 rounded hover:bg-[#8cd000] transition"
            >
              Editar
            </button>
            <button 
              onClick={() => onDelete(usuario.id)}
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

export default ListaUsuarios;
