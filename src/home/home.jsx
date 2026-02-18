import { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../auth/auth.context";
import { FaWhatsapp, FaPhone, FaEnvelope } from "react-icons/fa";
import { FiTrendingUp, FiBarChart2, FiAward, FiArrowRight } from "react-icons/fi";
import AdBanner from "../components/AdBanner";

export default function Home() {
  const { isAuthenticated } = useContext(AuthContext);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [torneosRecomendados, setTorneosRecomendados] = useState([]);

  useEffect(() => {
    const fetchTorneos = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/torneo`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          console.error("Error fetching torneos:", await response.text());
          return;
        }
        const data = await response.json();
        setTorneosRecomendados(data);
      } catch (error) {
        console.error("Error fetching torneos:", error);
      }
    };
    fetchTorneos();
  }, [apiUrl]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Anuncio superior para móvil */}
      <div className="lg:hidden w-full px-4 py-2">
        <AdBanner
          type="mobile-top"
          className="w-full h-20"
          content={
            <div className="text-center px-4">
              <div className="text-[#a0f000] font-bold text-sm">TU ANUNCIO ACÁ</div>
              <div className="text-gray-400 text-xs">Espacio publicitario disponible</div>
            </div>
          }
        />
      </div>

      {/* Layout principal con anuncios laterales para desktop */}
      <div className="flex flex-1">
        {/* Anuncio lateral izquierdo - Solo desktop */}
        <div className="hidden lg:flex w-48 xl:w-60 p-4">
          <AdBanner
            type="sidebar-left"
            className="w-full h-full"
            href="https://example.com/deportes"
            content={
              <div className="text-center p-4">
                <div className="transform -rotate-90 space-y-2">
                  <div className="text-[#a0f000] font-bold text-sm">TU ANUNCIO ACÁ</div>
                  <div className="text-gray-400 text-xs">Espacio disponible</div>
                  <div className="text-gray-500 text-xs">Contactanos</div>
                </div>
              </div>
            }
          />
        </div>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col items-center px-4 sm:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto animate-fade-up">
            <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight mb-4">
              <span className="text-gradient-accent">EstDepo</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-2">
              Tu plataforma para seguir todo lo que pasa en la liga
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Estadísticas actualizadas, resultados, fixture, tablas de posiciones y mucho más.
            </p>
          </div>

          {/* Logo */}
          <div className="my-8 animate-fade-up delay-100">
            <img
              src="/assets/proyeccion-logo.png"
              alt="Proyección Logo"
              className="w-auto max-h-32 animate-float"
            />
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-10 animate-fade-up delay-200">
            {[
              { icon: <FiBarChart2 className="w-5 h-5" />, title: "Estadísticas", desc: "Datos completos actualizados" },
              { icon: <FiTrendingUp className="w-5 h-5" />, title: "En Vivo", desc: "Resultados al instante" },
              { icon: <FiAward className="w-5 h-5" />, title: "Torneos", desc: "Seguí tu equipo favorito" },
            ].map((feat, i) => (
              <div
                key={i}
                className="glass-card-sm p-4 text-center hover:border-[#a0f000]/30 transition-all duration-300 group"
              >
                <div className="inline-flex p-2.5 rounded-xl bg-[#a0f000]/10 text-[#a0f000] mb-3 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{feat.title}</h3>
                <p className="text-gray-400 text-xs">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="w-full max-w-lg animate-fade-up delay-300">
            <div className="glass-card p-8">
              {!isAuthenticated ? (
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-2">
                    Para comenzar, registrate o iniciá sesión
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Accedé a todos los torneos, tablas y estadísticas
                  </p>
                  <div className="flex justify-center gap-3">
                    <NavLink to="/login" className="btn-outline px-6 py-2.5 text-sm">
                      Iniciar sesión
                    </NavLink>
                    <NavLink to="/register" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                      Registrarse <FiArrowRight className="w-4 h-4" />
                    </NavLink>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-6 text-center">
                    Torneos disponibles
                  </h2>
                  <ul className="space-y-2 mb-6">
                    {torneosRecomendados.map((torneo) => (
                      <li key={torneo.id}>
                        <NavLink
                          to={`/torneo/${torneo.id}`}
                          className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition group"
                        >
                          <span className="text-gray-200 font-medium group-hover:text-[#a0f000] transition">
                            {torneo.name}
                          </span>
                          <FiArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#a0f000] group-hover:translate-x-1 transition-all" />
                        </NavLink>
                      </li>
                    ))}
                    {torneosRecomendados.length === 0 && (
                      <li className="text-center text-gray-500 py-4">No hay torneos disponibles</li>
                    )}
                  </ul>
                  <div className="border-t border-gray-700/40 pt-5 text-center">
                    <p className="text-sm text-gray-500 mb-3">¿Notaste algún error? Contactanos</p>
                    <a
                      href="https://wa.me/+5491141431616"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition text-sm font-medium"
                    >
                      <FaWhatsapp className="text-lg" />
                      Contactar por WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Anuncio lateral derecho - Solo desktop */}
        <div className="hidden lg:flex w-48 xl:w-60 p-4">
          <AdBanner
            type="sidebar-right"
            className="w-full h-full"
            onClick={() => alert('Espacio publicitario disponible!')}
            content={
              <div className="text-center p-4">
                <div className="transform -rotate-90 space-y-2">
                  <div className="text-[#a0f000] font-bold text-sm">TU ANUNCIO ACÁ</div>
                  <div className="text-gray-400 text-xs">Espacio disponible</div>
                  <div className="text-gray-500 text-xs">Contactanos</div>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Sección de Contacto */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12 animate-fade-up">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-center text-gradient-accent uppercase mb-2">
            Contactanos
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            ¿Tenés dudas, querés anunciar o reportar un error? Escribinos por cualquiera de estos medios.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* WhatsApp 1 */}
            <a
              href="https://wa.me/541127566012"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-sm p-5 text-center hover:border-green-500/40 transition-all duration-300 group"
            >
              <div className="inline-flex p-3 rounded-xl bg-green-600/15 text-green-400 mb-3 group-hover:scale-110 transition-transform">
                <FaWhatsapp className="text-2xl" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">WhatsApp</p>
              <p className="text-gray-400 text-xs">+54 11 2756-6012</p>
            </a>

            {/* WhatsApp / Teléfono 2 */}
            <a
              href="https://wa.me/5491141431616"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-sm p-5 text-center hover:border-green-500/40 transition-all duration-300 group"
            >
              <div className="inline-flex p-3 rounded-xl bg-green-600/15 text-green-400 mb-3 group-hover:scale-110 transition-transform">
                <FaPhone className="text-xl" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">Teléfono / WhatsApp</p>
              <p className="text-gray-400 text-xs">+54 9 11 4143-1616</p>
            </a>

            {/* Email */}
            <a
              href="mailto:viene_el_gol@hotmail.com"
              className="glass-card-sm p-5 text-center hover:border-[#a0f000]/40 transition-all duration-300 group"
            >
              <div className="inline-flex p-3 rounded-xl bg-[#a0f000]/10 text-[#a0f000] mb-3 group-hover:scale-110 transition-transform">
                <FaEnvelope className="text-xl" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">Email</p>
              <p className="text-gray-400 text-xs">viene_el_gol@hotmail.com</p>
            </a>
          </div>
        </div>
      </section>

      {/* Anuncio inferior para móvil */}
      <div className="lg:hidden w-full px-4 py-2">
        <AdBanner
          type="mobile-bottom"
          className="w-full h-20"
          href="https://wa.me/+5491141431616"
          content={
            <div className="text-center px-4">
              <div className="text-[#a0f000] font-bold text-sm">TU ANUNCIO ACÁ</div>
              <div className="text-gray-400 text-xs">Espacio publicitario disponible</div>
            </div>
          }
        />
      </div>
    </div>
  );
}
