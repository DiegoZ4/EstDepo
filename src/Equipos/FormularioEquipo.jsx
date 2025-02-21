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
      dropzoneRef.current.classList.add("bg-[#0a4f4f]"); // Cambia el color para indicar que se puede soltar
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
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-[#003c3c] p-6 rounded-lg shadow-lg w-96 text-white space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-[#a0f000] uppercase">
          {selectedEquipo ? "Actualizar Equipo" : "Crear Equipo"}
        </h2>

        {/* Nombre */}
        <label className="block text-sm font-semibold">Nombre:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white focus:outline-none"
          required
        />

        {/* Descripción */}
        <label className="block text-sm font-semibold">Descripción:</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white"
          required
        />

        {/* Arrastrar/soltar y Seleccionar archivo */}
        <label className="block text-sm font-semibold">Subir Imagen:</label>
        <div
          ref={dropzoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="w-full   rounded bg-[#143c3c] border border-[#a0f000] flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
        >
          <p className="text-[#a0f000] m-4 font-bold">arrastre aquí</p>
          <p className="text-gray-200 ">o</p>
          <label className="px-2 py-1 m-4 bg-[#a0f000] text-black rounded cursor-pointer hover:bg-[#8cd000] transition">
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
          <p className="text-yellow-400 text-center">Subiendo imagen...</p>
        )}
        {formData.image && (
          <p className="text-sm text-center mt-1 text-gray-300 truncate">
            {`Imagen subida: ${formData.image}`}
          </p>
        )}

        {/* Fecha de Creación */}
        <label className="block text-sm font-semibold">Fecha de Creación:</label>
        <input
          type="number"
          name="createdOn"
          value={formData.createdOn}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white"
        />

        {/* País */}
        <label className="block text-sm font-semibold">País:</label>
        <select
          name="paisId"
          value={formData.paisId}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white"
          required
        >
          <option value="">Seleccione un país</option>
          {paises.map((pais) => (
            <option key={pais.id} value={pais.id}>
              {pais.name}
            </option>
          ))}
        </select>

        {/* Botones */}
        <div className="flex justify-around mt-4">
          <button
            type="submit"
            className="bg-[#a0f000] text-black px-4 py-2 rounded hover:bg-[#8cd000] transition font-bold"
          >
            {selectedEquipo ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            onClick={close}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition font-bold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEquipo;
