import React, { useState, useEffect } from "react";
import FormularioJugadores from "../Jugadores/FormularioJugadores";

const FormularioGol = ({ onSubmit, onClose, torneoId, equipoId, partidoId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    partidoId: partidoId,
    equipoId: equipoId,
    jugadorId: "",
    minuto: "",
    torneoId: torneoId,
  });
  const [jugadores, setJugadores] = useState([]);
  const [creator, setCreator] = useState(false);

  useEffect(() => {
    const fetchJugadores = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${apiUrl}/jugador?equipo=${equipoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await response.json();
        setJugadores(data);
      } catch (error) {
        console.error("Error fetching jugadores:", error);
      }
    };
    fetchJugadores();
  }, [apiUrl, equipoId]);

  const handleInputChange = (e) => {
    if (e.target.name === "jugadorId" && e.target.value === "crear") {
      setCreator(true);
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${apiUrl}/goles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        console.error("Error creating gol:", await response.text());
        return;
      }
      onSubmit();
    } catch (error) {
      console.error("Error creating gol:", error);
    }
  };

  // Callback para cuando se crea un jugador
  const handleJugadorCreado = (nuevoJugador) => {
    // Agrega el nuevo jugador a la lista de jugadores
    setJugadores((prev) => [...prev, nuevoJugador]);
    // Selecciona el nuevo jugador en el formulario
    setFormData({ ...formData, jugadorId: nuevoJugador.id });
    // Cierra el formulario de jugador
    setCreator(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-[#141414] border border-[#003c3c] p-6 rounded-lg shadow-2xl w-full max-w-md mx-4 space-y-4 text-white"
      >
        <h2 className="text-2xl font-bold text-center text-[#a0f000] uppercase tracking-wide mb-4">
          Registrar Gol
        </h2>

        {/* Selección de Jugador */}
        <div>
          <label className="block text-sm font-semibold text-[#a0f000] mb-1">
            Jugador:
          </label>
          <select
            name="jugadorId"
            value={formData.jugadorId}
            onChange={handleInputChange}
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000] focus:bg-[#1e4d4d] transition"
            required
          >
            <option value="">Seleccione un jugador</option>
            {jugadores.map((jugador) => (
              <option key={jugador.id} value={jugador.id}>
                {jugador.name}
              </option>
            ))}
            <option value="crear">Crear un jugador</option>
          </select>
        </div>

        {/* Minuto */}
        <div>
          <label className="block text-sm font-semibold text-[#a0f000] mb-1">
            Minuto:
          </label>
          <input
            type="number"
            name="minuto"
            value={formData.minuto}
            onChange={handleInputChange}
            placeholder="Ej: 45"
            required
            className="w-full p-2 border border-[#003c3c] rounded-md bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000] focus:bg-[#1e4d4d] transition"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg transition transform hover:scale-105"
          >
            Crear Gol
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition transform hover:scale-105"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal para crear jugador */}
      {creator && (
        <FormularioJugadores
          setCreator={setCreator}
          selectedJugador={null}
          onSave={handleJugadorCreado}
        />
      )}
    </div>
  );
};

export default FormularioGol;
