import React, { useState, useEffect } from "react";

const FormularioGol = ({ onSubmit, onClose, torneoId,equipoId,partidoId }) => {
  const apiUrl = "http://localhost:3000";
  const [formData, setFormData] = useState({
    partidoId: partidoId,
    equipoId: equipoId,
    jugadorId: "",
    minuto: "",
    torneoId: torneoId,
  });

  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [torneos, setTorneos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partidosResponse = await fetch(`${apiUrl}/partido`);
        const partidosData = await partidosResponse.json();
        setPartidos(partidosData);

        const equiposResponse = await fetch(`${apiUrl}/equipo`);
        const equiposData = await equiposResponse.json();
        setEquipos(equiposData);

        const jugadoresResponse = await fetch(`${apiUrl}/jugador?equipo=${equipoId}`);
        const jugadoresData = await jugadoresResponse.json();
        setJugadores(jugadoresData);

        const torneosResponse = await fetch(`${apiUrl}/torneo`);
        const torneosData = await torneosResponse.json();
        setTorneos(torneosData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  console.log(jugadores);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${apiUrl}/goles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onSubmit();
    } catch (error) {
      console.error("Error creating gol:", error);
    }
  };

  return (
<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
  <form
    onSubmit={handleSubmit}
    className="bg-gray-900 text-white p-6 rounded-xl shadow-xl w-80 sm:w-96 space-y-4 border border-[#a0f000]"
  >
    <h2 className="text-2xl font-bold text-center text-[#a0f000] mb-4 uppercase">
      Registrar Gol
    </h2>

    {/* Jugador */}
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-1">Jugador:</label>
      <select
        name="jugadorId"
        value={formData.jugadorId}
        onChange={handleInputChange}
        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000] transition"
        required
      >
        <option value="">Seleccione un jugador</option>
        {jugadores.map((jugador) => (
          <option key={jugador.id} value={jugador.id}>
            {jugador.name}
          </option>
        ))}
      </select>
    </div>

    {/* Minuto */}
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-1">Minuto:</label>
      <input
        type="number"
        name="minuto"
        value={formData.minuto}
        onChange={handleInputChange}
        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#a0f000] transition"
        placeholder="Ej: 45"
        required
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
</div>

  );
};

export default FormularioGol;
