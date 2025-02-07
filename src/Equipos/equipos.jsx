import React, { useState, useEffect } from "react";
import ListaEquipos from "./ListaEquipos";
import FormularioEquipo from "./FormularioEquipo";

const apiUrl = import.meta.env.VITE_API_URL
const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  
  const fetchEquipos = async () => {
    try {
      const response = await fetch(`${apiUrl}/equipo`);
      const data = await response.json();
      setEquipos(data);
    } catch (error) {
      console.error("Error fetching equipos:", error);
    }
  };

  const handleEdit = (equipo) => {
    setSelectedEquipo(equipo);
    setCreator(true);
  };

  const saveEquipo = async (equipo) => {
    try {
      const method = selectedEquipo ? "PUT" : "POST";
      const endpoint = selectedEquipo
        ? `${apiUrl}/equipo/${selectedEquipo.id}`
        : `${apiUrl}/equipo`;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipo),
      });

      if (response.ok) {
        fetchEquipos();
        setCreator(false);
        setSelectedEquipo(null);
      } else {
        console.error("Error saving equipo:", await response.text());
      }
    } catch (error) {
      console.error("Error saving equipo:", error);
    }
  };

  const deleteEquipo = async (id) => {
    try {
      await fetch(`${apiUrl}/equipo/${id}`, { method: "DELETE" });
      fetchEquipos();
    } catch (error) {
      console.error("Error deleting equipo:", error);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#141414] text-white min-h-screen">
    <h1 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase">
      Gestión de Equipos
    </h1>

    <ListaEquipos equipos={equipos} onEdit={handleEdit} onDelete={deleteEquipo} />

    <div className="flex justify-center mt-6">
      <button
        onClick={() => {
          setCreator(true);
          setSelectedEquipo(null);
        }}
        className="bg-[#003c3c] text-white px-6 py-3 rounded-md hover:bg-[#005555] transition"
      >
        Crear Equipo
      </button>
    </div>

    {creator && (
      <FormularioEquipo
        setCreator={setCreator}
        selectedEquipo={selectedEquipo}
        onSave={saveEquipo}
      />
    )}
  </div>
  );
};

export default Equipos;
