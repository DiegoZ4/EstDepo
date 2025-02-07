import React, { useState, useEffect } from "react";
import ListaPais from "./ListaPais";
import FormularioPais from "./FormularioPais";

const Pais = () => {

  const apiUrl = import.meta.env.VITE_API_URL;

  const [pais, setPais] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedPais, setSelectedPais] = useState(null);
  
  const fetchPais = async () => {
    try {
      const response = await fetch(`${apiUrl}/pais`);
      const data = await response.json();
      setPais(data);
    } catch (error) {
      console.error("Error fetching pais:", error);
    }
  };

  const handleEdit = (pais) => {
    setSelectedPais(pais);
    setCreator(true);
  };

  const savePais = async (pais) => {
    try {
      const method = selectedPais ? "PUT" : "POST";
      const endpoint = selectedPais
        ? `${apiUrl}/pais/${selectedPais.id}`
        : `${apiUrl}/pais`;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pais),
      });

      if (response.ok) {
        fetchPais();
        setCreator(false);
        setSelectedPais(null);
      } else {
        console.error("Error saving pais:", await response.text());
      }
    } catch (error) {
      console.error("Error saving pais:", error);
    }
  };

  const deletePais = async (id) => {
    try {
      await fetch(`${apiUrl}/pais/${id}`, { method: "DELETE" });
      fetchPais();
    } catch (error) {
      console.error("Error deleting pais:", error);
    }
  };

  useEffect(() => {
    fetchPais();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#141414] text-white min-h-screen">
    <h1 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase">
      Gestión de Pais
    </h1>

    <ListaPais pais={pais} onEdit={handleEdit} onDelete={deletePais} />

    <div className="flex justify-center mt-6">
      <button
        onClick={() => {
          setCreator(true);
          setSelectedPais(null);
        }}
        className="bg-[#003c3c] text-white px-6 py-3 rounded-md hover:bg-[#005555] transition"
      >
        Crear Pais
      </button>
    </div>

    {creator && (
      <FormularioPais
        setCreator={setCreator}
        selectedPais={selectedPais}
        onSave={savePais}
      />
    )}
  </div>
  );
};

export default Pais;
