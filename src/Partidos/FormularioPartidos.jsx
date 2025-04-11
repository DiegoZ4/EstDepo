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
    group: ""
  });
  
  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [maxFechas, setMaxFechas] = useState(null);
  const [errorFecha, setErrorFecha] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]); // Nuevo estado para grupos del torneo

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
        const categoriasResponse = await fetch(`${apiUrl}/torneo/${torneoInfo?.id}/categorias`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (categoriasResponse.ok) {
          setCategorias(await categoriasResponse.json());
        } else {
          console.error("Error fetching categorías:", await categoriasResponse.text());
        }
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
              group: data.group || ""
            });
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

  // Alternar estado entre "Pendiente" y "Finalizado"
  const toggleEstado = () => {
    const nuevoEstado = formData.estado === "Pendiente" ? "Finalizado" : "Pendiente";
    handleInputChange({ target: { name: "estado", value: nuevoEstado } });
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

         {/* Nueva Sección para Seleccionar Grupo */}
         {availableGroups && availableGroups.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-[#a0f000] mb-1">
              Grupo:
            </label>
            <select
              name="group"
              value={formData.group}
              onChange={handleInputChange}
              className="w-full p-2 bg-[#1f1f1f] border border-[#003c3c] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f0f0] transition"
              required
            >
              <option value="">Seleccione un grupo</option>
              {availableGroups.map((grupo, index) => (
                <option key={index} value={grupo}>
                  {grupo}
                </option>
              ))}
            </select>
          </div>
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



        {/* Switch de Estado */}
        <div
  className="flex items-center justify-between p-2 rounded-md border border-[#003c3c] cursor-pointer transition"
  onClick={toggleEstado}
  style={{
    backgroundColor: formData.estado === "Finalizado" ? "#a0f000" : "#1f1f1f",
  }}
>
  <span className={`font-semibold ${formData.estado === "Finalizado" ? "text-[#1f1f1f]" : "text-[#a0f000]"}`}>
    {formData.estado === "Finalizado" ? "Finalizado" : "Pendiente"}
  </span>
  <div className="relative w-10 h-5 bg-gray-500 rounded-full">
    <div
      className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
        formData.estado === "Finalizado" ? "translate-x-5" : "translate-x-0"
      }`}
    />
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
