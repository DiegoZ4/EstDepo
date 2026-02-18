import React, { useState, useEffect, useContext, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiUser, FiX, FiLogOut, FiLogIn, FiUserPlus, FiSettings, FiChevronDown } from "react-icons/fi";
import { useSpring, animated } from "react-spring";
import { AuthContext } from "../auth/auth.context";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTorneosMenu, setShowTorneosMenu] = useState(false);
  const [torneos, setTorneos] = useState([]);
  const { isAuthenticated, user, logout, isSubscribed } = useContext(AuthContext);
  const navigate = useNavigate();
  const tournamentMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const menuAnimation = useSpring({
    transform: showMenu ? "translateX(0)" : "translateX(-100%)",
    opacity: showMenu ? 1 : 0,
    config: { duration: 200 },
  });

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Carga torneos
  useEffect(() => {
    const fetchTorneos = async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiUrl}/torneo`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (res.ok) {
        setTorneos(await res.json());
      }
    };
    fetchTorneos();
  }, [apiUrl]);

  const handleSelectTorneo = (torneoId) => {
    navigate(`/torneo/${torneoId}`);
    setShowTorneosMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-gray-700/40 bg-black/60 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        {isAuthenticated && user?.rol === "admin" && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="mr-2 p-2 rounded-xl text-[#a0f000] hover:bg-white/5 transition"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <img
            src="/assets/proyeccion-logo.png"
            alt="Proyección Logo"
            className="h-9 w-auto"
          />
          <span className="text-xl font-bold text-white group-hover:text-[#a0f000] transition hidden sm:inline">
            EstDepo
          </span>
        </NavLink>

        {/* Premium badge / link */}
        <NavLink
          to={user?.rol === "admin" ? "/perfil" : "/suscipcion"}
          className={`ml-3 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${
            user?.rol === "admin"
              ? "bg-gradient-to-r from-[#a0f000] to-[#78b800] text-black shadow-lg shadow-[#a0f000]/20"
              : isSubscribed
              ? "bg-gradient-to-r from-[#a0f000] to-[#78b800] text-black shadow-lg shadow-[#a0f000]/20"
              : "border border-[#a0f000]/50 text-[#a0f000] hover:bg-[#a0f000]/10 hover:border-[#a0f000]"
          }`}
        >
          {user?.rol === "admin" ? "★ Admin" : isSubscribed ? "★ Premium" : "Ser Premium"}
        </NavLink>

        {/* Torneos */}
        <div
          className="relative ml-2"
          onMouseEnter={() => setShowTorneosMenu(true)}
        >
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-300 hover:text-[#a0f000] hover:bg-white/5 transition text-sm font-medium">
            Torneos
            <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${showTorneosMenu ? 'rotate-180' : ''}`} />
          </button>
          {showTorneosMenu && (
            <div
              ref={tournamentMenuRef}
              onMouseLeave={() => setShowTorneosMenu(false)}
              className="absolute left-0 mt-1 w-72 glass-card p-2 shadow-2xl animate-fade-in"
            >
              {isAuthenticated ? (
                <ul className="space-y-0.5">
                  {torneos.map((t) => (
                    <li
                      key={t.id}
                      onClick={() => handleSelectTorneo(t.id)}
                      className="cursor-pointer py-2.5 px-3 rounded-xl text-gray-300 hover:text-[#a0f000] hover:bg-white/5 transition text-sm"
                    >
                      {t.name}
                    </li>
                  ))}
                  {torneos.length === 0 && (
                    <li className="py-3 px-3 text-gray-500 text-sm text-center">No hay torneos disponibles</li>
                  )}
                </ul>
              ) : (
                <div className="space-y-3 text-center p-4">
                  <p className="text-gray-400 text-sm">Registrate para ver los torneos</p>
                  <NavLink
                    to="/register"
                    className="btn-primary inline-block text-sm px-4 py-2"
                  >
                    Registrarse
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Icono usuario */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowUserMenu(!showUserMenu);
          }}
          className="flex items-center gap-2 p-2 rounded-xl text-[#a0f000] hover:bg-white/5 transition"
        >
          <FiUser className="w-5 h-5" />
          {isAuthenticated && user && (
            <span className="hidden sm:inline text-sm text-gray-300 font-medium">{user.name}</span>
          )}
        </button>
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-2xl animate-fade-in">
            <ul className="space-y-0.5">
              <li
                onClick={() => { navigate("/perfil"); setShowUserMenu(false); }}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer transition text-sm"
              >
                <FiSettings className="w-4 h-4" /> Mi Perfil
              </li>
              {isAuthenticated ? (
                <>
                  <li className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-gray-300 text-sm">
                    <FiUser className="w-4 h-4 text-[#a0f000]" />
                    <div>
                      <span className="text-white font-medium">{user.name}</span>
                      {user?.rol === "admin" ? (
                        <span className="ml-2 text-[10px] bg-[#a0f000]/20 text-[#a0f000] px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>
                      ) : isSubscribed && (
                        <span className="ml-2 text-[10px] bg-[#a0f000]/20 text-[#a0f000] px-1.5 py-0.5 rounded-full font-bold">PREMIUM</span>
                      )}
                    </div>
                  </li>
                  <hr className="border-gray-700/40 my-1" />
                  <li
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="flex cursor-pointer items-center gap-2 py-2.5 px-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-sm"
                  >
                    <FiLogOut className="w-4 h-4" /> Cerrar Sesión
                  </li>
                </>
              ) : (
                <>
                  <li className="rounded-xl hover:bg-white/5 transition">
                    <NavLink to="/login" className="flex items-center gap-2 py-2.5 px-3 text-gray-300 hover:text-[#a0f000] text-sm">
                      <FiLogIn className="w-4 h-4" /> Iniciar Sesión
                    </NavLink>
                  </li>
                  <li className="rounded-xl hover:bg-white/5 transition">
                    <NavLink to="/register" className="flex items-center gap-2 py-2.5 px-3 text-gray-300 hover:text-[#a0f000] text-sm">
                      <FiUserPlus className="w-4 h-4" /> Registrarse
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Menú lateral admin */}
      {isAuthenticated && user?.rol === "admin" && (
        <>
          {showMenu && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowMenu(false)} />
          )}
          <animated.div
            style={menuAnimation}
            className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-gradient-to-b from-[#1a3a3a] to-[#0d1f1f] border-r border-gray-700/40 p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-[#a0f000]">Admin Panel</span>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-1">
              {[
                { path: "equipos", label: "Equipos" },
                { path: "categorias", label: "Categorías" },
                { path: "pais", label: "Países" },
                { path: "jugadores", label: "Jugadores" },
                { path: "torneos", label: "Torneos" },
                { path: "partidos", label: "Partidos" },
              ].map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={`/${item.path}`}
                    onClick={() => setShowMenu(false)}
                    className={({ isActive }) =>
                      `block py-2.5 px-4 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? "bg-[#a0f000]/10 text-[#a0f000]"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </animated.div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
