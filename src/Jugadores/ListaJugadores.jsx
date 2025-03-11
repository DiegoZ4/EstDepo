import React from "react";
import { FiUser } from "react-icons/fi";
import { colores } from "../colores"; // Ajusta la ruta según tu estructura

const ListaJugadores = ({ jugadores, onEdit, onDelete }) => {
  return (
    <div className="w-3/5 space-y-4">
      {jugadores.map((jugador) => (
        <div
          key={jugador.id}
          className="p-4 rounded-lg shadow-md flex justify-between items-center transition duration-300 group"
          style={{
            backgroundColor: colores.cardBg,
            border: `1px solid ${colores.border}`,
            color: colores.texto,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colores.hoverBg;
            e.currentTarget.style.color = "black";
            const nameElement = e.currentTarget.querySelector(".nombreJugador");
            if (nameElement) {
              nameElement.style.color = colores.cardBg;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colores.cardBg;
            e.currentTarget.style.color = colores.texto;
            const nameElement = e.currentTarget.querySelector(".nombreJugador");
            if (nameElement) {
              nameElement.style.color = colores.acento;
            }
          }}
        >
          <div className="flex items-center">
            {jugador.image ? (
              <img
                src={jugador.image}
                alt={jugador.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center rounded-md mr-4 bg-gray-700">
                <FiUser className="text-white text-2xl" />
              </div>
            )}
            <div>
              <p className="nombreJugador text-xl font-bold transition duration-300">
                {jugador.name}
              </p>
              <p>Posición: {jugador.posicion}</p>
              <p>Equipo: {jugador.equipo?.name || "Sin equipo"}</p>
              <p>País: {jugador.pais?.name || "Sin país"}</p>
            </div>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(jugador)}
              className="px-3 py-1 rounded-md font-semibold transition"
              style={{
                backgroundColor: colores.botonEditar,
                color: "black",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colores.botonEditarHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = colores.botonEditar)
              }
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(jugador.id)}
              className="px-3 py-1 rounded-md font-semibold transition"
              style={{
                backgroundColor: colores.botonEliminar,
                color: colores.texto,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colores.botonEliminarHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = colores.botonEliminar)
              }
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
