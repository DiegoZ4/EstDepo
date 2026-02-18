import React, { useState, useEffect } from "react";
import ListaEquipos from "./ListaEquipos";
import FormularioEquipo from "./FormularioEquipo";

const apiUrl = import.meta.env.VITE_API_URL;

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  
  
  const fetchEquipos = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/equipo`, { 
        method: "GET",  // Se utiliza GET para obtener la lista
        headers: { 
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Error fetching equipos:", errorMessage);
        setEquipos([]);
        return;
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setEquipos(data);
      } else {
        console.error("Respuesta inesperada:", data);
        setEquipos([]);
      }
    } catch (error) {
      console.error("Error fetching equipos:", error);
    }
  };

  const handleEdit = (equipo) => {
    setSelectedEquipo(equipo);
    setCreator(true);
  };

  const saveEquipo = async (equipo) => {
    const token = localStorage.getItem("access_token");
    try {
      const method = selectedEquipo ? "PUT" : "POST";
      const endpoint = selectedEquipo
        ? `${apiUrl}/equipo/${selectedEquipo.id}`
        : `${apiUrl}/equipo`;

      const response = await fetch(endpoint, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    const token = localStorage.getItem("access_token");
    try {
      await fetch(`${apiUrl}/equipo/${id}`, { 
        method: "DELETE", 
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        }
      });
      fetchEquipos();
    } catch (error) {
      console.error("Error deleting equipo:", error);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  const filteredEquipos = equipos
    .filter((e) => {
      const q = search.toLowerCase();
      return (
        e.name?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.pais?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "pais") return (a.pais?.name || "").localeCompare(b.pais?.name || "");
      return 0;
    });

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-gradient-accent uppercase">
        Gestión de Equipos
      </h1>

      {/* Buscador y ordenar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar equipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-modern flex-1"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-modern sm:w-48"
        >
          <option value="name">Ordenar por nombre</option>
          <option value="pais">Ordenar por país</option>
        </select>
      </div>

      <ListaEquipos 
        equipos={filteredEquipos} 
        onEdit={handleEdit} 
        onDelete={deleteEquipo} 
      />

      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            setCreator(true);
            setSelectedEquipo(null);
          }}
          className="btn-primary px-6 py-3"
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
