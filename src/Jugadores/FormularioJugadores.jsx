import React, { useState, useEffect } from "react";

const FormularioJugador = ({ setCreator, selectedJugador, onSave }) => {
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

  const posiciones = ["Portero", "Defensor", "Centrocampista", "Delantero"];

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [equiposRes, paisesRes, categoriasRes] = await Promise.all([
          fetch("http://localhost:3000/equipo"),
          fetch("http://localhost:3000/pais"),
          fetch("http://localhost:3000/categories"),
        ]);
        setEquipos(await equiposRes.json());
        setPaises(await paisesRes.json());
        setCategorias(await categoriasRes.json());
      } catch (error) {
        console.error("Error fetching datos:", error);
      }
    };
    fetchDatos();
  }, []);

  useEffect(() => {
    if (selectedJugador) {
      setFormData({
        name: selectedJugador.name || "",
        image: selectedJugador.image || "",
        edad: selectedJugador.edad || "",
        posicion: selectedJugador.posicion || "Portero",
        goles: selectedJugador.goles || 0,
        asistencias: selectedJugador.asistencias || 0,
        fechaNacimiento: selectedJugador.fechaNacimiento,
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

  // Convertir a número los campos que deben ser numéricos
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Pasa los datos al componente padre
  };

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center  z-50">
  <div className="bg-[#141414] p-6 rounded-lg shadow-2xl w-full max-w-lg mx-4 border-2 border-[#003c3c]">
    <h2 className="text-2xl font-bold mb-4 text-center text-[#a0f000] uppercase tracking-wide">
      Formulario de Jugador
    </h2>
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
    <div className="flex justify-evenly">
      <div>
      <div>
        <label className="block font-semibold mb-1 text-[#a0f000]">Nombre:</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-[#a0f000]">Nacimiento:</label>
        <input
          type="date"
          name="fechaNacimiento"
          value={formData.fechaNacimiento}
          onChange={handleInputChange}
          required
          className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-[#a0f000]">Imagen (URL):</label>
        <input
          name="image"
          value={formData.image}
          onChange={handleInputChange}
          className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
        />
      </div>



      <div>
        <label className="block font-semibold mb-1 text-[#a0f000]">Edad:</label>
        <input
          type="number"
          name="edad"
          value={formData.edad}
          onChange={handleInputChange}
          required
          className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-[#a0f000]">Posición:</label>
        <select
          name="posicion"
          value={formData.posicion}
          onChange={handleInputChange}
          required
          className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
        >
          <option value="">Selecciona una posición</option>
          {posiciones.map((posicion) => (
            <option key={posicion} value={posicion}>
              {posicion}
            </option>
          ))}
        </select>
      </div>
      </div>
      <div>


<label className="block font-semibold mb-1 text-[#a0f000]">Altura (cm):</label>
<input
  type="number"
  name="altura"
  value={formData.altura}
  onChange={handleInputChange}
  className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
/>

<label className="block font-semibold mb-1 text-[#a0f000]">Peso (kg):</label>
<input
  type="number"
  name="peso"
  value={formData.peso}
  onChange={handleInputChange}
  className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
/>

      <label className="block font-semibold mb-1 text-[#a0f000]">Tarjetas Amarillas:</label>
<input
  type="number"
  name="tarjetasAmarillas"
  value={formData.tarjetasAmarillas}
  onChange={handleInputChange}
  className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
/>

<label className="block font-semibold mb-1 text-[#a0f000]">Tarjetas Rojas:</label>
<input
  type="number"
  name="tarjetasRojas"
  value={formData.tarjetasRojas}
  onChange={handleInputChange}
  className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
/>


      <label className="block font-semibold mb-1 text-[#a0f000]">Categoría:</label>
<select
  name="categoriesId"
  value={formData.categoriesId}
  onChange={handleInputChange}
  className="w-full p-2 bg-[#003c3c] border border-[#a0f000] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000]"
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


      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-[#a0f000] text-black px-4 py-2 rounded-md hover:bg-[#8bd600] transition duration-300 font-bold"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setCreator(false)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 font-bold"
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
