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
    onSave(formData, selectedCategory.id);
  };

  const cancel = () => setCreator(false);

  return (

<div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50">
  <form
    onSubmit={handleSubmit}
    className="bg-[#000000] p-6 rounded-lg shadow-lg w-80 text-white space-y-4 border-2 border-[#003c3c]"
  >
      <label className="block text-sm">Nombre:</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
        required
      />
    <div className="flex justify-between mt-4">
      <button
        type="submit"
        className="bg-[#a0f000] text-black font-bold px-4 py-2 rounded hover:bg-[#143c3c] hover:text-white transition duration-300 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

        Guardar
      </button>
      <button
        type="button"
        onClick={cancel}
        className="bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-red-800 transition duration-300 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

        Cancelar
      </button>
    </div>
  </form>
</div>
  );
};

export default FormularioCategorias;
