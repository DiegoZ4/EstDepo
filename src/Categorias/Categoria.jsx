import React, { useState, useEffect } from "react";
import FormularioCategorias from "./FormularioCategorias";
import ListaCategorias from "./ListaCategorias";



const apiUrl = import.meta.env.VITE_API_URL;
const Categoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");

  const fetchCategorias = async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${apiUrl}/categories`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error fetching categorias:", errorMessage);
      setCategorias([]);
      return <Navigate to="/login" replace />;
    }
    const data = await response.json();
    setCategorias(data);
  };

  const saveCategoria = async (categoria) => {
    console.log(categoria)
    const method = selectedCategory ? "PUT" : "POST";
    const endpoint = selectedCategory
      ? `${apiUrl}/categories/${selectedCategory.id}`
      : `${apiUrl}/categories`;

    const token = localStorage.getItem("access_token");
    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, },
      body: JSON.stringify(categoria),
    });

    fetchCategorias();
    setCreator(false);
    setSelectedCategory(null);
  };

  const deleteCategoria = async (id) => {
    const token = localStorage.getItem("access_token");
    await fetch(`${apiUrl}/categories/${id}`, { 
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      }
    });
    fetchCategorias();
  };

  const handleEdit = (categoria) => {
    setSelectedCategory(categoria);
    setCreator(true);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const filteredCategorias = categorias.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
<div className="max-w-3xl mx-auto p-6 text-white">

  {/* Buscador */}
  <div className="mb-4">
    <input
      type="text"
      placeholder="Buscar categoría..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="input-modern w-full"
    />
  </div>

  {creator && (
    <FormularioCategorias
      setCreator={setCreator}
      selectedCategory={selectedCategory}
      onSave={saveCategoria}
    />
  )}

  <ListaCategorias
    categorias={filteredCategorias}
    onEdit={handleEdit}
    onDelete={deleteCategoria}
  />
  <div className="flex justify-center mt-6">
    <button
      onClick={() => {
        setCreator(true);
        setSelectedCategory(null);
      }}
      className="btn-primary px-6 py-3 flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Crear Categoría
    </button>
  </div>
</div>
  );
};

export default Categoria;
