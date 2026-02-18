import React, { useState, useEffect, useRef } from "react";

const FormularioJugador = ({ setCreator, selectedJugador, onSave, defaultCategoriaId, defaultEquipoId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [equipos, setEquipos] = useState([]);
  const [paises, setPaises] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [uploading, setUploading] = useState(false);
  const dropzoneRef = useRef(null);

  const posiciones = ["Portero", "Defensor", "Centrocampista", "Delantero"];
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    edad: "",
    posicion: "Portero",
    goles: 0,
    asistencias: 0,
    fechaNacimiento: "2000-01-01",
    altura: "",
    peso: "",
    tarjetasAmarillas: 0,
    tarjetasRojas: 0,
    description: "",
    equipoId: defaultEquipoId || 0,
    categoriesId: defaultCategoriaId || 0,
    paisId: 0,
  });

  // Cargar datos (equipos, países, categorías)
  useEffect(() => {
    const fetchDatos = async () => {
      const token = localStorage.getItem("access_token");
      try {
        // Fetch equipos
        const equiposRes = await fetch(`${apiUrl}/equipo`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (equiposRes.ok) {
          const equiposData = await equiposRes.json();
          setEquipos(equiposData);
          console.log("✅ Equipos cargados:", equiposData.length);
        } else {
          console.error("❌ Error al cargar equipos:", equiposRes.status);
        }

        // Fetch países
        const paisesRes = await fetch(`${apiUrl}/pais`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (paisesRes.ok) {
          const paisesData = await paisesRes.json();
          setPaises(paisesData);
          console.log("✅ Países cargados:", paisesData.length);
          console.log("📍 Países disponibles:", paisesData.map(p => `${p.id}: ${p.name}`));
        } else {
          console.error("❌ Error al cargar países:", paisesRes.status);
        }

        // Fetch categorías con manejo de errores mejorado
        const categoriasRes = await fetch(`${apiUrl}/categories`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        
        if (categoriasRes.ok) {
          const contentType = categoriasRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const categoriasData = await categoriasRes.json();
            setCategorias(categoriasData);
            console.log("✅ Categorías cargadas:", categoriasData.length);
          } else {
            const textResponse = await categoriasRes.text();
            console.error("❌ Error: La respuesta de categorías NO es JSON:", textResponse.substring(0, 200));
            alert("Error del servidor: El endpoint de categorías no está respondiendo correctamente. Por favor contacte al administrador.");
          }
        } else {
          console.error("❌ Error al cargar categorías - Status:", categoriasRes.status);
          const errorText = await categoriasRes.text();
          console.error("❌ Respuesta del servidor:", errorText.substring(0, 200));
          
          if (categoriasRes.status === 502) {
            alert("Error 502: El servidor de categorías no está disponible. Por favor contacte al administrador del sistema.");
          }
        }
      } catch (error) {
        console.error("❌ Error general al cargar datos:", error);
        alert("Error de conexión. Verifique su conexión a internet.");
      }
    };
    fetchDatos();
  }, [apiUrl]);

  // Si se edita un jugador, se cargan sus datos
  useEffect(() => {
    if (selectedJugador) {
      const paisIdValue = selectedJugador.pais?.id || "";
      const equipoIdValue = selectedJugador.equipo?.id || "";
      const categoriaIdValue = selectedJugador.category?.id || "";
      
      console.log("🔄 Cargando datos del jugador para edición:");
      console.log("   Jugador:", selectedJugador.name);
      console.log("   País ID:", paisIdValue, "- País:", selectedJugador.pais?.name);
      console.log("   Equipo ID:", equipoIdValue, "- Equipo:", selectedJugador.equipo?.name);
      console.log("   Categoría ID:", categoriaIdValue, "- Categoría:", selectedJugador.category?.name);
      
      setFormData({
        name: selectedJugador.name || "",
        image: selectedJugador.image || "",
        edad: selectedJugador.edad || "",
        posicion: selectedJugador.posicion || "Portero",
        goles: selectedJugador.goles || 0,
        asistencias: selectedJugador.asistencias || 0,
        fechaNacimiento: selectedJugador.fechaNacimiento || "",
        altura: selectedJugador.altura || "",
        peso: selectedJugador.peso || "",
        tarjetasAmarillas: selectedJugador.tarjetasAmarillas || 0,
        tarjetasRojas: selectedJugador.tarjetasRojas || 0,
        description: selectedJugador.description || "",
        equipoId: equipoIdValue,
        categoriesId: categoriaIdValue,
        paisId: paisIdValue,
      });
    }
  }, [selectedJugador]);

  // Manejo de inputs (con conversión a número donde corresponda)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const isNumberField = ["equipoId", "paisId", "categoriesId", "edad", "goles", "asistencias", "tarjetasAmarillas", "tarjetasRojas", "altura", "peso"].includes(name);
  
    if (name === "categoriesId") {
      const fechaEstimada = calcularFechaPorCategoria(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
        fechaNacimiento: fechaEstimada || prev.fechaNacimiento,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: isNumberField
          ? value === "" ? null : Number(value)
          : value,
      }));
    }
  };
  

  // Función para subir archivo (imagen) mediante drag & drop o input
  const uploadFile = async (file) => {
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${apiUrl}/upload/jugador`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formDataUpload,
      });
      if (!response.ok) {
        const errorMsg = await response.text();
        console.error("Error uploading file:", errorMsg);
        return;
      }
      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.add("bg-[#a0f000]/10");
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove("bg-[#a0f000]/10");
    }
  };

  const calcularFechaPorCategoria = (categoriaId) => {
    const cat = categorias.find((c) => c.id === Number(categoriaId));
    if (!cat || !cat.name) return "";
  
    const match = cat.name.match(/Sub\s*(\d+)/i);
    if (!match) return "";
  
    const subEdad = parseInt(match[1], 10);
    if (isNaN(subEdad)) return "";
  
    const currentYear = new Date().getFullYear();
    const nacimientoEstimado = currentYear - subEdad;
  
    return `${nacimientoEstimado}-01-01`;
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove("bg-[#a0f000]/10");
    }
    const file = e.dataTransfer.files[0];
    uploadFile(file);
  };

  const handleSubmit = (e) => {
    console.log(formData);
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setCreator(false)}
    >
      <div
        className="glass-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center uppercase tracking-wide text-gradient-accent">
          {selectedJugador ? "Actualizar Jugador" : "Crear Jugador"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          {/* Fila 1: Nombre / Nacimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Nombre
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className="input-modern w-full"
              />
            </div>
          </div>
          {/* Fila 2: Altura / Peso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Altura (cm)
              </label>
              <input
                type="number"
                name="altura"
                value={formData.altura}
                onChange={handleInputChange}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Peso (kg)
              </label>
              <input
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleInputChange}
                className="input-modern w-full"
              />
            </div>
          </div>
          {/* Fila 3: Subir Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Subir Imagen
            </label>
            <div
              ref={dropzoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="w-full rounded-xl border-2 border-dashed border-gray-600/60 bg-white/5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:border-[#a0f000]/40 p-4"
            >
              <p className="text-[#a0f000] m-2 font-medium text-sm">
                Arrastre aquí
              </p>
              <p className="text-gray-500 text-xs">o</p>
              <label className="btn-primary px-3 py-1.5 m-2 text-sm cursor-pointer">
                Seleccione un archivo
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {uploading && (
              <p className="text-yellow-400 text-center text-sm mt-2">Subiendo imagen...</p>
            )}
            {formData.image && (
              <p className="text-xs text-center mt-1.5 text-gray-400 truncate">
                Imagen subida: {formData.image}
              </p>
            )}
          </div>
          {/* Fila 4: Edad / Tarjetas Rojas / Tarjetas Amarillas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Edad
              </label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleInputChange}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                T. Rojas
              </label>
              <input
                type="number"
                name="tarjetasRojas"
                value={formData.tarjetasRojas}
                onChange={handleInputChange}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                T. Amarillas
              </label>
              <input
                type="number"
                name="tarjetasAmarillas"
                value={formData.tarjetasAmarillas}
                onChange={handleInputChange}
                className="input-modern w-full"
              />
            </div>
          </div>
          {/* Fila 5: País / Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                País
              </label>
              <select
                name="paisId"
                value={formData.paisId || ""}
                onChange={handleInputChange}
                required
                className="input-modern w-full"
              >
                <option value="">Seleccione un país</option>
                {paises.length > 0 ? (
                  paises.map((pais) => (
                    <option key={pais.id} value={pais.id}>
                      {pais.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Cargando países...</option>
                )}
              </select>
              {formData.paisId && (
                <p className="text-xs mt-1 text-[#a0f000]">
                  País seleccionado: {paises.find(p => p.id === Number(formData.paisId))?.name || formData.paisId}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Categoría
              </label>
              <select
                name="categoriesId"
                value={formData.categoriesId || ""}
                onChange={handleInputChange}
                className="input-modern w-full"
              >
                <option value="">Sin categoría</option>
                {categorias.length > 0 ? (
                  categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Servicio no disponible</option>
                )}
              </select>
              {categorias.length === 0 && (
                <p className="text-xs mt-1 text-orange-400">
                  Servidor de categorías no disponible.
                </p>
              )}
              {formData.categoriesId && categorias.length > 0 && (
                <p className="text-xs mt-1 text-[#a0f000]">
                  Categoría: {categorias.find(c => c.id === Number(formData.categoriesId))?.name || formData.categoriesId}
                </p>
              )}
            </div>
          </div>
          {/* Fila 6: Equipo / Posición */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Equipo
              </label>
              <select
                name="equipoId"
                value={formData.equipoId}
                onChange={handleInputChange}
                required
                className="input-modern w-full"
              >
                <option value="">Seleccione un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Posición
              </label>
              <select
                name="posicion"
                value={formData.posicion}
                onChange={handleInputChange}
                required
                className="input-modern w-full"
              >
                <option value="">Seleccione una posición</option>
                {posiciones.map((posicion) => (
                  <option key={posicion} value={posicion}>
                    {posicion}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Botones Guardar / Cancelar */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreator(false)}
              className="btn-outline px-4 py-2 text-sm !text-gray-400 !border-gray-600 hover:!text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 text-sm"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioJugador;
