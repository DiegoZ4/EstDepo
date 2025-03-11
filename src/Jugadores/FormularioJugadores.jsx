import React, { useState, useEffect, useRef } from "react";
import { colores } from "../colores"; // Ajusta la ruta según tu estructura

const FormularioJugador = ({ setCreator, selectedJugador, onSave }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    edad: "",
    posicion: "Portero",
    goles: 0,
    asistencias: 0,
    fechaNacimiento: "",
    altura: "",
    peso: "",
    tarjetasAmarillas: 0,
    tarjetasRojas: 0,
    description: "",
    equipoId: 0,
    categoriesId: 0,
    paisId: 0,
  });
  const [equipos, setEquipos] = useState([]);
  const [paises, setPaises] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [uploading, setUploading] = useState(false);
  const dropzoneRef = useRef(null);

  const posiciones = ["Portero", "Defensor", "Centrocampista", "Delantero"];

  // Cargar datos (equipos, países, categorías)
  useEffect(() => {
    const fetchDatos = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const [equiposRes, paisesRes, categoriasRes] = await Promise.all([
          fetch(`${apiUrl}/equipo`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }),
          fetch(`${apiUrl}/pais`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }),
          fetch(`${apiUrl}/categories`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }),
        ]);
        setEquipos(await equiposRes.json());
        setPaises(await paisesRes.json());
        setCategorias(await categoriasRes.json());
      } catch (error) {
        console.error("Error fetching datos:", error);
      }
    };
    fetchDatos();
  }, [apiUrl]);

  // Si se edita un jugador, se cargan sus datos
  useEffect(() => {
    if (selectedJugador) {
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
        equipoId: selectedJugador.equipo?.id || 0,
        // Usamos selectedJugador.category?.id en lugar de selectedJugador.categoriesId
        categoriesId: selectedJugador.category?.id || 0,
        paisId: selectedJugador.pais?.id || 0,
      });
    }
  }, [selectedJugador]);

  // Manejo de inputs (con conversión a número donde corresponda)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["equipoId", "paisId", "categoriesId", "edad", "goles", "asistencias", "tarjetasAmarillas", "tarjetasRojas", "altura", "peso"].includes(name)
          ? Number(value)
          : value,
    }));
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
      dropzoneRef.current.classList.add("bg-[#0a4f4f]");
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove("bg-[#0a4f4f]");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove("bg-[#0a4f4f]");
    }
    const file = e.dataTransfer.files[0];
    uploadFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50"
      onClick={() => setCreator(false)}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="p-6 rounded-lg shadow-2xl w-full max-w-lg mx-4 border-2"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colores.fondoPrincipal,
          borderColor: colores.border,
        }}
      >
        <h2
          className="text-2xl font-bold mb-4 text-center uppercase tracking-wide"
          style={{ color: colores.acento }}
        >
          {selectedJugador ? "Actualizar Jugador" : "Crear Jugador"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4" style={{ color: colores.texto }}>
          {/* Fila 1: Nombre / Nacimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Nombre:
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Nacimiento:
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              />
            </div>
          </div>
          {/* Fila 2: Altura / Peso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Altura (cm):
              </label>
              <input
                type="number"
                name="altura"
                value={formData.altura}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Peso (kg):
              </label>
              <input
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              />
            </div>
          </div>
          {/* Fila 3: Subir Imagen */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
              Subir Imagen:
            </label>
            <div
              ref={dropzoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="w-full rounded flex flex-col items-center justify-center text-center cursor-pointer transition-colors p-4"
              style={{
                backgroundColor: colores.cardBg,
                border: `1px solid ${colores.acento}`,
              }}
            >
              <p className="m-2" style={{ color: colores.acento, fontWeight: "bold" }}>
                Arrastre aquí
              </p>
              <p className="text-gray-200">o</p>
              <label
                className="px-2 py-1 m-2 rounded cursor-pointer transition"
                style={{
                  backgroundColor: colores.buttonBg,
                  color: "black",
                }}
              >
                Seleccione un archivo
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {uploading && (
              <p className="text-yellow-400 text-center">Subiendo imagen...</p>
            )}
            {formData.image && (
              <p className="text-sm text-center mt-1 truncate" style={{ color: colores.texto }}>
                {`Imagen subida: ${formData.image}`}
              </p>
            )}
          </div>
          {/* Fila 4: Edad / Tarjetas Rojas / Tarjetas Amarillas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Edad:
              </label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Tarjetas Rojas:
              </label>
              <input
                type="number"
                name="tarjetasRojas"
                value={formData.tarjetasRojas}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Tarjetas Amarillas:
              </label>
              <input
                type="number"
                name="tarjetasAmarillas"
                value={formData.tarjetasAmarillas}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              />
            </div>
          </div>
          {/* Fila 5: País / Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                País:
              </label>
              <select
                name="paisId"
                value={formData.paisId}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              >
                <option value="">Seleccione un país</option>
                {paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Categoría:
              </label>
              <select
                name="categoriesId"
                value={formData.categoriesId}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
              >
                <option value="">Sin categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Fila 6: Equipo / Posición */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Equipo:
              </label>
              <select
                name="equipoId"
                value={formData.equipoId}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
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
              <label className="block font-semibold mb-1" style={{ color: colores.acento }}>
                Posición:
              </label>
              <select
                name="posicion"
                value={formData.posicion}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colores.inputBg,
                  border: `1px solid ${colores.acento}`,
                  color: colores.texto,
                }}
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
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-bold transition duration-300"
              style={{
                backgroundColor: colores.buttonBg,
                color: "black",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colores.buttonHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = colores.buttonBg)
              }
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setCreator(false)}
              className="px-4 py-2 rounded-md font-bold transition duration-300"
              style={{
                backgroundColor: colores.botonCancelar || "#DC2626",
                color: colores.texto,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  colores.botonCancelarHover || "#B91C1C")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  colores.botonCancelar || "#DC2626")
              }
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioJugador;
