import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tablas from '../tablas/tablas';

function TorneoView() {
  // Extraemos los parámetros de la URL
  const { torneoId, categoriaId: initialCategoriaId } = useParams();
  const navigate = useNavigate();
  const [tabla, setTabla] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  // Estado para la categoría seleccionada
  const [categoriaId, setCategoriaId] = useState(initialCategoriaId || null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Cuando cambia el torneo, reiniciamos la categoría seleccionada
  useEffect(() => {
    setCategoriaId(null);
  }, [torneoId]);

  // Fetch del torneo para obtener sus categorías
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const fetchTorneo = async () => {
      try {
        const response = await fetch(`${apiUrl}/torneo/${torneoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          console.error("Error fetching torneo:", await response.text());
          return;
        }
        const data = await response.json();
        // Verificamos si hay torneos (aunque el torneo viene por URL)
        if (!data) {
          return;
        }
        setCategories(data.categories || []);
        // Si no hay categoría seleccionada, asignamos la primera disponible
        if (!categoriaId && data.categories && data.categories.length > 0) {
          const firstCatId = data.categories[0].id;
          setCategoriaId(firstCatId);
          navigate(`/torneo/${torneoId}/tabla/${firstCatId}`, { replace: true });
        }
      } catch (error) {
        console.error("Error fetching torneo:", error);
      }
    };
    fetchTorneo();
  }, [apiUrl, torneoId, navigate, categoriaId]);

  // Fetch de la tabla según torneo y categoría
  useEffect(() => {
    if (!torneoId || !categoriaId) return;
    const fetchTabla = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/torneo/${torneoId}/tabla/${categoriaId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error('Error al obtener la tabla');
        }
        const data = await response.json();
        setTabla(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching table data:", error);
        setLoading(false);
      }
    };
    fetchTabla();
  }, [apiUrl, torneoId, categoriaId]);

  const handleCategoryClick = (catId) => {
    setCategoriaId(catId);
    navigate(`/torneo/${torneoId}/tabla/${catId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Si no hay categorías disponibles, mostramos un mensaje al usuario
  if (categories.length === 0) {
    return (
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Tabla de Posiciones</h1>
        <p className="text-red-500">No hay categorías para este torneo.</p>
      </div>
    );
  }

  // Buscamos la categoría seleccionada para mostrar su nombre en el encabezado
  const selectedCategory = categories.find(
    (cat) => Number(cat.id) === Number(categoriaId)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">
        {selectedCategory ? `Tabla de ${selectedCategory.name}` : 'Tabla de Posiciones'}
      </h1>
      
      {/* Selector de categorías: barra horizontal */}
      <div className="flex justify-center mb-4 border-b border-gray-400 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`mx-2 px-4 py-2 text-white ${
              Number(categoriaId) === Number(cat.id)
                ? 'bg-green-500'
                : 'bg-gray-700 hover:bg-green-500'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      
      <Tablas torneoId={torneoId} categoriaId={categoriaId} tablaData={tabla} />
    </div>
  );
}

export default TorneoView;
