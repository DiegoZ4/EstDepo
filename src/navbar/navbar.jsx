import React, { useState, useEffect, useContext, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiUser, FiX } from "react-icons/fi";
import {
  AiOutlineSetting,
  AiOutlineLogin,
  AiOutlineLogout,
  AiOutlineUserAdd,
} from "react-icons/ai";
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black text-white px-6 py-4 shadow-lg">
      <div className="flex items-center">
        {isAuthenticated && user?.rol === "admin" && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="mr-6 text-3xl text-[#a0f000] hover:text-[#8cd000] transition"
          >
            <FiMenu />
          </button>
        )}

        {/* Logo */}
        <NavLink to="/" className="flex items-center">
          <img
            src="/assets/proyeccion-logo.png"
            alt="Proyección Logo"
            className="h-10 w-auto mr-3"
          />
          <span className="text-2xl font-bold hover:text-[#a0f000] transition">
            EstDepo
          </span>
        </NavLink>

        {/* Torneos */}
        <div
          className="relative ml-6"
          onMouseEnter={() => setShowTorneosMenu(true)}
        >
          <button className="p-2 hover:text-[#a0f000] transition">Torneos</button>
          {showTorneosMenu && (
            <div
              ref={tournamentMenuRef}
              onMouseLeave={() => setShowTorneosMenu(false)}
              className="absolute left-0 mt-2 w-64 rounded-md bg-gray-900 p-3 shadow-xl"
            >
              {isAuthenticated ? (
                <ul>
                  {torneos.map((t) => (
                    <li
                      key={t.id}
                      onClick={() => handleSelectTorneo(t.id)}
                      className="cursor-pointer py-1 px-2 hover:text-green-500"
                    >
                      {t.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-2 text-center text-gray-300 text-sm">
                  <p>Regístrate para ver los torneos disponibles</p>
                  <NavLink
                    to="/register"
                    className="inline-block rounded bg-[#a0f000] px-3 py-1 text-black hover:bg-[#8cd000] transition"
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
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white p-2 text-black shadow-xl">
            <ul>
              <li className="flex items-center p-2 hover:bg-gray-200">
                <AiOutlineSetting className="mr-2" /> Configuración
              </li>
              {isAuthenticated ? (
                <>
                  <li className="flex items-center p-2 hover:bg-gray-200">
                    <FiUser className="mr-2" /> {user.name}
                  </li>
                  <li
                    onClick={() => logout()}
                    className="flex cursor-pointer items-center p-2 hover:bg-gray-200"
                  >
                    <AiOutlineLogout className="mr-2" /> Cerrar Sesión
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center p-2 hover:bg-gray-200">
                    <NavLink to="/login" className="flex items-center">
                      <AiOutlineLogin className="mr-2" /> Iniciar Sesión
                    </NavLink>
                  </li>
                  <li className="flex items-center p-2 hover:bg-gray-200">
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

      {/* Menú lateral admin */}
      {isAuthenticated && user?.rol === "admin" && (
        <animated.div
          style={menuAnimation}
          className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-[#003c3c] p-6 text-white shadow-2xl"
        >
          <button
            onClick={() => setShowMenu(false)}
            className="mb-6 text-3xl text-[#a0f000] hover:text-[#8cd000] transition"
          >
            <FiX />
          </button>
          <ul className="space-y-4">
            {["equipos","categorias","pais","jugadores","torneos","partidos"].map((r) => (
              <li key={r}>
                <NavLink
                  to={`/${r}`}
                  className="hover:text-[#a0f000] transition"
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </NavLink>
              </li>
            ))}
          </ul>
        </animated.div>
      )}
    </nav>
  );
}

export default Navbar;
