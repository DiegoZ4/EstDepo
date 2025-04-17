import { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { colores } from "../colores";
import { AuthContext } from "../auth/auth.context";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { isAuthenticated } = useContext(AuthContext);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [torneosRecomendados, setTorneosRecomendados] = useState([]);


  const navigate = useNavigate();

const handleSelectTorneo = (torneoId) => {
  navigate(`/torneo/${torneoId}`);
};

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
        setTorneosRecomendados(data);
      } catch (error) {
        console.error("Error fetching torneos:", error);
      }
    };
    fetchTorneos();
  }, [apiUrl]);
  useEffect(() => {
    if (isAuthenticated) {
      // Simulación de torneos recomendados
      setTorneosRecomendados([
        { id: 1, name: "Liga Primavera" },
        { id: 2, name: "Copa Sub 20" },
      ]);
    }
  }, [isAuthenticated]);

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: colores.fondoPrincipal, color: colores.texto }}
    >
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-8 py-12 space-y-6 text-center">
        <h1
          className="text-3xl sm:text-5xl font-bold uppercase tracking-wide"
          style={{ color: colores.acento }}
        >
          Bienvenido a EstDepo
        </h1>

        <p className="text-base sm:text-lg max-w-xl">
          Esta es tu plataforma para seguir todo lo que pasa en la liga:
          estadísticas actualizadas, resultados de partidos, fixture, tablas de posiciones y mucho más.
        </p>

        <p className="text-sm sm:text-base text-gray-400 max-w-md">
          Navegá con el menú y comenzá a explorar todo el contenido de tu torneo favorito.
        </p>

        {/* Condicional según token */}
        <div className="mt-8 w-full max-w-md p-6 rounded-lg shadow-lg" style={{ backgroundColor: colores.inputBg }}>
          {!isAuthenticated ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-white">Para comenzar, registrate o iniciá sesión</h2>
              <div className="flex justify-center gap-4">
              <NavLink
  to="/login"
  className="px-5 py-2 rounded-lg bg-[#1a1a1a] text-[#a0f000] font-semibold border border-[#a0f000] shadow-md hover:bg-[#a0f000] hover:text-black transition-colors duration-300"
>
  Iniciar sesión
</NavLink>

<NavLink
  to="/register"
  className="px-5 py-2 flex items-center rounded-lg bg-[#1a1a1a] text-[#a0f000] font-semibold border border-[#a0f000] shadow-md hover:bg-[#a0f000] hover:text-black transition-colors duration-300"
>
  Registrarse
</NavLink>

              </div>
            </>
          ) : (
            <>
<h2 className="text-xl font-semibold mb-10 text-white">Torneos que te pueden interesar</h2>
              <ul className="text-left text-white space-y-2">
                {torneosRecomendados.map((torneo) => (
                  <li key={torneo.id} className="border-b border-gray-700 pb-2">
                    <NavLink
                      to={`/torneo/${torneo.id}`}
                      className="hover:text-[#a0f000] transition font-medium"
                    >
                      {torneo.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
        <div className="mt-10 text-sm  text-gray-400 text-center">
          <p>¿Notaste algún error? Contactanos por WhatsApp</p>
          <a
            href="https://wa.me/+5491141431616" // reemplazá por tu número real
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            <FaWhatsapp className="mr-2 text-lg" />
            Contactar por WhatsApp
          </a>
        </div>
            </>
          )}
        </div>

        {/* Disclaimer con WhatsApp */}
      </main>
    </div>
  );
}
