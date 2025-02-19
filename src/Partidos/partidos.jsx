import React, { useState, useEffect } from "react";
import ListaPartidos from "./ListaPartidos";
import FormularioPartidos from "./FormularioPartidos";
import { useNavigate, NavLink } from "react-router-dom";

const Partidos = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [partidos, setPartidos] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState(null);
  const [editId, setEditId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  const fetchPartidos = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/partido`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        console.error("Error fetching partidos:", await response.text());
        return;
      }
      const data = await response.json();
      setPartidos(data);
    } catch (error) {
      console.error("Error fetching partidos:", error);
    }
  };

  const handleEdit = (partido) => {
    setSelectedPartido(partido);
    setEditId(partido.id);
    setCreator(true);
  };

  const savePartido = async (partido) => {
    const token = localStorage.getItem("access_token");
    try {
      const method = selectedPartido ? "PUT" : "POST";
      const endpoint = selectedPartido
        ? `${apiUrl}/partido/${selectedPartido.id}`
        : `${apiUrl}/partido`;

      const bodyData = {
        equipoVisitanteId: partido.equipoVisitanteId,
        equipoLocalId: partido.equipoLocalId,
        torneoId: partido.torneoId,
        categoriaId: partido.categoriaId,
        fecha: partido.fecha,
        date: partido.date,
        estado: partido.estado,
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
        fetchPartidos(); // Actualiza la lista
        setCreator(false); // Cierra el formulario
        setSelectedPartido(null);
      } else {
        console.error("Error saving partido:", await response.text());
      }
    } catch (error) {
      console.error("Error saving partido:", error);
    }
  };

  const handleShowDetails = (id) => {
    setDetailsId(id);
    console.log(id);
  };

  const deletePartido = async (id) => {
    const token = localStorage.getItem("access_token");
    try {
      await fetch(`${apiUrl}/partido/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      fetchPartidos();
    } catch (error) {
      console.error("Error deleting partido:", error);
    }
  };

  useEffect(() => {
    fetchPartidos();
  }, []);

  return (
    <div className="w-4/5 mx-auto bg-[#141414] p-6 rounded-lg shadow-lg text-white border border-[#003c3c]">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase tracking-wide">
        Gestión de Partidos
      </h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setCreator(true);
            setSelectedPartido(null);
            setEditId(null);
          }}
          className="bg-[#a0f000] text-black px-4 py-2 rounded font-bold hover:bg-[#8cd600] transition"
        >
          Crear Partido
        </button>
      </div>

      <ListaPartidos
        partidos={partidos}
        onEdit={handleEdit}
        onDelete={deletePartido}
        onDetails={handleShowDetails}
      />

      {creator && (
        <FormularioPartidos
          setCreator={setCreator}
          selectedPartido={selectedPartido}
          onSave={savePartido}
          editId={editId}
        />
      )}
    </div>
  );
};

export default Partidos;
