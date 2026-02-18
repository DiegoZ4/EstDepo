import { useState, useEffect } from "react";
import ListaPartidos from "./ListaPartidos";
import FormularioPartidos from "./FormularioPartidos";

const Partidos = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [partidos, setPartidos] = useState([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState([]);
  const [creator, setCreator] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState(null);
  const [editId, setEditId] = useState(null);

  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    torneo: "",
    categoria: "",
    equipoLocal: "",
    equipoVisitante: "",
    fecha: "",
    estado: "",
    busqueda: ""
  });

  // Estado para mostrar/ocultar filtros
  const [filtrosExpanded, setFiltrosExpanded] = useState(false);

  // Estados para las opciones de los selectores
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    const fetchPartidos = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/partido`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          console.error("Error fetching partidos:", await response.text());
          return;
        }
        const data = await response.json();
        setPartidos(data);
        setPartidosFiltrados(data);
      } catch (error) {
        console.error("Error fetching partidos:", error);
      }
    };

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
        if (response.ok) {
          setTorneos(await response.json());
        }
      } catch (error) {
        console.error("Error fetching torneos:", error);
      }
    };

    const fetchCategorias = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/categories`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (response.ok) {
          setCategorias(await response.json());
        }
      } catch (error) {
        console.error("Error fetching categorias:", error);
      }
    };

    const fetchEquipos = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/equipo`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (response.ok) {
          setEquipos(await response.json());
        }
      } catch (error) {
        console.error("Error fetching equipos:", error);
      }
    };

    fetchPartidos();
    fetchTorneos();
    fetchCategorias();
    fetchEquipos();
  }, [apiUrl]);

  // Filtrar partidos cuando cambien los filtros
  useEffect(() => {
    const filtrarPartidos = () => {
      let partidosFiltrados = [...partidos];

      if (filtros.torneo) {
        partidosFiltrados = partidosFiltrados.filter(p => 
          p.torneo?.id === parseInt(filtros.torneo) || p.torneoId === parseInt(filtros.torneo)
        );
      }

      if (filtros.categoria) {
        partidosFiltrados = partidosFiltrados.filter(p => 
          p.category?.id === parseInt(filtros.categoria) || p.categoriaId === parseInt(filtros.categoria)
        );
      }

      if (filtros.equipoLocal) {
        partidosFiltrados = partidosFiltrados.filter(p => 
          p.equipoLocal?.id === parseInt(filtros.equipoLocal) || p.equipoLocalId === parseInt(filtros.equipoLocal)
        );
      }

      if (filtros.equipoVisitante) {
        partidosFiltrados = partidosFiltrados.filter(p => 
          p.equipoVisitante?.id === parseInt(filtros.equipoVisitante) || p.equipoVisitanteId === parseInt(filtros.equipoVisitante)
        );
      }

      if (filtros.fecha) {
        partidosFiltrados = partidosFiltrados.filter(p => 
          p.fecha === filtros.fecha || p.fecha === parseInt(filtros.fecha)
        );
      }

      if (filtros.estado) {
        partidosFiltrados = partidosFiltrados.filter(p => 
          p.estado?.toLowerCase() === filtros.estado.toLowerCase()
        );
      }

      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        partidosFiltrados = partidosFiltrados.filter(p => 
          p.equipoLocal?.name?.toLowerCase().includes(busqueda) ||
          p.equipoVisitante?.name?.toLowerCase().includes(busqueda) ||
          p.torneo?.name?.toLowerCase().includes(busqueda) ||
          p.category?.name?.toLowerCase().includes(busqueda)
        );
      }

      setPartidosFiltrados(partidosFiltrados);
    };

    filtrarPartidos();
  }, [filtros, partidos]);

  // Función para manejar cambios en los filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      torneo: "",
      categoria: "",
      equipoLocal: "",
      equipoVisitante: "",
      fecha: "",
      estado: "",
      busqueda: ""
    });
    setPartidosFiltrados(partidos);
  };

  const handleEdit = (partido) => {
    setSelectedPartido(partido);
    setEditId(partido.id);
    setCreator(true);
  };

  const savePartido = async (partido) => {
    const token = localStorage.getItem("access_token");
    const method = selectedPartido ? "PUT" : "POST";
    const endpoint = selectedPartido
      ? `${apiUrl}/partido/${selectedPartido.id}`
      : `${apiUrl}/partido`;

    const bodyData = {
      equipoVisitanteId: partido.equipoVisitanteId,
      equipoLocalId: partido.equipoLocalId,
      torneoId: partido.torneoId,
      categoriaId: partido.categoriaId,
      fecha: partido.fecha,
      date: partido.date,
      estado: partido.estado,
      group: partido.group,
      groupLocal: partido.groupLocal,
      groupVisitante: partido.groupVisitante
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        console.error("Error saving partido:", await response.text());
      } else {
        // Recargar datos después de guardar
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${apiUrl}/partido`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPartidos(data);
          setPartidosFiltrados(data);
        }
        setCreator(false);
        setSelectedPartido(null);
      }
    } catch (error) {
      console.error("Error saving partido:", error);
    }
  };

  const deletePartido = async (id) => {
    const token = localStorage.getItem("access_token");
    try {
      await fetch(`${apiUrl}/partido/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      // Recargar datos después de eliminar
      const response = await fetch(`${apiUrl}/partido`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPartidos(data);
        setPartidosFiltrados(data);
      }
    } catch (error) {
      console.error("Error deleting partido:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-gradient-accent uppercase tracking-wide">
        Gestión de Partidos
      </h1>

      {/* Filtros de Búsqueda */}
      <div className="glass-card mb-6">
        {/* Header de filtros con botón para expandir/contraer */}
        <div 
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-t-3xl"
          onClick={() => setFiltrosExpanded(!filtrosExpanded)}
        >
          <h3 className="text-lg font-semibold text-[#a0f000]">Filtros de Búsqueda</h3>
          <div className="flex items-center space-x-2">
            {Object.values(filtros).filter(valor => valor !== "").length > 0 && (
              <span className="bg-[#a0f000] text-black text-xs px-2 py-1 rounded-full font-bold">
                {Object.values(filtros).filter(valor => valor !== "").length}
              </span>
            )}
            <svg 
              className={`w-5 h-5 text-[#a0f000] transition-transform duration-200 ${filtrosExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Contenido de filtros (colapsable) */}
        {filtrosExpanded && (
          <div className="px-4 pb-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Búsqueda general</label>
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                placeholder="Buscar por equipo, torneo o categoría..."
                className="input-modern w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Torneo</label>
            <select
              value={filtros.torneo}
              onChange={(e) => handleFiltroChange('torneo', e.target.value)}
              className="input-modern w-full"
            >
              <option value="">Todos los torneos</option>
              {torneos.map(torneo => (
                <option key={torneo.id} value={torneo.id}>
                  {torneo.name || torneo.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Categoría</label>
            <select
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              className="input-modern w-full"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Equipo Local</label>
            <select
              value={filtros.equipoLocal}
              onChange={(e) => handleFiltroChange('equipoLocal', e.target.value)}
              className="input-modern w-full"
            >
              <option value="">Todos los equipos</option>
              {equipos.map(equipo => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Equipo Visitante</label>
            <select
              value={filtros.equipoVisitante}
              onChange={(e) => handleFiltroChange('equipoVisitante', e.target.value)}
              className="input-modern w-full"
            >
              <option value="">Todos los equipos</option>
              {equipos.map(equipo => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Fecha</label>
            <input
              type="number"
              min="1"
              value={filtros.fecha}
              onChange={(e) => handleFiltroChange('fecha', e.target.value)}
              placeholder="Número de fecha"
              className="input-modern w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              className="input-modern w-full"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>

            <div className="flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="btn-outline px-4 py-2 text-sm !text-gray-400 !border-gray-600 hover:!text-white"
              >
                Limpiar Filtros
              </button>
            </div>

            <div className="mt-3 text-sm text-gray-400">
              Mostrando {partidosFiltrados.length} de {partidos.length} partidos
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setCreator(true);
            setSelectedPartido(null);
            setEditId(null);
          }}
          className="btn-primary px-4 py-2"
        >
          Crear Partido
        </button>
      </div>

      <ListaPartidos
        partidos={partidosFiltrados}
        onEdit={handleEdit}
        onDelete={deletePartido}
      />

      {creator && (
        <FormularioPartidos
          setCreator={setCreator}
          selectedPartido={selectedPartido}
          onSave={savePartido}
          editId={editId}
        />
      )}
    </div>
  );
};

export default Partidos;
