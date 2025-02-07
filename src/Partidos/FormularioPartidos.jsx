import React, { useState, useEffect } from "react";

const FormularioPartido = ({ setCreator, selectedPartido, onSave  }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    fecha: "",
    date: "",
    equipoLocal: "",
    equipoVisitante: "",
    torneo: "",
    category: "",
    estado: "Pendiente",
  });

  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  useEffect(() => {
    // Fetch equipos, torneos y categorías
    const fetchData = async () => {
      try {
        const fetchEquipos = async () => {
          const response = await fetch(`${apiUrl}/equipo`);
          const data = await response.json();
          setEquipos(data);
        };

        const fetchTorneos = async () => {
          const response = await fetch(`${apiUrl}/torneo`);
          const data = await response.json();
          setTorneos(data);
        };

        const fetchCategorias = async () => {
          const response = await fetch(`${apiUrl}/categories`);
          const data = await response.json();
          setCategorias(data);
        };

        fetchTorneos();
        fetchCategorias();
        fetchEquipos();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [setCreator]);

  useEffect(() => {

    const fetchPartido = async () => {
      if (selectedPartido) {
        try {
          const response = await fetch(`${apiUrl}/partido/${selectedPartido.id}`);
          const data = await response.json();
          console.log(data);
          setFormData({
            fecha: data.fecha || "",
            date: data.date?.slice(0, 16) || "",
            equipoLocalId: data.equipoLocal.id || "",  
            equipoVisitanteId: data.equipoVisitante.id || "",  
            torneoId: data.torneo.id || "",  
            categoriaId : data.category.id || "",  
            estado: data.estado || "Pendiente",
          });
        } catch (error) {
          console.error("Error fetching partido:", error);
        }
      }
    };
    fetchPartido();
  }, [selectedPartido]);
  
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const toggleEstado = () => {
    const nuevoEstado = formData.estado === "Pendiente" ? "Finalizado" : "Pendiente";
    handleInputChange({ target: { name: "estado", value: nuevoEstado } });
  };
  
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Pasa los datos al componente padre
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-[#141414] border border-[#003c3c] p-6 rounded-lg shadow-2xl w-full max-w-md mx-4 space-y-4 text-white"
      >
        <h2 className="text-2xl font-bold text-center text-[#a0f000] uppercase tracking-wide mb-4">
          {selectedPartido ? "Editar Partido" : "Crear Partido"}
        </h2>
  
        {/* Fecha */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">Fecha:</label>
          <input
            type="text"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
            required
          />
        </div>
  
        {/* Fecha y Hora */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">Fecha y Hora:</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
            required
          />
        </div>
  
        {/* Equipos */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">Equipo Local:</label>
          <select
            name="equipoLocalId"
            value={formData.equipoLocalId}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
            required
          >
            <option value="">
              {selectedPartido ? formData.equipoLocalId?.name : "Seleccione un equipo"}
            </option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.name}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">Equipo Visitante:</label>
          <select
            name="equipoVisitanteId"
            value={formData.equipoVisitanteId}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
            required
          >
            <option value="">
              {selectedPartido ? formData.equipoVisitanteId?.name : "Seleccione un equipo"}
            </option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.name}
              </option>
            ))}
          </select>
        </div>
  
        {/* Torneo */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">Torneo:</label>
          <select
            name="torneoId"
            value={formData.torneoId}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
            required
          >
            <option value="">
              {selectedPartido ? formData.torneoId?.name : "Seleccione un torneo"}
            </option>
            {torneos.map((torneo) => (
              <option key={torneo.id} value={torneo.id}>
                {torneo.name}
              </option>
            ))}
          </select>
        </div>
  
        {/* Categoría */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">Categoría:</label>
          <select
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
            required
          >
            <option value="">
              {selectedPartido ? formData.categoriaId?.name : "Seleccione una categoría"}
            </option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.name}
              </option>
            ))}
          </select>
        </div>
  
        {/* Switch de Estado */}
        <div className="flex items-center justify-between bg-[#1f1f1f] p-2 rounded-md border border-[#003c3c] cursor-pointer transition"
          onClick={toggleEstado}>
          <span className="font-semibold text-[#a0f000]">
            {formData.estado === "Finalizado" ? "Finalizado" : "Pendiente"}
          </span>
          <div className="relative w-10 h-5 bg-gray-500 rounded-full">
            <div
              className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                formData.estado === "Finalizado" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </div>
  
        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="submit"
            className="bg-[#a0f000] text-black px-4 py-2 rounded-md font-bold hover:bg-[#8cd000] transition"
          >
            {selectedPartido ? "Guardar Cambios" : "Crear Partido"}
          </button>
          <button
            type="button"
            onClick={() => setCreator(false)}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-800 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
  
};

export default FormularioPartido;
