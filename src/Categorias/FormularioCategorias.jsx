import React, { useState, useEffect } from "react";

const FormularioCategorias = ({ setCreator, selectedCategory, onSave }) => {
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    if (selectedCategory) {
      setFormData({ name: selectedCategory.name || "" }); // Asegura que existe 'name'
    } else {
      setFormData({ name: "" });
    }
  }, [selectedCategory]);

  console.log(formData)
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const cancel = () => setCreator(false);

  return (

<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
  <form
    onSubmit={handleSubmit}
    className="glass-card p-6 w-full max-w-sm space-y-4"
  >
    <h2 className="text-xl font-bold text-center text-gradient-accent">
      {selectedCategory ? "Editar Categoría" : "Crear Categoría"}
    </h2>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        className="input-modern w-full"
        required
      />
    </div>
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={cancel}
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
  );
};

export default FormularioCategorias;
