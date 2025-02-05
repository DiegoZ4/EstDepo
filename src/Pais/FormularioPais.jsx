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
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 backdrop-blur-sm">
    <form
      onSubmit={handleSubmit}
      className="bg-[#003c3c] p-6 rounded-lg shadow-lg w-96 text-white space-y-4"
    >
      <h2 className="text-2xl font-bold text-center text-[#a0f000]">
        {selectedPais ? "Actualizar Equipo" : "Crear Equipo"}
      </h2>

      <label className="block text-sm">Nombre:</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
        required
      />

      <label className="block text-sm">Descripción:</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
      />

      <label className="block text-sm">Imagen (URL):</label>
      <input
        type="text"
        name="image"
        value={formData.image}
        onChange={handleInputChange}
        className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white"
      />

      <div className="flex justify-around mt-4">
        <button
          type="submit"
          className="bg-[#a0f000] text-black px-4 py-2 rounded hover:bg-[#8cd000] transition"
        >
          {selectedPais ? "Actualizar" : "Crear"}
        </button>
        <button
          type="button"
          onClick={close}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
  );
};

export default FormularioPais;
