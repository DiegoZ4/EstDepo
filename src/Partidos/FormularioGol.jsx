import React, { useState, useEffect } from "react";
import FormularioJugadores from "../Jugadores/FormularioJugadores";
const FormularioGol = ({ onSubmit, onClose, torneoId, equipoId, partidoId, gol }) => {

  const apiUrl = import.meta.env.VITE_API_URL;
  const [jugadores, setJugadores] = useState([]);
  
  const [creator, setCreator] = useState(false);


  const [formData, setFormData] = useState({
    partidoId,
    equipoId,
    jugadorId: "",
    minuto: "",
    torneoId,
  });
  useEffect(() => {
    const foundJugador = jugadores.find(j => j.id === gol?.jugador?.id);
    if (gol && jugadores.length > 0 && foundJugador) {
      setFormData({
        partidoId,
        equipoId: equipoId || gol.equipo?.id || "",
        jugadorId: foundJugador.id.toString(), // ahora existe en la lista
        minuto: gol.minuto?.toString() || "",
        torneoId,
      });
    }
  }, [gol, jugadores]);
  
  const fetchJugadores = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${apiUrl}/jugador?equipo=${equipoId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      setJugadores(data);
    } catch (err) {
      console.error("Error al obtener jugadores:", err);
    }
  };

  useEffect(() => {
    fetchJugadores();
  }, [equipoId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "jugadorId" && value === "crear") {
      setCreator(true);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
  
    const jugadorId = Number(formData.jugadorId);
    const minuto = Number(formData.minuto);
  
    if (!jugadorId || isNaN(jugadorId)) {
      alert("Seleccioná un jugador válido.");
      return;
    }
  
    const payload = {
      ...formData,
      equipoId: equipoId || gol?.equipo?.id, // Aseguramos que no sea undefined
      jugadorId,
      minuto,
    };
    
    try {
      const res = await fetch(
        `${apiUrl}/goles${gol ? `/${gol.id}` : ""}`,
        {
          method: gol ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!res.ok) {
        const error = await res.text();
        console.error("Error al guardar gol:", error);
        return;
      }
  
      onSubmit();
    } catch (err) {
      console.error("Error en el guardado del gol:", err);
    }
  };
  

  const handleJugadorCreado = async (jugador) => {
    if (!jugador) {
      console.error("Jugador inválido:", jugador);
      return;
    }
  
    const token = localStorage.getItem("access_token");
  
    try {
      const response = await fetch(`${apiUrl}/jugador`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(jugador),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al guardar jugador:", errorText);
        return;
      }
  
      const jugadorGuardado = await response.json();
  
      setJugadores((prev) => [...prev, jugadorGuardado]);
      setFormData((prev) => ({
        ...prev,
        jugadorId: jugadorGuardado.id.toString(),
      }));
      setCreator(false);
    } catch (error) {
      console.error("Error en el guardado del jugador:", error);
    }
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

        {/* Jugador */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-[#a0f000]">Jugador:</label>
          <select
  name="jugadorId"
  value={formData.jugadorId}
  onChange={(e) => {
    if (e.target.value === "crear") {
      setCreator(true);
    } else {
      setFormData((prev) => ({ ...prev, jugadorId: e.target.value }));
      
    }
  }}
  className="w-full p-2 bg-[#1f1f1f] border border-[#003c3c] rounded-md"
  required
>

            <option value="">Seleccione un jugador</option>
            {jugadores.map((j) => (
              <option key={j.id} value={j.id.toString()}>{j.name}</option>
            ))}
            <option key="crear" value="crear">Crear un jugador</option>
          </select>
        </div>

        {/* Minuto */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-[#a0f000]">Minuto:</label>
          <input
            type="number"
            name="minuto"
            value={formData.minuto}
            onChange={handleInputChange}
            className="w-full p-2 bg-[#1f1f1f] border border-[#003c3c] rounded-md"
            placeholder="Ej: 45"
            required
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
        <button
  type="submit"
  className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg"
>
  {gol ? "Actualizar Gol" : "Crear Gol"}
</button>

          <button
            type="button"
            onClick={() => onClose(false)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </form>

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
