import React, { useState, useEffect } from "react";

const FormularioUsuario = ({ setMostrarFormulario, usuarioSeleccionado, onSave }) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    rol: "freeUser",
    bornDate: "",
  });

  const close = () => {
    setMostrarFormulario(false);
  };

  useEffect(() => {
    if (usuarioSeleccionado) {
      setFormData({
        email: usuarioSeleccionado.email || "",
        name: usuarioSeleccionado.name || "",
        password: "", // No se muestra la password por seguridad
        rol: usuarioSeleccionado.rol || "freeUser",
        // Convertimos la fecha a formato YYYY-MM-DD para el input type="date"
        bornDate: usuarioSeleccionado.bornDate
          ? usuarioSeleccionado.bornDate.split("T")[0]
          : "",
      });
    }
  }, [usuarioSeleccionado]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        <h2 className="text-2xl font-bold text-center text-[#a0f000]">
          {usuarioSeleccionado ? "Actualizar Usuario" : "Crear Usuario"}
        </h2>
        
        <label className="block text-sm">Email:</label>
        <input 
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
          required
        />

        <label className="block text-sm">Nombre:</label>
        <input 
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white"
          required
        />

        <label className="block text-sm">Contraseña:</label>
        <input 
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white"
          required={!usuarioSeleccionado} // Requerida al crear, opcional al actualizar
        />

        <label className="block text-sm">Rol:</label>
        <select
          name="rol"
          value={formData.rol}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white"
          required
        >
          <option value="freeUser">freeUser</option>
          <option value="SubsUser">SubsUser</option>
          <option value="admin">admin</option>
        </select>

        <label className="block text-sm">Nacimiento:</label>
        <input 
          type="date"
          name="bornDate"
          value={formData.bornDate}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-[#143c3c] border border-[#a0f000] text-white"
        />

        <div className="flex justify-around mt-4">
          <button 
            type="submit"
            className="bg-[#a0f000] text-black px-4 py-2 rounded hover:bg-[#8cd000] transition"
          >
            {usuarioSeleccionado ? "Actualizar" : "Crear"}
          </button>
          <button 
            type="button"
            onClick={close}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioUsuario;
