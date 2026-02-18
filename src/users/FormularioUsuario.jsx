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
    <div className="fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm z-50 animate-fade-in">
      <form 
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-md mx-4 space-y-4 text-white"
      >
        <h2 className="text-2xl font-bold text-center text-gradient-accent">
          {usuarioSeleccionado ? "Actualizar Usuario" : "Crear Usuario"}
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email:</label>
          <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-modern"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nombre:</label>
          <input 
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input-modern"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña:</label>
          <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="input-modern"
            required={!usuarioSeleccionado}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Rol:</label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleInputChange}
            className="input-modern"
            required
          >
            <option value="freeUser">freeUser</option>
            <option value="SubsUser">SubsUser</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nacimiento:</label>
          <input 
            type="date"
            name="bornDate"
            value={formData.bornDate}
            onChange={handleInputChange}
            className="input-modern"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button 
            type="submit"
            className="btn-primary px-4 py-2"
          >
            {usuarioSeleccionado ? "Actualizar" : "Crear"}
          </button>
          <button 
            type="button"
            onClick={close}
            className="btn-outline px-4 py-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioUsuario;
