import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../auth/auth.context';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import Tablas from '../tablas/tablas';
import Fixture from '../fixture/fixture';
import Goleadores from '../Goleadores/goleadores';
import AdBanner from '../components/AdBanner';

function TorneoView() {
  const { torneoId, tab, categoriaId } = useParams();
  const navigate = useNavigate();
  const { isSubscribed } = useContext(AuthContext);

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

  if (loadingTorneo) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#a0f000] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!torneo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="glass-card p-8 max-w-md">
          <p className="text-xl text-red-400 font-semibold mb-2">No se pudo cargar el torneo</p>
          <p className="text-sm text-gray-500">Torneo ID: {torneoId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative animate-fade-up">
      {/* Mobile Advertisement - Top */}
      <div className="lg:hidden mb-4">
        <AdBanner type="mobile-top" />
      </div>

      {/* Desktop Layout with Sidebars */}
      <div className="lg:flex lg:gap-6 lg:max-w-7xl lg:mx-auto lg:px-4">
        {/* Left Advertisement - Desktop Only */}
        <div className="hidden lg:block lg:w-56 xl:w-64 lg:flex-shrink-0">
          <div className="sticky top-20">
            <AdBanner type="desktop-left" />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:flex-1 px-4 lg:px-0">
          {/* Tournament Header */}
          <div className="text-center my-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gradient-accent uppercase tracking-wide">
              {torneo.name}
            </h1>
          </div>

          {/* Botones de Categorías */}
          {categories.length > 0 ? (
            <div className="flex justify-center mb-6 pb-3 flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    Number(selectedCategoriaId) === Number(cat.id)
                      ? "bg-[#a0f000] text-black shadow-lg shadow-[#a0f000]/20"
                      : "glass-card-sm !rounded-xl text-gray-300 hover:text-[#a0f000] hover:border-[#a0f000]/30"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="glass-card p-4 text-center mb-6">
              <p className="text-yellow-400 text-sm">No hay categorías disponibles para este torneo</p>
            </div>
          )}

          {/* Tabs de Fixture, Tabla, Goleadores */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex glass-card-sm !rounded-xl p-1 gap-1">
              {[
                { key: "fixture", label: "Fixture", locked: false },
                { key: "tabla", label: "Tabla de Posiciones", locked: !isSubscribed },
                { key: "goleadoras", label: "Goleadores", locked: !isSubscribed },
              ].map((tabItem) => (
                <button
                  key={tabItem.key}
                  onClick={() => {
                    if (tabItem.locked) {
                      navigate('/suscipcion');
                    } else {
                      handleTabChange(tabItem.key);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === tabItem.key
                      ? "bg-[#a0f000]/15 text-[#a0f000] border border-[#a0f000]/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tabItem.label}
                  {tabItem.locked && (
                    <FiLock className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido */}
          {selectedCategoriaId ? (
            <div className="animate-fade-in">
              {(activeTab === "fixture" || !isSubscribed) && (
                <Fixture torneoId={torneoId} categoriaId={selectedCategoriaId} />
              )}
              {activeTab === "tabla" && isSubscribed && (
                <Tablas torneoId={torneoId} categoriaId={selectedCategoriaId} />
              )}
              {activeTab === "goleadoras" && isSubscribed && (
                <Goleadores torneoId={torneoId} categoriaId={selectedCategoriaId} />
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-8">
              <p>Por favor selecciona una categoría</p>
            </div>
          )}
        </div>

        {/* Right Advertisement - Desktop Only */}
        <div className="hidden lg:block lg:w-56 xl:w-64 lg:flex-shrink-0">
          <div className="sticky top-20">
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
