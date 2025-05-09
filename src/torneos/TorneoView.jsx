import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tablas from '../tablas/tablas';
import Fixture from '../fixture/fixture';
import Goleadores from '../Goleadores/goleadores';

function TorneoView() {
  const { torneoId, tab, categoriaId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(tab || "tabla");
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(categoriaId || null);
  const [loadingTorneo, setLoadingTorneo] = useState(true);
  const [torneo, setTorneo] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchTorneo = async () => {
      try {
        const res = await fetch(`${apiUrl}/torneo/${torneoId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("No se pudo cargar el torneo");
        const data = await res.json();
        const torneo = data;
        const cat = (data.categories || []).slice();
        // Orden alfabético “natural” (numérico dentro de la cadena)
        cat.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        );
        
        setTorneo(torneo)

        setCategories(cat);

        if (!categoriaId && cat.length > 0) {
          const firstId = cat[0].id;
          setSelectedCategoriaId(firstId);
          navigate(`/torneo/${torneoId}/${activeTab}/${firstId}`, { replace: true });
        } else {
          setSelectedCategoriaId(categoriaId);
        }
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoadingTorneo(false);
      }
    };

    fetchTorneo();
  }, [apiUrl, torneoId]);

  const handleCategoryClick = (catId) => {
    setSelectedCategoriaId(catId);
    navigate(`/torneo/${torneoId}/${activeTab}/${catId}`);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (selectedCategoriaId) {
      navigate(`/torneo/${torneoId}/${newTab}/${selectedCategoriaId}`);
    }
  };

  const selectedCategory = categories.find(
    (cat) => Number(cat.id) === Number(selectedCategoriaId)
  );

  if (loadingTorneo) return <div>Cargando torneo...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-5 mt-5 ">
        {torneo.name}
      </h1>

      <div className="flex justify-center mb-4 border-b border-gray-400 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`mx-2 px-4 py-2 text-white ${Number(selectedCategoriaId) === Number(cat.id)
              ? "bg-green-500"
              : "bg-gray-700 hover:bg-green-500"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-4 border-b border-gray-400 pb-2">
        {["fixture", "tabla", "goleadoras"].map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => handleTabChange(tabKey)}
            className={`mx-2 px-4 py-2 text-white ${activeTab === tabKey
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
              }`}
          >
            {tabKey === "fixture"
              ? "Fixture"
              : tabKey === "tabla"
                ? "Tabla de Posiciones"
                : "Goleadores"}
          </button>
        ))}
      </div>

      {activeTab === "fixture" && (
        <Fixture torneoId={torneoId} categoriaId={selectedCategoriaId} />
      )}
      {activeTab === "tabla" && (
        <Tablas torneoId={torneoId} categoriaId={selectedCategoriaId} />
      )}
      {activeTab === "goleadoras" && (
        <Goleadores torneoId={torneoId} categoriaId={selectedCategoriaId} />
      )}
    </div>
  );
}

export default TorneoView;
