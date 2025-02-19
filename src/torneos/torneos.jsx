import React, { useState, useEffect } from "react";
import ListaTorneos from "./ListaTorneos";
import FormularioTorneos from "./FormularioTorneos";

const Torneos = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [torneos, setTorneos] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [editId, setEditId] = useState(null);

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

  return (
    <div className="bg-[#141414] min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase tracking-wide">
        Gestión de Torneos
      </h1>

      <div className="w-3/5 mx-auto space-y-4">
        <ListaTorneos torneos={torneos} onEdit={handleEdit} onDelete={deleteTorneo} />

        <button
          onClick={() => {
            setCreator(true);
            setSelectedTorneo(null);
            setEditId(null);
          }}
          className="w-full bg-[#003c3c] text-[#a0f000] py-2 rounded-md hover:bg-[#a0f000] hover:text-black transition duration-300 font-bold"
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
