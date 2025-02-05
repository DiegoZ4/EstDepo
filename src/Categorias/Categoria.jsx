import React, { useState, useEffect } from "react";
import FormularioCategorias from "./FormularioCategorias";
import ListaCategorias from "./ListaCategorias";

const Categoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategorias = async () => {
    const response = await fetch("http://localhost:3000/categories");
    const data = await response.json();
    setCategorias(data);
  };

  const saveCategoria = async (categoria) => {
    console.log(categoria)
    const method = selectedCategory ? "PUT" : "POST";
    const endpoint = selectedCategory
      ? `http://localhost:3000/categories/${selectedCategory.id}`
      : "http://localhost:3000/categories";

    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoria),
    });

    fetchCategorias();
    setCreator(false);
    setSelectedCategory(null);
  };

  const deleteCategoria = async (id) => {
    await fetch(`http://localhost:3000/categories/${id}`, { method: "DELETE" });
    fetchCategorias();
  };

  const handleEdit = (categoria) => {
    setSelectedCategory(categoria);
    setCreator(true);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return (
<div className="p-4 bg-[#141414] min-h-screen text-white">
  <button
    onClick={() => {
      setCreator(true);
      setSelectedCategory(null);
    }}
    className="bg-[#a0f000] text-black font-bold py-2 px-4 rounded shadow-md hover:bg-[#003c3c] hover:text-white transition duration-300 mb-4 flex items-center gap-2"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>

    Crear Categoría
  </button>

  {creator && (
    <FormularioCategorias
      setCreator={setCreator}
      selectedCategory={selectedCategory}
      onSave={saveCategoria}
    />
  )}

  <ListaCategorias
    categorias={categorias}
    onEdit={handleEdit}
    onDelete={deleteCategoria}
  />
</div>
  );
};

export default Categoria;
