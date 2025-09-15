import React, { useState, useEffect } from "react";

const FormularioPartido = ({  setCreator, selectedPartido, onSave, initialFecha, torneoInfo }) => {

  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    fecha: "",
    date: "",
    equipoLocalId: "",
    equipoVisitanteId: "",
    torneoId: torneoInfo?.id || "",
    categoriaId: [],
    estado: "Pendiente",
    // Nuevo campo para guardar el grupo del partido
    group: "",
      groupLocal: "",
  groupVisitante: ""
    
  });
  
  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [maxFechas, setMaxFechas] = useState(null);
  const [errorFecha, setErrorFecha] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]); // Nuevo estado para grupos del torneo
  const [isInterzonal, setIsInterzonal] = useState(false);

  // Fetch de equipos, torneos y categorías con token en los headers
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        // Equipos
        const equiposResponse = await fetch(`${apiUrl}/equipo`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (equiposResponse.ok) {
          setEquipos(await equiposResponse.json());
        } else {
          console.error("Error fetching equipos:", await equiposResponse.text());
        }

        // Torneos
        const torneosResponse = await fetch(`${apiUrl}/torneo`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (torneosResponse.ok) {
          setTorneos(await torneosResponse.json());
        } else {
          console.error("Error fetching torneos:", await torneosResponse.text());
        }

        // Categorías
     
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Fetch de datos del partido para edición (si existe)
  useEffect(() => {
    const fetchPartido = async () => {
      if (selectedPartido) {
        const token = localStorage.getItem("access_token");
        try {
          const response = await fetch(`${apiUrl}/partido/${selectedPartido.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          });
          if (response.ok) {
            const data = await response.json();
            setFormData({
              fecha: initialFecha || data.fecha || "",
              date: data.date?.slice(0, 16) || "",
              equipoLocalId: data.equipoLocal.id || "",
              equipoVisitanteId: data.equipoVisitante.id || "",
              torneoId: torneoInfo?.id || data.torneo.id || "",
              categoriaId: data.category ? [data.category.id] : [],
              estado: data.estado || "Pendiente",
              // Si existe un grupo en el partido, lo asignamos
                      group:           data.group           || "", 
        groupLocal:      data.groupLocal      || "",
        groupVisitante:  data.groupVisitante  || ""
            });
            if(data.groupLocal || data.groupVisitante){
              setIsInterzonal(true);
              
            }
            console.log(data);
          } else {
            console.error("Error fetching partido:", await response.text());
          }
        } catch (error) {
          console.error("Error fetching partido:", error);
        }
      }
    };
    fetchPartido();
  }, [selectedPartido, apiUrl]);

  // ——— AÑADE ESTO ———
useEffect(() => {
  // Cuando cambie el torneo seleccionado
  if (!formData.torneoId) {
    // Si deselecciona torneo, limpio categorías y selección
    setCategorias([]);
    setFormData(prev => ({ ...prev, categoriaId: [] }));
    return;
  }

  const token = localStorage.getItem("access_token");
  fetch(`${apiUrl}/torneo/${formData.torneoId}/categorias`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al cargar categorías");
      return res.json();
    })
    .then(data => {
      setCategorias(data);
      // Auto-marcamos todas las categorías
      setFormData(prev => ({
        ...prev,
        categoriaId: data.map(cat => cat.id),
      }));
    })
    .catch(err => {
      console.error(err);
      setCategorias([]);
      setFormData(prev => ({ ...prev, categoriaId: [] }));
    });
}, [formData.torneoId, apiUrl]);

  // Actualiza máximo de fechas y grupos disponibles al cambiar el torneo
  useEffect(() => {
    if (formData.torneoId && torneos.length > 0) {
      const selectedTournament = torneos.find(
        (t) => t.id === Number(formData.torneoId)
      );
      if (selectedTournament) {
        setMaxFechas(selectedTournament.fechas);
        // Si el torneo tiene la propiedad groups (un array de strings), la establecemos en availableGroups
        if (selectedTournament.groups && Array.isArray(selectedTournament.groups)) {
          setAvailableGroups(selectedTournament.groups);
        } else {
          setAvailableGroups([]);
        }
      } else {
        setMaxFechas(null);
        setAvailableGroups([]);
      }
    }
  }, [formData.torneoId, torneos]);

  useEffect(() => {
    if (!selectedPartido && initialFecha) {
      setFormData((prev) => ({ ...prev, fecha: initialFecha }));
    }
  }, [initialFecha]);
  

  const handleInputChange = (e) => {

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Si se selecciona un torneo, se actualiza maxFechas y availableGroups (ya se hace en el useEffect anterior)
    if (name === "fecha") {
      const num = Number(value);
      if (maxFechas && num > maxFechas) {
        setErrorFecha(`La fecha no puede ser mayor a ${maxFechas}`);
      } else {
        setErrorFecha("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (errorFecha) {
      alert(errorFecha);
      return;
    }
  
    
    const categoriasSeleccionadas = Array.isArray(formData.categoriaId)
      ? formData.categoriaId
      : [formData.categoriaId];
  
    categoriasSeleccionadas.forEach((categoriaId) => {
      const partido = {
        ...formData,
        categoriaId,
      };
  
      // Si estamos editando, mandamos info completa
      // Si estamos creando múltiples, eliminamos el id
      if (!selectedPartido) {
        delete partido.id; // aseguramos que no haya id
      }
  
      onSave(partido, !!selectedPartido);
    });
  
    setCreator(false);
  };
  
  

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-[#141414] border border-[#003c3c] p-6 rounded-lg shadow-2xl w-full max-w-md mx-4 space-y-4 text-white"
      >
        <h2 className="text-2xl font-bold text-center text-[#a0f000] uppercase tracking-wide mb-4">
          {selectedPartido ? "Editar Partido" : "Crear Partido"}
        </h2>
        {/* Torneo */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">Torneo:</label>
          <select
            name="torneoId"
            value={formData.torneoId}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f0f0] transition"
            required
          >
            <option value="">{selectedPartido ? "Seleccione torneo" : "Seleccione un torneo"}</option>
            {torneos.map((torneo) => (
              <option key={torneo.id} value={torneo.id}>
                {torneo.name}
              </option>
            ))}
          </select>
        </div>

        
          {availableGroups.length > 0 && (
          <div className="flex items-center space-x-2">
  <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={isInterzonal}
      onChange={e => {
        const chk = e.target.checked;
        setIsInterzonal(chk);
        if (!chk) setFormData(f => ({ ...f, groupLocal: "", groupVisitante: "" }));
      }}
      className="h-5 w-5 rounded border-2 border-[#a0f000] bg-transparent text-[#a0f000] focus:ring-0 transition"
    />
    <span className="text-white font-medium">Partido interzonal</span>
  </label>
          </div>
        )}

        {/* Selects de grupos */}
        {availableGroups.length > 0 && (
          isInterzonal ? (
            <>
              <div>
                <label className="block text-[#a0f000] mb-1">Grupo local</label>
                <select
                  name="groupLocal"
                  value={formData.groupLocal}
                  onChange={e => setFormData(f => ({ ...f, groupLocal: e.target.value }))}
                  className="w-full p-2 bg-[#1f1f1f] border border-[#003c3c] rounded"
                  required
                >
                  <option value="">-- Seleccione --</option>
                  {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[#a0f000] mb-1">Grupo visitante</label>
                <select
                  name="groupVisitante"
                  value={formData.groupVisitante}
                  onChange={e => setFormData(f => ({ ...f, groupVisitante: e.target.value }))}
                  className="w-full p-2 bg-[#1f1f1f] border border-[#003c3c] rounded"
                  required
                >
                  <option value="">-- Seleccione --</option>
                  {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[#a0f000] mb-1">Grupo</label>
              <select
                name="group"
                value={formData.group}
                onChange={e => setFormData(f => ({ ...f, group: e.target.value }))}
                className="w-full p-2 bg-[#1f1f1f] border border-[#003c3c] rounded"
                required
              >
                <option value="">-- Seleccione --</option>
                {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )
        )}
        {/* Categoría */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">
            Categoría:
          </label>
{/* Sección visual con checkboxes como en FormularioTorneos */}
<div>
  <label className="block text-sm font-semibold text-[#a0f000] mb-2">
    Categorías:
  </label>
  {categorias.length > 0 ? (
    <div className="flex flex-wrap gap-3 justify-center">
      {categorias.map((categoria) => (
        <div key={categoria.id} className="flex items-center">
          <input
            type="checkbox"
            id={`cat-${categoria.id}`}
            value={categoria.id}
            checked={formData.categoriaId.includes(categoria.id)}
            onChange={(e) => {
              const id = Number(e.target.value);
              if (e.target.checked) {
                setFormData((prev) => ({
                  ...prev,
                  categoriaId: [...prev.categoriaId, id],
                }));
              } else {
                setFormData((prev) => ({
                  ...prev,
                  categoriaId: prev.categoriaId.filter((catId) => catId !== id),
                }));
              }
            }}
            className="hidden peer"
          />
          <label
            htmlFor={`cat-${categoria.id}`}
            className="cursor-pointer px-4 py-1 border border-[#444] rounded-md peer-checked:bg-green-500 peer-checked:text-black text-white hover:bg-gray-600 transition"
          >
            {categoria.name}
          </label>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-400">No hay categorías disponibles.</p>
  )}
</div>


        </div>

        <div className="flex justify-around">

        {/* Fecha (matchday) */}
        <div className="w-1/3">
          <label className="block font-semibold mb-1 text-[#a0f000]">
            Fecha :
          </label>
          <input
            type="number"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f0f0] transition"
            required
          />
          {errorFecha && (
            <p className="text-red-500 text-xs mt-1">{errorFecha}</p>
          )}
        </div>


        {/* Fecha y Hora */}
        <div className="w-1/2">
          <label className="block font-semibold mb-1 text-[#a0f000]">
            Dia y Hora:
          </label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000] transition"
            required
          />
        </div>

        </div>

        {/* Equipo Local */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">
            Equipo Local:
          </label>
          <select
            name="equipoLocalId"
            value={formData.equipoLocalId}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f0f0] transition"
            required
          >
            <option value="">
              {selectedPartido ? "Seleccione equipo local" : "Seleccione un equipo"}
            </option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.name}
              </option>
            ))}
          </select>
        </div>

        {/* Equipo Visitante */}
        <div>
          <label className="block font-semibold mb-1 text-[#a0f000]">
            Equipo Visitante:
          </label>
          <select
            name="equipoVisitanteId"
            value={formData.equipoVisitanteId}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f0f0] transition"
            required
          >
            <option value="">
              {selectedPartido ? "Seleccione equipo visitante" : "Seleccione un equipo"}
            </option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.name}
              </option>
            ))}
          </select>
        </div>



        {/* Selector de Estado */}
        <div>
          <label className="block font-semibold mb-2 text-[#a0f000]">
            Estado del Partido:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["Pendiente", "Finalizado", "Suspendido", "Postergado"].map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => handleInputChange({ target: { name: "estado", value: estado } })}
                className={`px-3 py-2 rounded-md font-semibold text-sm transition-all duration-200 border ${
                  formData.estado === estado
                    ? "bg-[#a0f000] text-black border-[#a0f000]"
                    : "bg-[#1f1f1f] text-[#a0f000] border-[#003c3c] hover:bg-[#2a2a2a]"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>


        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="submit"
            className="bg-[#a0f000] text-black px-4 py-2 rounded-md font-bold hover:bg-[#8cd000] transition"
          >
            {selectedPartido ? "Guardar Cambios" : "Crear Partido"}
          </button>
          <button
            type="button"
            onClick={() => setCreator(false)}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-800 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioPartido;
