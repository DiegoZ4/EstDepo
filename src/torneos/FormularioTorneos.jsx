import React, { useState, useEffect } from "react";

const FormularioTorneos = ({ setCreator, selectedTorneo, onSave }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    paisId: "",
  });
  const [paises, setPaises] = useState([]);

  useEffect(() => {
    const fetchPaises = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/pais`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          console.error("Error fetching paises:", await response.text());
          return;
        }
        const paisesData = await response.json();
        setPaises(paisesData);
      } catch (error) {
        console.error("Error fetching paises:", error);
      }
    };
    fetchPaises();
  }, [apiUrl]);

  useEffect(() => {
    if (selectedTorneo) {
      setFormData({
        name: selectedTorneo.name || "",
        description: selectedTorneo.description || "",
        image: selectedTorneo.image || "",
        paisId: selectedTorneo.pais?.id || "",
      });
    }
  }, [selectedTorneo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#141414] border border-[#003c3c] p-6 rounded-lg shadow-md w-full max-w-md mx-4 relative text-white">
        <h2 className="text-2xl font-bold mb-4 text-center text-[#a0f000] uppercase tracking-wide">
          Formulario de Torneo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#a0f000] mb-1">
              Nombre:
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 bg-[#143c3c] text-white border border-[#003c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a0f000] focus:bg-[#1e4d4d] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#a0f000] mb-1">
              Descripción:
            </label>
            <input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 bg-[#143c3c] text-white border border-[#003c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a0f000] focus:bg-[#1e4d4d] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#a0f000] mb-1">
              País:
            </label>
            <select
              name="paisId"
              value={formData.paisId}
              onChange={handleInputChange}
              required
              className="w-full p-2 bg-[#143c3c] text-white border border-[#003c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a0f000] focus:bg-[#1e4d4d] transition"
            >
              <option value="">Selecciona un país</option>
              {paises.map((pais) => (
                <option key={pais.id} value={pais.id}>
                  {pais.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="bg-[#a0f000] text-black px-4 py-2 rounded hover:bg-[#8cd000] transition font-bold"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setCreator(false)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition font-bold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioTorneos;
