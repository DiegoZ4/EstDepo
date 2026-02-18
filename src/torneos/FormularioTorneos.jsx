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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="glass-card p-6 w-full max-w-md mx-4 relative text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-5 text-center text-gradient-accent uppercase tracking-wide">
          Formulario de Torneo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nombre
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input-modern w-full"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Descripción
            </label>
            <input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-modern w-full"
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              País
            </label>
            <select
              name="paisId"
              value={formData.paisId}
              onChange={handleInputChange}
              required
              className="input-modern w-full"
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
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Fechas
            </label>
            <input
              type="number"
              name="fechas"
              value={formData.fechas}
              onChange={handleInputChange}
              required
              placeholder="Número de fechas"
              className="input-modern w-full"
            />
          </div>

          {/* Sección de categorías */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Categorías
            </label>
            {availableCategories.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                {availableCategories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      name="categoriesIds"
                      value={category.id}
                      checked={formData.categoriesIds.includes(category.id)}
                      onChange={handleCategoryChange}
                      className="hidden peer"
                      id={`category-${category.id}`}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="cursor-pointer w-20 flex justify-center items-center px-3 py-1.5 glass-card-sm !rounded-lg text-sm text-gray-400 transition-all peer-checked:bg-[#a0f000]/15 peer-checked:text-[#a0f000] peer-checked:border-[#a0f000]/40 hover:text-white"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay categorías disponibles.</p>
            )}
          </div>

            {/* Grupos */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Grupos
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="newGroup"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="input-modern w-full"
                placeholder="Ingresar grupo"
              />
              <button
                type="button"
                onClick={handleAddGroup}
                className="btn-primary px-3 py-2 text-sm flex-shrink-0"
              >
                +
              </button>
            </div>
            {formData.groups.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {formData.groups.map((group, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 glass-card-sm !rounded-lg text-sm"
                  >
                    <span className="text-gray-300">{group}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(index)}
                      className="text-red-400 hover:text-red-300 px-2 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreator(false)}
              className="btn-outline px-4 py-2 text-sm !text-gray-400 !border-gray-600 hover:!text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 text-sm"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioTorneos;
