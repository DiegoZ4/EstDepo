import React, { useState, useEffect } from "react";
import ListaTorneos from "./ListaTorneos";
import FormularioTorneos from "./FormularioTorneos";

const Torneos = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [torneos, setTorneos] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Fetch inicial de torneos con token en headers
  const fetchTorneos = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/torneo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        console.error("Error fetching torneos:", await response.text());
        return;
      }
      const data = await response.json();
      setTorneos(data);
    } catch (error) {
      console.error("Error fetching torneos:", error);
    }
  };

  const handleEdit = async (torneo) => {
    setSelectedTorneo(torneo);
    setCreator(true);
    setEditId(torneo.id);
  };

  const saveTorneo = async (torneo) => {
    const token = localStorage.getItem("access_token");
    const method = editId ? "PUT" : "POST";
    const endpoint = editId
      ? `${apiUrl}/torneo/${editId}`
      : `${apiUrl}/torneo`;

    console.log(endpoint, method, torneo, editId);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(torneo),
      });
      if (!response.ok) {
        console.error("Error saving torneo:", await response.text());
      }
      fetchTorneos();
      setCreator(false);
      setSelectedTorneo(null);
    } catch (error) {
      console.error("Error saving torneo:", error);
    }
  };

  const deleteTorneo = async (id) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/torneo/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        console.error("Error deleting torneo:", await response.text());
      }
      fetchTorneos();
    } catch (error) {
      console.error("Error deleting torneo:", error);
    }
  };

  useEffect(() => {
    fetchTorneos();
  }, []);

  const filteredTorneos = torneos
    .filter((t) => {
      const q = search.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.pais?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "pais") return (a.pais?.name || "").localeCompare(b.pais?.name || "");
      return 0;
    });

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gradient-accent uppercase tracking-wide animate-fade-up">
        Gestión de Torneos
      </h1>

      <div className="max-w-3xl mx-auto space-y-4 animate-fade-up delay-100">
        {/* Buscador y ordenar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <input
            type="text"
            placeholder="Buscar torneo..."
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

        <ListaTorneos torneos={filteredTorneos} onEdit={handleEdit} onDelete={deleteTorneo} />

        <button
          onClick={() => {
            setCreator(true);
            setSelectedTorneo(null);
            setEditId(null);
          }}
          className="btn-primary w-full py-3 text-sm"
        >
          Crear Torneo
        </button>
      </div>

      {creator && (
        <FormularioTorneos
          setCreator={setCreator}
          selectedTorneo={selectedTorneo}
          onSave={saveTorneo}
          setEditId={setEditId}
        />
      )}
    </div>
  );
};

export default Torneos;
