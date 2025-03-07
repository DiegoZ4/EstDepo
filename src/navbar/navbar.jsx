import React, { useState, useEffect, useContext, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiUser, FiX } from "react-icons/fi";
import { AiOutlineSetting, AiOutlineLogin, AiOutlineLogout, AiOutlineUserAdd } from "react-icons/ai";
import { useSpring, animated } from "react-spring";
import { AuthContext } from "../auth/auth.context";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTorneosMenu, setShowTorneosMenu] = useState(false);
  const [torneos, setTorneos] = useState([]);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const tournamentMenuRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const menuAnimation = useSpring({
    transform: showMenu ? "translateX(0)" : "translateX(-100%)",
    opacity: showMenu ? 1 : 0,
    config: { duration: 200 },
  });

  // Listener para cerrar el menú de usuario al hacer click fuera
  useEffect(() => {
    const handleClickOutsideUser = (event) => {
      if (!event.target.closest(".user-menu")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutsideUser);
    return () => document.removeEventListener("click", handleClickOutsideUser);
  }, []);

  // Listener para cerrar el menú de torneos al hacer click fuera
  useEffect(() => {
    const handleClickOutsideTournament = (event) => {
      if (tournamentMenuRef.current && !tournamentMenuRef.current.contains(event.target)) {
        setShowTorneosMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutsideTournament);
    return () => document.removeEventListener("click", handleClickOutsideTournament);
  }, []);

  // Cargar la lista de torneos desde la API
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
        // Ajusta esta línea si la respuesta tiene otra estructura.
        setTorneos(data);
      } catch (error) {
        console.error("Error fetching torneos:", error);
      }
    };
    fetchTorneos();
  }, [apiUrl]);

  // Función para redirigir al torneo seleccionado
  const handleSelectTorneo = (torneoId) => {
    navigate(`/torneo/${torneoId}`);
    setShowTorneosMenu(false);
  };

  return (
    <nav className="flex z-50 items-center justify-between bg-black text-white px-6 py-4 shadow-lg fixed w-full z-50">
      <div className="flex items-center justify-start">
        {/* Botón para el menú lateral solo para admin */}
        {isAuthenticated && user?.rol === "admin" && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-3xl text-[#a0f000] hover:text-[#8cd000] transition mr-6"
          >
            <FiMenu />
          </button>
        )}
        {/* Botón Home con texto "EstDepo" */}
        <NavLink 
          to="/" 
          className="text-2xl font-bold hover:text-[#a0f000] transition"
        >
          EstDepo
        </NavLink>
        {/* Botón de Torneos y menú desplegable (desplegado al hacer hover) */}
        <div
          className="relative ml-6"
          onMouseEnter={() => setShowTorneosMenu(true)}
        >
          <button className="hover:text-[#a0f000] p-2 transition">
            Torneos
          </button>
          {showTorneosMenu && (
            <div
            onMouseEnter={() => setShowTorneosMenu(true)}
          onMouseLeave={() => setShowTorneosMenu(false)}
              ref={tournamentMenuRef}
              className="absolute z-1 left-0 mt-2 w-48 bg-gray-900 text-white shadow-xl p-2 animate-fade-in "
            >
              <ul>
                {torneos.length > 0 ? (
                  torneos.map((torneo) => (
                    <li
                      key={torneo.id}
                      className="p-2 cursor-pointer transition hover:text-green-500"
                      onClick={() => handleSelectTorneo(torneo.id)}
                    >
                      {torneo.name}
                    </li>
                  ))
                ) : (
                  <li className="p-2">Cargando...</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="relative user-menu">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowUserMenu(!showUserMenu);
          }}
          className="text-3xl text-[#a0f000] hover:text-[#8cd000] transition"
        >
          <FiUser />
        </button>
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-xl rounded-lg p-2 animate-fade-in">
            <ul>
              <li>
                <div className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition">
                  <FiUser className="mr-2" /> {user?.name}
                </div>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition">
                <AiOutlineSetting className="mr-2" /> Configuración
              </li>
              {isAuthenticated ? (
                <li
                  onClick={() => logout()}
                  className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition"
                >
                  <AiOutlineLogout className="mr-2" /> Cerrar Sesión
                </li>
              ) : (
                <>
                  <li className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition">
                    <NavLink to="/login" className="flex items-center">
                      <AiOutlineLogin className="mr-2" /> Iniciar Sesión
                    </NavLink>
                  </li>
                  <li className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition">
                    <NavLink to="/register" className="flex items-center">
                      <AiOutlineUserAdd className="mr-2" /> Registrarse
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Panel lateral de administración solo para usuarios admin */}
      {isAuthenticated && user?.rol === "admin" && (
        <animated.div
          style={menuAnimation}
          className="absolute left-0 top-0 h-screen w-64 bg-[#003c3c] text-white p-6 shadow-2xl z-50 transition-transform"
        >
          <button
            onClick={() => setShowMenu(false)}
            className="mb-6 text-3xl text-[#a0f000] hover:text-[#8cd000] transition"
          >
            <FiX />
          </button>
          <ul className="space-y-4">
            <li>
              <NavLink to="/equipos" className="hover:text-[#a0f000] transition">
                Equipos
              </NavLink>
            </li>
            <li>
              <NavLink to="/categorias" className="hover:text-[#a0f000] transition">
                Categorías
              </NavLink>
            </li>
            <li>
              <NavLink to="/pais" className="hover:text-[#a0f000] transition">
                Países
              </NavLink>
            </li>
            <li>
              <NavLink to="/jugadores" className="hover:text-[#a0f000] transition">
                Jugadores
              </NavLink>
            </li>
            <li>
              <NavLink to="/torneos" className="hover:text-[#a0f000] transition">
                Torneos
              </NavLink>
            </li>
            <li>
              <NavLink to="/partidos" className="hover:text-[#a0f000] transition">
                Partidos
              </NavLink>
            </li>
          </ul>
        </animated.div>
      )}
    </nav>
  );
}

export default Navbar;
