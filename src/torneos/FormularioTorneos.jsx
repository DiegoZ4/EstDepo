import React, { useState, useEffect } from "react";

const FormularioTorneos = ({ setCreator, selectedTorneo, onSave }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    paisId: "",
    fechas: "", // Inicializamos fechas como cadena vacía (o puedes usar 0)
    categoriesIds: [] ,// Se usa categoriesIds en lugar de categories
    groups: []
  });
  const [paises, setPaises] = useState([]);

  const [newGroup, setNewGroup] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]); // Lista de categorías disponibles

  // Cargar países
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

  // Cargar categorías disponibles
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/categories`, {  // Asegúrate de que la URL es la correcta
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          console.error("Error fetching categories:", await response.text());
          return;
        }
        const categoriesData = await response.json();
        setAvailableCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [apiUrl]);

  // Si hay un torneo seleccionado, cargar sus datos en el formulario
  useEffect(() => {
    if (selectedTorneo) {
      setFormData({
        name: selectedTorneo.name || "",
        description: selectedTorneo.description || "",
        fechas: selectedTorneo.fechas || "", // Se asume que viene como número o cadena
        image: selectedTorneo.image || "",
        paisId: selectedTorneo.pais?.id || "",
        // Se asume que en el torneo ya vienen las categorías asociadas como arreglo de números o se puede mapear:
        categoriesIds: selectedTorneo.categories ? selectedTorneo.categories.map(cat => cat.id) : [],
        groups: selectedTorneo.groups || []
      });
    }
  }, [selectedTorneo]);

  // Manejar los cambios en los inputs generales
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar el cambio de estado de cada checkbox de categoría
  const handleCategoryChange = (e) => {
    const categoryId = Number(e.target.value); // Convertir a número
    if (e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        categoriesIds: [...prev.categoriesIds, categoryId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        categoriesIds: prev.categoriesIds.filter((id) => id !== categoryId),
      }));
    }
  };

  const handleAddGroup = () => {
    if (newGroup.trim() !== "") {
      // Agregar el grupo, asegurándote que no esté ya agregado (opcional)
      setFormData((prev) => ({
        ...prev,
        groups: [...prev.groups, newGroup.trim()],
      }));
      setNewGroup("");
    }
  };

  
  const handleRemoveGroup = (index) => {
    setFormData((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes enviar el formData directamente, ya que ahora se ajusta al DTO
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#141414] border border-[#003c3c] p-6 rounded-lg shadow-md w-full max-w-md mx-4 relative text-white">
        <h2 className="text-2xl font-bold mb-4 text-center text-[#a0f000] uppercase tracking-wide">
          Formulario de Torneo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
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

          {/* Descripción */}
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

          {/* País */}
          <div>
            <label className="block text-sm font-semibold text-[#a0f000] mb-1">
              País:
            </label>
            <select
              name="paisId"
              value={formData.paisId}
              onChange={handleInputChange}
              required
              className="w-full p-2 bg-[#143c3c] text-white border border-[#003c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a0f0f0] focus:bg-[#1e4d4d] transition"
            >
              <option value="">Selecciona un país</option>
              {paises.map((pais) => (
                <option key={pais.id} value={pais.id}>
                  {pais.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div>
            <label className="block text-sm font-semibold text-[#a0f000] mb-1">
              Fechas:
            </label>
            <input
              type="number"
              name="fechas"
              value={formData.fechas}
              onChange={handleInputChange}
              required
              placeholder="Número de fechas"
              className="w-full p-2 bg-[#143c3c] text-white border border-[#003c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a0f000] focus:bg-[#1e4d4d] transition"
            />
          </div>

          {/* Sección de categorías */}
          <div className="">
            <label className="block text-sm font-semibold text-[#a0f000] mb-4">
              Categorías:
            </label>
            {availableCategories.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {availableCategories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    {/* Ocultamos el checkbox nativo */}
                    <input
                      type="checkbox"
                      name="categoriesIds"
                      value={category.id}
                      checked={formData.categoriesIds.includes(category.id)}
                      onChange={handleCategoryChange}
                      className="hidden peer"
                      id={`category-${category.id}`}
                    />
                    {/* Label estilizado que actúa como checkbox */}
                    <label
                      htmlFor={`category-${category.id}`}
                      className="cursor-pointer w-20 flex justify-center items-center gap-2 px-3 py-1 border border-gray-600 rounded-md transition-colors duration-200 peer-checked:bg-green-500 peer-checked:text-white hover:bg-gray-600"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay categorías disponibles.</p>
            )}
          </div>

            {/* Nueva sección para Grupos */}
            <div>
            <label className="block text-sm font-semibold text-[#a0f000] mb-1">
              Grupos:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="newGroup"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="w-full p-2 bg-[#143c3c] text-white border border-[#003c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
                placeholder="Ingresar grupo"
              />
              <button
                type="button"
                onClick={handleAddGroup}
                className="bg-[#a0f000] text-black px-2 py-1 rounded"
              >
                +
              </button>
            </div>
            {formData.groups.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.groups.map((group, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1 bg-gray-700 rounded"
                  >
                    <span>{group}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(index)}
                      className="text-red-500 px-2"
                    >
                      -
                    </button>
                  </div>
                ))}
              </div>
            )}
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
