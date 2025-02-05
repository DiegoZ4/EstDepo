import React, { useState, useEffect } from "react";
import ListaJugadores from "./ListaJugadores";
import FormularioJugadores from "./FormularioJugadores";


const Jugadores = () => {
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
      if (criterio === "fechaNacimiento" || criterio === "altura" || criterio === "peso") {
        return (a[criterio] || 0) - (b[criterio] || 0);
      }
      return (a[criterio] || "").toString().localeCompare((b[criterio] || "").toString());
    });
  };
  
  const fetchJugadores = async () => {
    try {
      const response = await fetch("http://localhost:3000/jugador");
      const data = await response.json();
      setJugadores(data);
    } catch (error) {
      console.error("Error fetching jugadores:", error);
    }
  };

  const handleEdit = (jugador) => {
    setSelectedJugador(jugador);  // Se asegura de que el jugador seleccionado se guarde
    setEditId(jugador.id);        // Guarda el ID para la edición
    setCreator(true);
  };
  

  const saveJugador = async (jugador) => {
    try {
      const method = selectedJugador ? "PUT" : "POST";
      const endpoint = selectedJugador
        ? `http://localhost:3000/jugador/${selectedJugador.id}`
        : "http://localhost:3000/jugador";
  
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
        categoriesId: jugador.categoriesId, // Asegurar que sea un array
        partidos: jugador.partidos,
      };
  
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
  
      if (response.ok) {
        fetchJugadores(); // Actualiza la lista
        setCreator(false); // Cierra el formulario
        setSelectedJugador(null);
      } else {
        console.error("Error saving jugador:", await response.text());
      }
    } catch (error) {
      console.error("Error saving jugador:", error);
    }
  };
  

  const deleteJugador = async (id) => {
    try {
      await fetch(`http://localhost:3000/jugador/${id}`, { method: "DELETE" });
      fetchJugadores();
    } catch (error) {
      console.error("Error deleting jugador:", error);
    }
  };

  useEffect(() => {
    fetchJugadores();
  }, []);

  return (
    <div className="bg-[#141414] p-6 rounded-lg shadow-xl flex flex-col items-center text-white">
  <h1 className="text-3xl font-bold text-center mb-4 text-[#a0f000] uppercase">Gestión de Jugadores</h1>

  <div className="mb-4">
    <label className="block text-[#a0f000] font-semibold mb-1">Clasificar por:</label>
    <select
      onChange={(e) => setSortBy(e.target.value)}
      value={sortBy}
      className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
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
    className="w-full bg-[#a0f000] text-black p-3 rounded-md mt-4 font-bold hover:bg-[#8bd600] transition duration-300"
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
