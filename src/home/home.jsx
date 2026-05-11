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

  const [verMasTorneos, setVerMasTorneos] = useState(false);
  const TORNEOS_VISIBLES = 5;

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
        <main className="flex-1 flex flex-col items-center px-4 sm:px-8 py-8 lg:py-14 w-full">
          {/* Hero Section - Desktop: horizontal, Mobile: centrado */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-12 mb-10 lg:mb-14">
              {/* Texto hero */}
              <div className="lg:max-w-2xl text-center lg:text-left animate-fade-up">
                <h1 className="text-5xl lg:text-7xl font-extrabold uppercase tracking-tight mb-4">
                  <span className="text-gradient-accent">EstDepo</span>
                </h1>
                <p className="text-lg lg:text-2xl text-gray-300 mb-3">
                  Tu plataforma para seguir todo lo que pasa en la liga
                </p>
                <p className="text-sm lg:text-base text-gray-500 max-w-md lg:max-w-none">
                  Estadísticas actualizadas, resultados, fixture, tablas de posiciones y mucho más.
                </p>
                {/* Feature cards - solo desktop, horizontal */}
                <div className="hidden lg:grid grid-cols-3 gap-4 mt-8 max-w-xl">
                  {[
                    { icon: <FiBarChart2 className="w-5 h-5" />, title: "Estadísticas", desc: "Datos completos" },
                    { icon: <FiTrendingUp className="w-5 h-5" />, title: "En Vivo", desc: "Resultados al instante" },
                    { icon: <FiAward className="w-5 h-5" />, title: "Torneos", desc: "Seguí tu equipo" },
                  ].map((feat, i) => (
                    <div key={i} className="glass-card-sm p-4 text-center hover:border-[#a0f000]/30 transition-all duration-300 group">
                      <div className="inline-flex p-2.5 rounded-xl bg-[#a0f000]/10 text-[#a0f000] mb-2 group-hover:scale-110 transition-transform">
                        {feat.icon}
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-0.5">{feat.title}</h3>
                      <p className="text-gray-400 text-xs">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Logo */}
              <div className="flex justify-center items-center my-8 lg:my-0 lg:w-64 xl:w-72 shrink-0 animate-fade-up delay-100">
                <img
                  src="/assets/proyeccion-logo.png"
                  alt="Proyección Logo"
                  className="w-auto max-h-32 lg:max-h-44 animate-float"
                />
              </div>
            </div>

            {/* Feature cards - solo mobile */}
            <div className="sm:grid lg:hidden grid-cols-3 gap-3 mb-8 animate-fade-up delay-200 hidden">
              {[
                { icon: <FiBarChart2 className="w-4 h-4" />, title: "Estadísticas", desc: "Datos actualizados" },
                { icon: <FiTrendingUp className="w-4 h-4" />, title: "En Vivo", desc: "Al instante" },
                { icon: <FiAward className="w-4 h-4" />, title: "Torneos", desc: "Tu equipo" },
              ].map((feat, i) => (
                <div key={i} className="glass-card-sm p-3 text-center">
                  <div className="inline-flex p-2 rounded-xl bg-[#a0f000]/10 text-[#a0f000] mb-2">{feat.icon}</div>
                  <h3 className="text-white font-semibold text-xs mb-0.5">{feat.title}</h3>
                  <p className="text-gray-400 text-xs hidden sm:block">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section - Desktop: 2 columnas si autenticado */}
          <div className="w-full max-w-6xl mx-auto animate-fade-up delay-300">
            <div className="glass-card p-6 lg:p-10">
              {!isAuthenticated ? (
                <div className="text-center lg:max-w-2xl lg:mx-auto">
                  <h2 className="text-xl lg:text-3xl font-bold text-white mb-2">
                    Para comenzar, registrate o iniciá sesión
                  </h2>
                  <p className="text-gray-400 text-sm lg:text-base mb-6">
                    Accedé a todos los torneos, tablas y estadísticas
                  </p>
                  <div className="flex justify-center gap-3">
                    <NavLink to="/login" className="btn-outline px-6 py-2.5 text-sm lg:px-8 lg:py-3 lg:text-base">
                      Iniciar sesión
                    </NavLink>
                    <NavLink to="/register" className="btn-primary px-6 py-2.5 text-sm lg:px-8 lg:py-3 lg:text-base flex items-center gap-2">
                      Registrarse <FiArrowRight className="w-4 h-4" />
                    </NavLink>
                  </div>
                </div>
              ) : (
                <div className="lg:grid lg:grid-cols-2 lg:gap-10">
                  {/* Columna torneos */}
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-5">
                      Torneos disponibles
                    </h2>
                    {(() => {
                      const sorted = [...torneosRecomendados].sort((a, b) => {
                        const da = new Date(a.updatedAt || a.updated_at || a.createdAt || a.created_at || 0);
                        const db = new Date(b.updatedAt || b.updated_at || b.createdAt || b.created_at || 0);
                        return db - da;
                      });
                      const visibles = verMasTorneos ? sorted : sorted.slice(0, TORNEOS_VISIBLES);
                      return (
                        <>
                          <ul className="space-y-1 mb-4">
                            {visibles.map((torneo) => (
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
                            {sorted.length === 0 && (
                              <li className="text-center text-gray-500 py-4">No hay torneos disponibles</li>
                            )}
                          </ul>
                          {sorted.length > TORNEOS_VISIBLES && (
                            <button
                              onClick={() => setVerMasTorneos((v) => !v)}
                              className="w-full py-2 text-sm text-[#a0f000] hover:text-white border border-[#a0f000]/20 hover:border-[#a0f000]/50 rounded-xl transition mb-4"
                            >
                              {verMasTorneos ? "Ver menos ▲" : `Ver más (${sorted.length - TORNEOS_VISIBLES} torneos) ▼`}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  {/* Columna contacto rápido - solo desktop */}
                  <div className="hidden lg:flex flex-col justify-center gap-4 border-l border-white/5 pl-10">
                    <h2 className="text-xl font-bold text-white mb-1">¿Necesitás ayuda?</h2>
                    <p className="text-gray-400 text-sm mb-2">Contactanos según tu consulta</p>
                    <a
                      href="https://wa.me/541127566012"
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl bg-green-600/10 border border-green-600/20 hover:bg-green-600/20 transition group"
                    >
                      <div className="p-2.5 rounded-xl bg-green-600/20 text-green-400 group-hover:scale-110 transition-transform">
                        <FaWhatsapp className="text-xl" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Problemas técnicos</p>
                        <p className="text-gray-400 text-xs">+54 11 2756-6012</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/5491130004876"
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl bg-green-600/10 border border-green-600/20 hover:bg-green-600/20 transition group"
                    >
                      <div className="p-2.5 rounded-xl bg-green-600/20 text-green-400 group-hover:scale-110 transition-transform">
                        <FaWhatsapp className="text-xl" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Resultados / Partidos</p>
                        <p className="text-gray-400 text-xs">+54 9 11 3000-4876</p>
                      </div>
                    </a>
                  </div>
                  {/* Footer contacto mobile */}
                  <div className="lg:hidden border-t border-gray-700/40 pt-5 text-center mt-4">
                    <p className="text-sm text-gray-500 mb-3">¿Notaste algún error? Contactanos</p>
                    <a
                      href="https://wa.me/541127566012"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition text-sm font-medium"
                    >
                      <FaWhatsapp className="text-lg" />
                      Contactar por WhatsApp
                    </a>
                  </div>
                </div>
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
      <section className="w-full max-w-6xl mx-auto px-4 py-12 animate-fade-up">
        <div className="glass-card p-8 lg:p-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gradient-accent uppercase mb-2">
            Contactanos
          </h2>
          <p className="text-center text-gray-400 text-sm lg:text-base mb-10">
            ¿Tenés dudas, querés anunciar o reportar un error? Escribinos según tu consulta.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Problemas técnicos */}
            <a
              href="https://wa.me/541127566012"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-sm p-5 text-center hover:border-green-500/40 transition-all duration-300 group"
            >
              <div className="inline-flex p-3 rounded-xl bg-green-600/15 text-green-400 mb-3 group-hover:scale-110 transition-transform">
                <FaWhatsapp className="text-2xl" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">Problemas técnicos</p>
              <p className="text-gray-400 text-xs">+54 11 2756-6012</p>
            </a>

            {/* Resultados / Partidos */}
            <a
              href="https://wa.me/5491130004876"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-sm p-5 text-center hover:border-green-500/40 transition-all duration-300 group"
            >
              <div className="inline-flex p-3 rounded-xl bg-green-600/15 text-green-400 mb-3 group-hover:scale-110 transition-transform">
                <FaWhatsapp className="text-2xl" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">Resultados / Partidos</p>
              <p className="text-gray-400 text-xs">+54 9 11 3000-4876</p>
            </a>

            {/* Teléfono general */}
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
