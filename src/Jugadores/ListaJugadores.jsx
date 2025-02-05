import React,{ useState, useEffect } from "react";




const ListaJugadores = ({ jugadores, onEdit, onDelete }) => {
  return (
<div className="w-3/5 space-y-4">
  {jugadores.map((jugador) => (
    <div
      key={jugador.id}
      className="p-4 bg-[#143c3c] border border-[#003c3c] rounded-lg shadow-md flex justify-between items-center hover:bg-[#a0f000] hover:text-black transition duration-300 group"
    >
      <div>
        <p className="text-xl font-bold text-[#a0f000] group-hover:text-black transition duration-300">
          {jugador.name}
        </p>
        <p>Posición: {jugador.posicion}</p>
        <p>Equipo: {jugador.equipo?.name || "Sin equipo"}</p>
        <p>País: {jugador.pais?.name || "Sin país"}</p>
      </div>
      <div className="space-x-2">
        <button
          onClick={() => onEdit(jugador)}
          className="bg-yellow-500 text-black px-3 py-1 rounded-md font-semibold hover:bg-yellow-400 transition"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(jugador.id)}
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

export default ListaJugadores;
