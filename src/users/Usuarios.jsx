import React, { useState, useEffect } from "react";
import ListaUsuarios from "./ListaUsuarios";
import FormularioUsuario from "./FormularioUsuario";
import { apiRequest } from "../services/apiService";

const apiUrl = import.meta.env.VITE_API_URL;

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterRol, setFilterRol] = useState("all");

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

  const cancelUserSubscription = async (userId) => {
    if (!confirm("¿Estás seguro de cancelar la suscripción de este usuario?")) return;
    try {
      const res = await apiRequest(`/subscriptions/admin/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsuarios();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Error al cancelar la suscripción");
      }
    } catch (error) {
      console.error("Error al cancelar suscripción:", error);
      alert("Error al cancelar la suscripción");
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios
    .filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.rol?.toLowerCase().includes(q);
      
      if (filterRol === "all") return matchesSearch;
      if (filterRol === "subscribers") return matchesSearch && (u.subscriptionStatus === "active" || u.subscriptionStatus === "authorized" || u.is_premium === true);
      if (filterRol === "free") return matchesSearch && u.subscriptionStatus !== "active" && u.subscriptionStatus !== "authorized" && !u.is_premium;
      return matchesSearch && u.rol === filterRol;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "email") return (a.email || "").localeCompare(b.email || "");
      if (sortBy === "rol") return (a.rol || "").localeCompare(b.rol || "");
      return 0;
    });

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-2 text-gradient-accent uppercase">
        Gestión de Usuarios
      </h1>
      <p className="text-center text-gray-400 mb-6">Usuarios registrados: {usuarios.length}</p>

      {/* Buscador y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-modern flex-1"
        />
        <select
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
          className="input-modern sm:w-44"
        >
          <option value="all">Todos</option>
          <option value="subscribers">Suscriptores</option>
          <option value="free">Sin suscripción</option>
          <option value="admin">Admins</option>
          <option value="freeUser">Rol: freeUser</option>
          <option value="SubsUser">Rol: SubsUser</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-modern sm:w-48"
        >
          <option value="name">Ordenar por nombre</option>
          <option value="email">Ordenar por email</option>
          <option value="rol">Ordenar por rol</option>
        </select>
      </div>

      <ListaUsuarios 
        usuarios={filteredUsuarios} 
        onEdit={handleEdit} 
        onDelete={deleteUsuario}
        onCancelSubscription={cancelUserSubscription}
      />
      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setUsuarioSeleccionado(null);
          }}
          className="btn-primary px-6 py-3"
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
