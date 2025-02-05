import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ListaPartidos = ({ partidos, onEdit, onDelete, handleShowCreator, onDetails }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse border border-[#003c3c]">
        <thead className="bg-[#003c3c] text-[#a0f000] uppercase text-xs">
          <tr>
            <th className="px-4 py-2 text-center">ID</th>
            <th className="px-4 py-2 text-center">Fecha</th>
            <th className="px-4 py-2 text-center">Local</th>
            <th className="px-4 py-2 text-center">Visitante</th>
            <th className="px-4 py-2 text-center">Torneo</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((partido, index) => (
            <tr
              key={partido.id}
              className={`${
                index % 2 === 0 ? "bg-[#143c3c]" : "bg-[#003c3c]"
              } hover:bg-[#a0f000] hover:text-black transition duration-300`}
            >
              <td className="px-4 py-2 text-center">{partido.id}</td>
              <td className="px-4 py-2 text-center">{partido.fecha}</td>
              <td className="px-4 py-2 text-center">{partido.equipoLocal?.name}</td>
              <td className="px-4 py-2 text-center">{partido.equipoVisitante?.name}</td>
              <td className="px-4 py-2 text-center">{partido.torneo?.name}</td>
              <td className="px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => onEdit(partido)}
                  className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 transition font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(partido.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition font-semibold"
                >
                  Eliminar
                </button>
                <Link to={`/partidos/${partido.id}`}>
                  <button
                    onClick={() => onDetails()}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400 transition font-semibold"
                  >
                    Inspeccionar
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
};

export default ListaPartidos;
