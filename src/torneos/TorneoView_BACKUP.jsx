import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tablas from '../tablas/tablas';
import Fixture from '../fixture/fixture';
import Goleadores from '../Goleadores/goleadores';
import AdBanner from '../components/AdBanner';

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
    console.log("🎯 Categoría seleccionada:", catId);
    setSelectedCategoriaId(catId);
    navigate(`/torneo/${torneoId}/${activeTab}/${catId}`);
  };

  const handleTabChange = (newTab) => {
    console.log("📑 Tab cambiada a:", newTab, "con categoría:", selectedCategoriaId);
    setActiveTab(newTab);
    if (selectedCategoriaId) {
      navigate(`/torneo/${torneoId}/${newTab}/${selectedCategoriaId}`);
    }
  };

  console.log("🔍 TorneoView - torneoId:", torneoId, "selectedCategoriaId:", selectedCategoriaId, "activeTab:", activeTab);

  const selectedCategory = categories.find(
    (cat) => Number(cat.id) === Number(selectedCategoriaId)
  );

  if (loadingTorneo) return <div>Cargando torneo...</div>;

  return (
    <div className="relative">
      {/* Mobile Advertisement - Top */}
      <div className="lg:hidden mb-4">
        <AdBanner type="mobile-top" />
      </div>

      {/* Desktop Layout with Sidebars */}
      <div className="lg:flex lg:gap-6 lg:max-w-7xl lg:mx-auto lg:px-4">
        {/* Left Advertisement - Desktop Only */}
        <div className="hidden lg:block lg:w-48 xl:w-56 lg:flex-shrink-0">
          <div className="sticky top-4">
            <AdBanner type="desktop-left" />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:flex-1">
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

        {/* Right Advertisement - Desktop Only */}
        <div className="hidden lg:block lg:w-48 xl:w-56 lg:flex-shrink-0">
          <div className="sticky top-4">
            <AdBanner type="desktop-right" />
          </div>
        </div>
      </div>

      {/* Mobile Advertisement - Bottom */}
      <div className="lg:hidden mt-6">
        <AdBanner type="mobile-bottom" />
      </div>
    </div>
  );
}

export default TorneoView;
