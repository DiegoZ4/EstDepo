import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa";

const ListaPartidos = ({ partidos, onEdit, onDelete, handleShowCreator, onDetails }) => {
  return (
    <div className="overflow-x-auto glass-card !p-0">
      <table className="table-modern w-full">
        <thead>
          <tr>
            <th className="px-4 py-3 text-center">ID</th>
            <th className="px-4 py-3 text-center">Fecha</th>
            <th className="px-4 py-3 text-center">Categoria</th>
            <th className="px-4 py-3 text-center">Local</th>
            <th className="px-4 py-3 text-center">Visitante</th>
            <th className="px-4 py-3 text-center">Torneo</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((partido, index) => (
            <tr
              key={partido.id}
              className="border-t border-gray-700/30 hover:bg-white/5 transition"
            >
              <td className="px-4 py-2.5 text-center text-gray-400">{partido.id}</td>
              <td className="px-4 py-2.5 text-center">{partido.fecha}</td>
              <td className="px-4 py-2.5 text-center text-gray-300">{partido.category?.name}</td>
              <td className="px-4 py-2.5 text-center">{partido.equipoLocal?.name}</td>
              <td className="px-4 py-2.5 text-center">{partido.equipoVisitante?.name}</td>
              <td className="px-4 py-2.5 text-center text-gray-300">{partido.torneo?.name}</td>
              <td className="px-4 py-2.5 text-center">
                <div className="flex justify-center gap-1.5">
                  <button
                    onClick={() => onEdit(partido)}
                    className="btn-outline px-2.5 py-1 text-xs"
                    title="Editar"
                  >
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={() => onDelete(partido.id)}
                    className="btn-danger px-2.5 py-1 text-xs"
                    title="Eliminar"
                  >
                    <FaTrashAlt />
                  </button>
                  <Link to={`/partidos/${partido.id}`}>
                    <button
                      onClick={() => onDetails()}
                      className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs hover:bg-blue-500/30 transition"
                      title="Inspeccionar"
                    >
                      <FaEye />
                    </button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
};

export default ListaPartidos;
