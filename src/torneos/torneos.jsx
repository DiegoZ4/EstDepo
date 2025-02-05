import React, { useState, useEffect } from "react";
import ListaTorneos from "./ListaTorneos";
import FormularioTorneos from "./FormularioTorneos";

const Torneos = () => {
  const [torneos, setTorneos] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [editId, setEditId] = useState(null);

  // Fetch inicial de torneos
  const fetchTorneos = async () => {
    try {
      const response = await fetch("http://localhost:3000/torneo");
      const data = await response.json();
      setTorneos(data);
    } catch (error) {
      console.error("Error fetching torneos:", error);
    }
  };
  const handleEdit = async(torneo) => {
    setSelectedTorneo(torneo);
    setCreator(true);
    setEditId(torneo.id);
  };

  const saveTorneo = async (torneo) => {
    const method = editId ? "PUT" : "POST";
    const endpoint = editId
    ? `http://localhost:3000/torneo/${editId}`
      : "http://localhost:3000/torneo";
    
    console.log(endpoint, method, torneo, editId);

    try {
      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(torneo),
      });
      fetchTorneos();
      setCreator(false);
      setSelectedTorneo(null);
    } catch (error) {
      console.error("Error saving torneo:", error);
    }
  };
  
  const deleteTorneo = async (id) => {
    try {
      await fetch(`http://localhost:3000/torneo/${id}`, { method: "DELETE" });
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
