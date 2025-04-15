import React, { useState, useEffect } from "react";
import ListaJugadores from "./ListaJugadores";
import FormularioJugadores from "./FormularioJugadores";
import { colores } from "../colores"; // Asegúrate de ajustar la ruta según tu estructura

const Jugadores = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [jugadores, setJugadores] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [editId, setEditId] = useState(null);
  const [sortBy, setSortBy] = useState("name");

  const sortJugadores = (jugadores, criterio) => {
    return [...jugadores].sort((a, b) => {
      if (criterio === "equipoId") {
        return (a.equipo?.name || "").localeCompare(b.equipo?.name || "");
      }
      if (criterio === "paisId") {
        return (a.pais?.name || "").localeCompare(b.pais?.name || "");
      }
      if (
        criterio === "fechaNacimiento" ||
        criterio === "altura" ||
        criterio === "peso"
      ) {
        return (a[criterio] || 0) - (b[criterio] || 0);
      }
      return (a[criterio] || "")
        .toString()
        .localeCompare((b[criterio] || "").toString());
    });
  };

  const fetchJugadores = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/jugador`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching jugadores:", errorText);
        setJugadores([]);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setJugadores(data);
      } else {
        console.error("Respuesta inesperada:", data);
        setJugadores([]);
      }
    } catch (error) {
      console.error("Error fetching jugadores:", error);
    }
  };

  const handleEdit = (jugador) => {
    setSelectedJugador(jugador);
    setEditId(jugador.id);
    setCreator(true);
  };

  const saveJugador = async (jugador) => {
    const token = localStorage.getItem("access_token");
    try {
      const method = selectedJugador ? "PUT" : "POST";
      const endpoint = selectedJugador
        ? `${apiUrl}/jugador/${selectedJugador.id}`
        : `${apiUrl}/jugador`;

      const bodyData = {
        name: jugador.name,
        image: jugador.image,
        description: jugador.description,
        edad: jugador.edad,
        paisId: jugador.paisId,
        posicion: jugador.posicion,
        goles: jugador.goles,
        tarjetasRojas: jugador.tarjetasRojas,
        tarjetasAmarillas: jugador.tarjetasAmarillas,
        asistencias: jugador.asistencias,
        fechaNacimiento: jugador.fechaNacimiento,
        altura: jugador.altura,
        peso: jugador.peso,
        equipoId: jugador.equipoId,
        categoryId: jugador.categoryId,
        partidos: jugador.partidos,
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        fetchJugadores();
        setCreator(false);
        setSelectedJugador(null);
      } else {
        const errorText = await response.text();
        console.error("Error saving jugador:", errorText);
      }
    } catch (error) {
      console.error("Error saving jugador:", error);
    }
  };

  const deleteJugador = async (id) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/jugador/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error deleting jugador:", errorText);
      }
      fetchJugadores();
    } catch (error) {
      console.error("Error deleting jugador:", error);
    }
  };

  useEffect(() => {
    fetchJugadores();
  }, []);

  return (
    <div
      className="p-6 rounded-lg shadow-xl flex flex-col items-center"
      style={{
        backgroundColor: colores.fondoPrincipal,
        color: colores.texto,
      }}
    >
      <h1
        className="text-3xl font-bold text-center mb-4 uppercase"
        style={{ color: colores.acento }}
      >
        Gestión de Jugadores
      </h1>

      <div className="mb-4 ">
        <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
          Clasificar por:
        </label>
        <select
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy}
          className="w-3/5 p-2 rounded-md focus:outline-none focus:ring-2"
          style={{
            backgroundColor: colores.inputBg,
            border: `1px solid ${colores.acento}`,
            color: colores.texto,
          }}
        >
          <option value="name">Nombre</option>
          <option value="equipoId">Equipo</option>
          <option value="posicion">Posición</option>
          <option value="fechaNacimiento">Fecha de Nacimiento</option>
          <option value="altura">Altura</option>
          <option value="peso">Peso</option>
        </select>
      </div>

      <ListaJugadores
        jugadores={sortJugadores(jugadores, sortBy)}
        onEdit={handleEdit}
        onDelete={deleteJugador}
      />

      <button
        onClick={() => {
          setCreator(true);
          setSelectedJugador(null);
          setEditId(null);
        }}
        className="w-3/5 p-3 rounded-md mt-4 font-bold transition duration-300"
        style={{
          backgroundColor: colores.buttonBg,
          color: "black",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colores.buttonHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colores.buttonBg;
        }}
      >
        Crear Jugador
      </button>

      {creator && (
        <FormularioJugadores
          setCreator={setCreator}
          selectedJugador={selectedJugador}
          onSave={saveJugador}
        />
      )}
    </div>
  );
};

export default Jugadores;
