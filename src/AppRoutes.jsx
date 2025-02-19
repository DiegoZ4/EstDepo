// AppRoutes.jsx
import React, { lazy } from "react";
import { useRoutes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Link } from "react-router-dom";


// Lazy load de los componentes
const Home = lazy(() => import("./home/home"));
const Categoria = lazy(() => import("./Categorias/Categoria"));
const FormularioCategorias = lazy(() => import("./Categorias/FormularioCategorias"));
const Fixture = lazy(() => import("./fixture/fixture"));
const Admin = lazy(() => import("./admin/admin"));
const Tablas = lazy(() => import("./tablas/tablas"));
const Login = lazy(() => import("./login/login"));
const Register = lazy(() => import("./register/register"));
const Suscipcion = lazy(() => import("./suscipcion/suscipcion"));
const Equipos = lazy(() => import("./Equipos/equipos"));
const FormularioEquipo = lazy(() => import("./Equipos/FormularioEquipo"));
const Pais = lazy(() => import("./Pais/pais"));
const FormularioPais = lazy(() => import("./Pais/FormularioPais"));
const ListaPais = lazy(() => import("./Pais/ListaPais"));
const Torneos = lazy(() => import("./torneos/torneos"));
const FormularioTorneo = lazy(() => import("./torneos/FormularioTorneos"));
const ListaTorneos = lazy(() => import("./torneos/ListaTorneos"));
const Partidos = lazy(() => import("./Partidos/partidos"));
const FormularioPartido = lazy(() => import("./Partidos/FormularioPartidos"));
const ListaPartidos = lazy(() => import("./Partidos/ListaPartidos"));
const PartidoDetail = lazy(() => import("./Partidos/PartidoDetail"));
const Jugadores = lazy(() => import("./Jugadores/Jugadores"));
const FormularioJugador = lazy(() => import("./Jugadores/FormularioJugadores"));
const ListaJugadores = lazy(() => import("./Jugadores/ListaJugadores"));
const Goleadores = lazy(() => import("./Goleadores/goleadores"));

// Rutas protegidas para usuarios
const Usuarios = lazy(() => import("./users/Usuarios"));
const FormularioUsuarios = lazy(() => import("./users/FormularioUsuario"));
const ListaUsuarios = lazy(() => import("./users/ListaUsuarios"));

const AppRoutes = () => {
  let routes = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/categorias", element: <Categoria /> },
    { path: "/categorias/formulario", element: <FormularioCategorias /> },
    { path: "/fixture", element: <Fixture /> },
    { path: "/admin", element: <Admin /> },
    { path: "/tablas", element: <Tablas /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/suscipcion", element: <Suscipcion /> },
    { path: "/equipos", element: <Equipos /> },
    { path: "/equipos/formulario", element: <FormularioEquipo /> },
    { path: "/equipos/editar/:id", element: <FormularioEquipo /> },
    { path: "/pais", element: <Pais /> },
    { path: "/pais/formulario", element: <FormularioPais /> },
    { path: "/pais/editar/:id", element: <FormularioPais /> },
    { path: "/pais/lista", element: <ListaPais /> },
    { path: "/torneos", element: <Torneos /> },
    { path: "/torneos/editar/:id", element: <FormularioTorneo /> },
    { path: "/torneos/lista", element: <ListaTorneos /> },
    { path: "/partidos", element: <Partidos /> },
    { path: "/partidos/formulario", element: <FormularioPartido /> },
    { path: "/partidos/editar/:id", element: <FormularioPartido /> },
    { path: "/partidos/lista", element: <ListaPartidos /> },
    { path: "/partidos/:id", element: <PartidoDetail /> },
    { path: "/jugadores", element: <Jugadores /> },
    { path: "/jugadores/formulario", element: <FormularioJugador /> },
    { path: "/jugadores/editar/:id", element: <FormularioJugador /> },
    { path: "/jugadores/lista", element: <ListaJugadores /> },
    { path: "/goleadores", element: <Goleadores /> },
    // Rutas protegidas para ABM de usuarios
    {
      path: "/usuarios",
      element: <ProtectedRoute />,
      children: [
        { path: "", element: <Usuarios /> },
        { path: "formulario", element: <FormularioUsuarios /> },
        { path: "editar/:id", element: <FormularioUsuarios /> },
        { path: "lista", element: <ListaUsuarios /> },
      ],
    },
  ]);

  return <div className="p-4 md:p-6 animate-fade-in">{routes}</div>;
};

export default AppRoutes;
