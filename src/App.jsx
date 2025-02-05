import { useRoutes, BrowserRouter } from 'react-router-dom';
import Navbar from './navbar/navbar';
import Home from './home/home';
import Tablas from './tablas/tablas';
import Login from './login/login';
import Register from './register/register';
import Suscipcion from './suscipcion/suscipcion';
import Equipos from './Equipos/equipos';
import Fixture from './fixture/fixture';
import Admin from './admin/admin';
import FormularioEquipo from './Equipos/FormularioEquipo';
import Pais from './Pais/pais';
import FormularioPais from './Pais/FormularioPais';
import ListaPais from './Pais/ListaPais';
import Categoria from './Categorias/Categoria';
import FormularioCategorias from './Categorias/FormularioCategorias';
import Torneos from './torneos/torneos';
import FormularioTorneo from './torneos/FormularioTorneos';
import ListaTorneos from './torneos/ListaTorneos';
import Partidos from './Partidos/partidos';
import FormularioPartido from './Partidos/FormularioPartidos';
import ListaPartidos from './Partidos/ListaPartidos';
import PartidoDetail from './Partidos/PartidoDetail';
import Jugadores from './Jugadores/Jugadores';
import FormularioJugador from './Jugadores/FormularioJugadores';
import ListaJugadores from './Jugadores/ListaJugadores';
import Goleadores from './Goleadores/goleadores';
import './index.css'; // Asegúrate de importar el CSS de Tailwind
import './App.css';

const AppRoutes = () => {
  let routes = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/categorias', element: <Categoria /> },
    { path: '/categorias/formulario', element: <FormularioCategorias /> },
    { path: '/fixture', element: <Fixture /> },
    { path: '/admin', element: <Admin /> },
    { path: '/tablas', element: <Tablas /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/suscipcion', element: <Suscipcion /> },
    { path: '/equipos', element: <Equipos /> },
    { path: '/equipos/formulario', element: <FormularioEquipo /> },
    { path: '/equipos/editar/:id', element: <FormularioEquipo /> },
    { path: '/pais', element: <Pais /> },
    { path: '/pais/formulario', element: <FormularioPais /> },
    { path: '/pais/editar/:id', element: <FormularioPais /> },
    { path: '/pais/lista', element: <ListaPais /> },
    { path: '/torneos', element: <Torneos /> },
    { path: '/torneos/editar/:id', element: <FormularioTorneo /> },
    { path: '/torneos/lista', element: <ListaTorneos /> },
    { path: '/partidos', element: <Partidos /> },
    { path: '/partidos/formulario', element: <FormularioPartido /> },
    { path: '/partidos/editar/:id', element: <FormularioPartido /> },
    { path: '/partidos/lista', element: <ListaPartidos /> },
    { path: '/partidos/:id', element: <PartidoDetail /> },
    { path: '/jugadores', element: <Jugadores /> },
    { path: '/jugadores/formulario', element: <FormularioJugador /> },
    { path: '/jugadores/editar/:id', element: <FormularioJugador /> },
    { path: '/jugadores/lista', element: <ListaJugadores /> },
    { path: '/goleadores', element: <Goleadores /> },
  ]);

  return (
    <div className="p-4 md:p-6 animate-fade-in">{routes}</div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#141414] text-white flex flex-col">
        <Navbar />
        <main className="flex-1 mt-16"> {/* Ajuste para el Navbar fijo */}
          <AppRoutes />
        </main>
        <footer className="bg-[#003c3c] text-center py-4 text-sm text-gray-300">
          © {new Date().getFullYear()} Est Depo. Todos los derechos reservados.
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
