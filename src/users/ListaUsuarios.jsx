import React from "react";
import { FiStar, FiXCircle } from "react-icons/fi";

const ListaUsuarios = ({ usuarios, onEdit, onDelete, onCancelSubscription }) => {
  const isSubscribed = (usuario) => {
    return usuario.subscriptionStatus === "active" || 
           usuario.subscriptionStatus === "authorized" || 
           usuario.is_premium === true;
  };

  return (
    <div className="space-y-3">
      {usuarios.map((usuario) => (
        <div 
          key={usuario.id}
          className="glass-card-sm p-4 flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{usuario.name}</h2>
              {isSubscribed(usuario) && (
                <span className="text-[10px] bg-[#a0f000]/20 text-[#a0f000] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <FiStar className="w-3 h-3" /> PREMIUM
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">Email: {usuario.email}</p>
            <p className="text-gray-400 text-sm">Rol: <span className="text-[#a0f000]">{usuario.rol}</span></p>
            {usuario.bornDate && (
              <p className="text-gray-400 text-sm">
                Nacimiento: {new Date(usuario.bornDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => onEdit(usuario)}
              className="btn-outline px-3 py-1.5 text-sm"
            >
              Editar
            </button>
            {isSubscribed(usuario) && (
              <button 
                onClick={() => onCancelSubscription(usuario.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-xl text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10 transition"
              >
                <FiXCircle className="w-3.5 h-3.5" /> Cancelar Sub
              </button>
            )}
            <button 
              onClick={() => onDelete(usuario.id)}
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

export default ListaUsuarios;
