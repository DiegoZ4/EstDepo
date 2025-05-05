import React, { useState, useEffect } from "react";
import ListaUsuarios from "./ListaUsuarios";
import FormularioUsuario from "./FormularioUsuario";

const apiUrl = import.meta.env.VITE_API_URL;

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const fetchUsuarios = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        console.error("Error al obtener los usuarios:", await response.text());
        return;
      }
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const handleEdit = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarFormulario(true);
  };

  const saveUsuario = async (usuario) => {
    const token = localStorage.getItem("access_token");
    try {
      const method = usuarioSeleccionado ? "PUT" : "POST";
      const endpoint = usuarioSeleccionado 
        ? `${apiUrl}/users/${usuarioSeleccionado.id}` 
        : `${apiUrl}/users`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(usuario),
      });

      if (response.ok) {
        fetchUsuarios();
        setMostrarFormulario(false);
        setUsuarioSeleccionado(null);
      } else {
        console.error("Error al guardar el usuario:", await response.text());
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    }
  };

  const deleteUsuario = async (id) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        console.error("Error al eliminar el usuario:", await response.text());
      }
      fetchUsuarios();
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#141414] text-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase">
        Gestión de Usuarios
      </h1>
      <h2 className="text-3xl font-bold text-center mb-6 text-[#a0f000] uppercase">usuarios registrados  {usuarios.length}</h2>
      <ListaUsuarios 
        usuarios={usuarios} 
        onEdit={handleEdit} 
        onDelete={deleteUsuario} 
      />
      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setUsuarioSeleccionado(null);
          }}
          className="bg-[#003c3c] text-white px-6 py-3 rounded-md hover:bg-[#005555] transition"
        >
          Crear Usuario
        </button>
      </div>
      {mostrarFormulario && (
        <FormularioUsuario 
          setMostrarFormulario={setMostrarFormulario}
          usuarioSeleccionado={usuarioSeleccionado}
          onSave={saveUsuario}
        />
      )}
    </div>
  );
};

export default Usuarios;
