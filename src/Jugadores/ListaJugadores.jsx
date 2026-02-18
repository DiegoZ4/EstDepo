import React from "react";
import { FiUser } from "react-icons/fi";

const ListaJugadores = ({ jugadores, onEdit, onDelete }) => {
  return (
    <div className="space-y-3">
      {jugadores.map((jugador) => (
        <div
          key={jugador.id}
          className="glass-card-sm p-4 flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            {jugador.image ? (
              <img
                src={jugador.image}
                alt={jugador.name}
                className="w-14 h-14 object-cover rounded-xl"
              />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-white/10">
                <FiUser className="text-gray-400 text-xl" />
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-white">
                {jugador.name}
              </p>
              <p className="text-gray-400 text-sm">Posición: {jugador.posicion}</p>
              <p className="text-gray-500 text-xs">Equipo: {jugador.equipo?.name || "Sin equipo"}</p>
              <p className="text-gray-500 text-xs">País: {jugador.pais?.name || "Sin país"}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(jugador)}
              className="btn-outline px-3 py-1.5 text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(jugador.id)}
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

export default ListaJugadores;
