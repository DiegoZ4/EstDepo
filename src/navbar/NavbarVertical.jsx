import { NavLink } from "react-router-dom";

export default function NavbarVertical() {
  return (
    <div className="w-64 absolute left-0 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold">Menú</h2>
      <ul>
        <li className="w-20 text-center mx-2"><NavLink to="/equipos" className={({ isActive }) => isActive ? activeStyle : undefined}>Equipos</NavLink></li>
        <li className="w-20 text-center mx-2"><NavLink to="/categorias" className={({ isActive }) => isActive ? activeStyle : undefined}>Categorias</NavLink></li>
        <li className="w-20 text-center mx-2"><NavLink to="/pais" className={({ isActive }) => isActive ? activeStyle : undefined}>Paises</NavLink></li>
        <li className="w-20 text-center mx-2"><NavLink to="/jugadores" className={({ isActive }) => isActive ? activeStyle : undefined}>Jugadores</NavLink></li>
        <li className="w-20 text-center mx-2"><NavLink to="/torneos" className={({ isActive }) => isActive ? activeStyle : undefined}>torneos</NavLink></li>
      </ul>
    </div>
  );
}
