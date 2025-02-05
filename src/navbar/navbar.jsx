import { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { NavLink } from "react-router-dom";
import { FiMenu, FiUser } from "react-icons/fi";
import { AiOutlineSetting, AiOutlineLogin, AiOutlineLogout, AiOutlineUserAdd } from "react-icons/ai";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isAuthenticated = false; // Cambiar esto según el estado de autenticación

  const menuAnimation = useSpring({
    transform: showMenu ? "translateX(0)" : "translateX(-100%)",
    opacity: showMenu ? 1 : 0,
    config: { duration: 200 },
  });

  // Cierra el menú de usuario si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".user-menu")) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between bg-[#141414] text-white px-6 py-4 shadow-lg fixed w-full z-50">
    {/* Botón de menú */}
    <div className="flex items-center">
      <button onClick={() => setShowMenu(!showMenu)} className="text-3xl text-[#a0f000] hover:text-[#8cd000] transition">
        <FiMenu />
      </button>

      {/* Links principales */}
      <div className="hidden md:flex space-x-6 ml-6">
        <NavLink to="/" className="hover:text-[#a0f000] transition">Est Depo</NavLink>
        <NavLink to="/tablas" className="hover:text-[#a0f000] transition">Tablas</NavLink>
        <NavLink to="/fixture" className="hover:text-[#a0f000] transition">Fixture</NavLink>
        <NavLink to="/goleadores" className="hover:text-[#a0f000] transition">Goleadores</NavLink>
      </div>
    </div>

    {/* Ícono de usuario */}
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
            <li className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition">
              <AiOutlineSetting className="mr-2" /> Configuración
            </li>
            {isAuthenticated ? (
              <li className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition">
                <AiOutlineLogout className="mr-2" /> Cerrar Sesión
              </li>
            ) : (
              <>
                <li className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition">
                  <AiOutlineLogin className="mr-2" /> Iniciar Sesión
                </li>
                <li className="flex items-center p-2 hover:bg-gray-200 cursor-pointer transition">
                  <AiOutlineUserAdd className="mr-2" /> Registrarse
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>

    {/* Menú lateral */}
    <animated.div
      style={menuAnimation}
      className={`absolute left-0 top-0 h-screen w-64 bg-[#003c3c] text-white p-6 shadow-2xl z-50 transition-transform`}
    >
      <button onClick={() => setShowMenu(false)} className="mb-6 text-3xl text-[#a0f000] hover:text-[#8cd000] transition">
        ✖
      </button>
      <ul className="space-y-4">
        <li><NavLink to="/equipos" className="hover:text-[#a0f000] transition">Equipos</NavLink></li>
        <li><NavLink to="/categorias" className="hover:text-[#a0f000] transition">Categorías</NavLink></li>
        <li><NavLink to="/pais" className="hover:text-[#a0f000] transition">Países</NavLink></li>
        <li><NavLink to="/jugadores" className="hover:text-[#a0f000] transition">Jugadores</NavLink></li>
        <li><NavLink to="/torneos" className="hover:text-[#a0f000] transition">Torneos</NavLink></li>
        <li><NavLink to="/partidos" className="hover:text-[#a0f000] transition">Partidos</NavLink></li>
        
      </ul>
    </animated.div>
  </nav>
  );
}

export default Navbar;
