import React, { useState, useEffect, useRef } from "react";

const FormularioEquipo = ({ setCreator, selectedEquipo, onSave }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    createdOn: "",
    paisId: ""
  });
  const [paises, setPaises] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Agrega la referencia para la dropzone
  const dropzoneRef = useRef(null);


  const close = () => {
    setCreator(false);
  };

  useEffect(() => {
    const fetchPaises = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/pais`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await response.json();
        setPaises(data);
      } catch (error) {
        console.error("Error fetching paises:", error);
      }
    };
    fetchPaises();
  }, [apiUrl]);

  useEffect(() => {
    if (selectedEquipo) {
      setFormData({
        name: selectedEquipo.name || "",
        image: selectedEquipo.image || "",
        description: selectedEquipo.description || "",
        createdOn: selectedEquipo.createdOn || "",
        paisId: selectedEquipo.pais?.id || ""
      });
    }
  }, [selectedEquipo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja la selección y subida de archivos
  const uploadFile = async (file) => {
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${apiUrl}/upload/equipo`, {
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

  // Drag & Drop Handlers
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
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="glass-card p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-center text-gradient-accent uppercase">
          {selectedEquipo ? "Actualizar Equipo" : "Crear Equipo"}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input-modern w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="input-modern w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Subir Imagen</label>
          <div
            ref={dropzoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="w-full rounded-xl border-2 border-dashed border-gray-600/60 bg-white/5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:border-[#a0f000]/40"
          >
            <p className="text-[#a0f000] m-3 font-medium text-sm">Arrastre aquí</p>
            <p className="text-gray-500 text-xs">o</p>
            <label className="btn-primary px-3 py-1.5 m-3 text-sm cursor-pointer">
              Seleccione un archivo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Fecha de Creación</label>
          <input
            type="number"
            name="createdOn"
            value={formData.createdOn}
            onChange={handleInputChange}
            className="input-modern w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">País</label>
          <select
            name="paisId"
            value={formData.paisId}
            onChange={handleInputChange}
            className="input-modern w-full"
            required
          >
            <option value="">Seleccione un país</option>
            {paises.map((pais) => (
              <option key={pais.id} value={pais.id}>
                {pais.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={close}
            className="btn-outline px-4 py-2 text-sm !text-gray-400 !border-gray-600 hover:!text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary px-6 py-2 text-sm"
          >
            {selectedEquipo ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEquipo;
