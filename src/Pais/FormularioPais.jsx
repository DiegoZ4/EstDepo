import React, { useState, useEffect } from 'react';


const FormularioPais = ({ setCreator, selectedPais, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
  });

  const close = () => {
    setCreator(false);
  };


  useEffect(() => {
    if (selectedPais) {
      setFormData({
        name: selectedPais.name || "",
        image: selectedPais.image || "",
        description: selectedPais.description || "",
      });
    }
  }, [selectedPais]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 animate-fade-in">
    <form
      onSubmit={handleSubmit}
      className="glass-card p-6 w-full max-w-sm space-y-4"
    >
      <h2 className="text-xl font-bold text-center text-gradient-accent">
        {selectedPais ? "Actualizar País" : "Crear País"}
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

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="input-modern w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Imagen (URL)</label>
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleInputChange}
          className="input-modern w-full"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={close}
          className="btn-outline px-4 py-2 text-sm !text-gray-400 !border-gray-600 hover:!text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary px-6 py-2 text-sm"
        >
          {selectedPais ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  </div>
  );
};

export default FormularioPais;
