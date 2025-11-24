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

    const fetchTorneoYCategorias = async () => {
      try {
        console.log("🔄 Cargando torneo ID:", torneoId);
        
        // 1. Primero cargamos el torneo básico (sin relaciones circulares)
        const resTorneo = await fetch(`${apiUrl}/torneo/${torneoId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!resTorneo.ok) {
          console.error("❌ Error al cargar torneo - Status:", resTorneo.status);
          throw new Error("No se pudo cargar el torneo");
        }
        
        const torneoData = await resTorneo.json();
        console.log("✅ Torneo cargado:", torneoData);
        setTorneo(torneoData);

        // 2. Hacemos un fetch separado para las categorías del torneo
        // Esto evita la dependencia circular entre torneo y categorías
        console.log("🔄 Cargando categorías del torneo...");
        const resCategorias = await fetch(`${apiUrl}/torneo/${torneoId}/categorias`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        let categoriasFinales = [];
        
        if (!resCategorias.ok) {
          console.warn("⚠️ Endpoint /torneo/:id/categorias no disponible - Status:", resCategorias.status);
          console.warn("⚠️ Intentando usar data.categories si existe...");
          // Fallback: intentar usar las categorías del torneo data si vienen
          categoriasFinales = (torneoData.categories || []).slice();
          if (categoriasFinales.length === 0) {
            console.error("❌ No se pudieron cargar las categorías");
          }
        } else {
          const categoriasData = await resCategorias.json();
          console.log("✅ Categorías cargadas desde endpoint:", categoriasData);
          categoriasFinales = categoriasData.slice();
        }
        
        // Orden alfabético "natural" (numérico dentro de la cadena)
        categoriasFinales.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        );
        
        setCategories(categoriasFinales);
        console.log("📋 Categorías disponibles:", categoriasFinales.map(c => `${c.id}: ${c.name}`));

        // 3. Seleccionamos la primera categoría si no hay una seleccionada
        if (!categoriaId && categoriasFinales.length > 0) {
          const firstId = categoriasFinales[0].id;
          console.log("🎯 Auto-seleccionando primera categoría:", firstId);
          setSelectedCategoriaId(firstId);
          navigate(`/torneo/${torneoId}/${activeTab}/${firstId}`, { replace: true });
        } else {
          console.log("🎯 Usando categoría de URL:", categoriaId);
          setSelectedCategoriaId(categoriaId);
        }
      } catch (e) {
        console.error("❌ Error general:", e);
      } finally {
        console.log("🏁 Carga completada");
        setLoadingTorneo(false);
      }
    };

    fetchTorneoYCategorias();
  }, [apiUrl, torneoId, activeTab, categoriaId, navigate]);

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

  if (loadingTorneo) return <div className="text-white text-center p-8">Cargando torneo...</div>;

  if (!torneo) {
    return (
      <div className="text-white text-center p-8">
        <p className="text-xl text-red-400">Error: No se pudo cargar el torneo</p>
        <p className="text-sm text-gray-400 mt-2">Torneo ID: {torneoId}</p>
      </div>
    );
  }

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

          {/* Botones de Categorías */}
          {categories.length > 0 ? (
            <div className="flex justify-center mb-4 border-b border-gray-400 pb-2 flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`mx-2 px-4 py-2 text-white rounded ${Number(selectedCategoriaId) === Number(cat.id)
                    ? "bg-green-500"
                    : "bg-gray-700 hover:bg-green-500"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center mb-4 p-4 bg-yellow-900 text-yellow-200 rounded">
              <p>⚠️ No hay categorías disponibles para este torneo</p>
              <p className="text-xs mt-1">Verifica la consola del navegador para más detalles</p>
            </div>
          )}

          {/* Tabs de Fixture, Tabla, Goleadores */}
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

          {/* Contenido de las tabs */}
          {selectedCategoriaId ? (
            <>
              {activeTab === "fixture" && (
                <Fixture torneoId={torneoId} categoriaId={selectedCategoriaId} />
              )}
              {activeTab === "tabla" && (
                <Tablas torneoId={torneoId} categoriaId={selectedCategoriaId} />
              )}
              {activeTab === "goleadoras" && (
                <Goleadores torneoId={torneoId} categoriaId={selectedCategoriaId} />
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 p-8">
              <p>Por favor selecciona una categoría</p>
            </div>
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
