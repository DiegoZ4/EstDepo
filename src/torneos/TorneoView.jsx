import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tablas from '../tablas/tablas';
import Fixture from '../fixture/fixture';
import Goleadores from '../Goleadores/goleadores';

function TorneoView() {
  const { torneoId, categoriaId: initialCategoriaId } = useParams();
  const navigate = useNavigate();
  const [loadingTorneo, setLoadingTorneo] = useState(true);
  const [categories, setCategories] = useState([]);
  // Solo nos interesa manejar la categoría seleccionada y las pestañas
  const [categoriaId, setCategoriaId] = useState(initialCategoriaId || null);
  const [activeTab, setActiveTab] = useState("tabla");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Cuando cambia el torneo, reiniciamos la categoría seleccionada
  useEffect(() => {
    setCategoriaId(null);
  }, [torneoId]);

  // Fetch del torneo para obtener sus categorías (se ejecuta solo al inicio o cuando cambia torneo)
  useEffect(() => {
    setLoadingTorneo(true);
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
        setCategories(data.categories || []);
        // Si no hay categoría seleccionada, usamos la primera disponible
        if (!categoriaId && data.categories && data.categories.length > 0) {
          const firstCatId = data.categories[0].id;
          setCategoriaId(firstCatId);
          navigate(`/torneo/${torneoId}/${activeTab}/${firstCatId}`, { replace: true });
        }
      } catch (error) {
        console.error("Error fetching torneo:", error);
      } finally {
        setLoadingTorneo(false);
      }
    };
    fetchTorneo();
  }, [apiUrl, torneoId]);

  const handleCategoryClick = (catId) => {
    setCategoriaId(catId);
    navigate(`/torneo/${torneoId}/${activeTab}/${catId}`, { replace: true });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (categoriaId) {
      navigate(`/torneo/${torneoId}/${tab}/${categoriaId}`, { replace: true });
    }
  };

  if (loadingTorneo) {
    return <div>Loading...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Torneo</h1>
        <p className="text-red-500">No hay categorías para este torneo.</p>
      </div>
    );
  }

  const selectedCategory = categories.find(
    (cat) => Number(cat.id) === Number(categoriaId)
  );

  return (
    <div>
      {/* Título: mostramos el nombre de la categoría seleccionada o "Torneo" */}
      <h1 className="text-2xl font-bold text-center mb-4">
        {selectedCategory ? selectedCategory.name : "Torneo"}
      </h1>

      {/* Selector de categorías */}
      <div className="flex justify-center mb-4 border-b border-gray-400 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`mx-2 px-4 py-2 text-white ${
              Number(categoriaId) === Number(cat.id)
                ? "bg-green-500"
                : "bg-gray-700 hover:bg-green-500"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Pestañas de navegación (sección de módulos) */}
      <div className="flex justify-center mb-4 border-b border-gray-400 pb-2">
        <button
          onClick={() => handleTabChange("fixture")}
          className={`mx-2 px-4 py-2 text-white ${
            activeTab === "fixture"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          Fixture
        </button>
        <button
          onClick={() => handleTabChange("tabla")}
          className={`mx-2 px-4 py-2 text-white ${
            activeTab === "tabla"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          Tabla de Posiciones
        </button>
        <button
          onClick={() => handleTabChange("goleadoras")}
          className={`mx-2 px-4 py-2 text-white ${
            activeTab === "goleadoras"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          Goleadores
        </button>
      </div>

      {/* Renderizado de módulos: cada módulo se encarga de su propio fetch y estado */}
      <div style={{ display: activeTab === "fixture" ? "block" : "none" }}>
        <Fixture torneoId={torneoId} categoriaId={categoriaId} />
      </div>
      <div style={{ display: activeTab === "tabla" ? "block" : "none" }}>
        <Tablas torneoId={torneoId} categoriaId={categoriaId} />
      </div>
      <div style={{ display: activeTab === "goleadoras" ? "block" : "none" }}>
        <Goleadores torneoId={torneoId} categoriaId={categoriaId} />
      </div>
    </div>
  );
}

export default TorneoView;
