import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormularioPartido from "../Partidos/FormularioPartidos";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa";
import { FiChevronDown, FiX, FiUser } from "react-icons/fi";


const TorneoInspect = () => {
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [torneo, setTorneo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [partidosPorFecha, setPartidosPorFecha] = useState({});
  const [selectedPartido, setSelectedPartido] = useState(null);
  const [fechasAbiertas, setFechasAbiertas] = useState({});
  const [equipos, setEquipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showLibrePanel, setShowLibrePanel] = useState(null); // fecha number
  const [libreForm, setLibreForm] = useState({ equipoId: "" });
  const [libresMap, setLibresMap] = useState({}); // key: `${fecha}-${categoriaId}` → equipo libre obj
  const [savingLibre, setSavingLibre] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchTorneoYPartidos = async () => {
      const token = localStorage.getItem("access_token");
      try {
        // 1. Torneo
        const torneoRes = await fetch(`${apiUrl}/torneo/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!torneoRes.ok) throw new Error(await torneoRes.text());
        const torneoData = await torneoRes.json();
        setTorneo(torneoData);

        const abiertas = {};
        for (let i = 1; i <= torneoData.fechas; i++) {
          abiertas[i] = true;
        }
        setFechasAbiertas(abiertas);


        // 2. Partidos agrupados por fecha
        const partidosRes = await fetch(`${apiUrl}/partido/torneo/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!partidosRes.ok) throw new Error(await partidosRes.text());
        const partidosData = await partidosRes.json();
        setPartidosPorFecha(partidosData);

        // 3. Equipos y categorías del torneo para el panel de equipo libre
        const [equiposRes, categoriasRes] = await Promise.all([
          fetch(`${apiUrl}/equipo`, { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
          fetch(`${apiUrl}/torneo/${id}/categorias`, { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
        ]);
        if (equiposRes.ok) setEquipos(await equiposRes.json());

        let cats = [];
        if (categoriasRes.ok) {
          cats = await categoriasRes.json();
          setCategorias(cats);
        }

        // 4. Cargar libres existentes para cada fecha × categoría
        if (cats.length > 0) {
          const libresEntries = await Promise.all(
            cats.map(async (cat) => {
              try {
                const r = await fetch(`${apiUrl}/equipo-libre/${id}/${cat.id}`, {
                  headers: { Authorization: token ? `Bearer ${token}` : "" },
                });
                if (!r.ok) return [];
                const arr = await r.json();
                if (!Array.isArray(arr)) return [];
                // Usamos cat.id directamente como clave (no depende del campo del response)
                return arr.map(item => ({ key: `${item.fecha}-${cat.id}`, item }));
              } catch { return []; }
            })
          );
          const map = {};
          libresEntries.flat().forEach(({ key, item }) => {
            map[key] = item;
          });
          setLibresMap(map);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTorneoYPartidos();
  }, [apiUrl, id]);

  const toggleFecha = (fecha) => {
    setFechasAbiertas((prev) => ({
      ...prev,
      [fecha]: !prev[fecha],
    }));
  };


  const handleDelete = async (id, fecha) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${apiUrl}/partido/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      setPartidosPorFecha((prev) => ({
        ...prev,
        [fecha]: prev[fecha].filter((p) => p.id !== id),
      }));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };


  const handleSaveLibre = async (fecha) => {
    const { equipoId } = libreForm;
    if (!equipoId || categorias.length === 0) return;
    const token = localStorage.getItem("access_token");
    setSavingLibre(true);
    try {
      const results = await Promise.all(
        categorias.map(async (cat) => {
          const key = `${fecha}-${cat.id}`;
          const existing = libresMap[key];
          let res;
          if (existing) {
            res = await fetch(`${apiUrl}/equipo-libre/${existing.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ equipoId: Number(equipoId) }),
            });
          } else {
            res = await fetch(`${apiUrl}/equipo-libre`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ equipoId: Number(equipoId), torneoId: Number(id), categoriaId: cat.id, fecha }),
            });
          }
          if (!res.ok) return null;
          return [key, await res.json()];
        })
      );
      const newEntries = {};
      results.forEach(r => { if (r) newEntries[r[0]] = r[1]; });
      setLibresMap(prev => ({ ...prev, ...newEntries }));
      setShowLibrePanel(null);
      setLibreForm({ equipoId: "" });
    } catch (err) {
      console.error("Error guardando equipo libre:", err);
    } finally {
      setSavingLibre(false);
    }
  };

  const handleDeleteLibre = async (fecha) => {
    const token = localStorage.getItem("access_token");
    try {
      await Promise.all(
        categorias.map(async (cat) => {
          const key = `${fecha}-${cat.id}`;
          const existing = libresMap[key];
          if (!existing) return;
          await fetch(`${apiUrl}/equipo-libre/${existing.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        })
      );
      setLibresMap(prev => {
        const next = { ...prev };
        categorias.forEach(cat => delete next[`${fecha}-${cat.id}`]);
        return next;
      });
    } catch (err) {
      console.error("Error eliminando equipo libre:", err);
    }
  };

  const handleCrearPartido = (fecha) => {
    setSelectedPartido(null);
    setSelectedFecha(fecha);
    setShowForm(true);
  };

  const handleEdit = (partido) => {
    setSelectedFecha(partido.fecha);
    setSelectedPartido(partido);
    setShowForm(true);
  };

  const handleSave = async (partidoData, isEdit) => {
    const token = localStorage.getItem("access_token");

    try {
      const method = isEdit ? "PUT" : "POST";
      const endpoint = isEdit
        ? `${apiUrl}/partido/${selectedPartido.id}`
        : `${apiUrl}/partido`;

      const body = {
        equipoVisitanteId: partidoData.equipoVisitanteId,
        equipoLocalId: partidoData.equipoLocalId,
        torneoId: partidoData.torneoId,
        categoriaId: partidoData.categoriaId,
        fecha: partidoData.fecha,
        date: partidoData.date,
        estado: partidoData.estado,
        group: partidoData.group, // asegurate de que este campo exista en el DTO del backend
        groupLocal: partidoData.groupLocal,
        groupVisitante: partidoData.groupVisitante
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(await response.text());

      const updatedPartido = await response.json();
      const fecha = updatedPartido.fecha;

      setPartidosPorFecha((prev) => ({
        ...prev,
        [fecha]: isEdit
          ? prev[fecha].map((p) =>
            p.id === updatedPartido.id ? updatedPartido : p
          )
          : [...(prev[fecha] || []), updatedPartido],
      }));
    } catch (error) {
      console.error("Error guardando partido:", error);
    } finally {
      setShowForm(false);
      setSelectedPartido(null);
    }
  };


  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#a0f000] border-dashed rounded-full animate-spin" /></div>;
  if (!torneo) return <div className="p-4 text-red-400">Torneo no encontrado.</div>;

  const fechas = Array.from({ length: torneo.fechas }, (_, i) => i + 1);

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4">
      <h2 className="text-3xl font-bold text-gradient-accent">Torneo: {torneo.name}</h2>

      {fechas.map((fecha) => {
        const partidosDeFecha = partidosPorFecha[fecha] || [];
        // Equipo libre de esta fecha (busco la primera categoría que tenga asignado)
        const libreDeEstaFecha = (() => {
          for (const cat of categorias) {
            const entry = libresMap[`${fecha}-${cat.id}`];
            if (entry) {
              return entry.equipo || equipos.find(e => e.id === (entry.equipoId || entry.equipo?.id));
            }
          }
          return null;
        })();

        return (
          <div
            key={fecha}
            className="glass-card !p-0 overflow-hidden"
          >
            <div className="flex justify-between items-center p-4">
              <h3 onClick={() => toggleFecha(fecha)} className="text-lg font-semibold text-white cursor-pointer hover:text-[#a0f000] transition">Fecha {fecha}</h3>
              <div className="flex items-center gap-2">
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition ${libreDeEstaFecha ? "bg-blue-500/30 text-blue-200 border-blue-400/40" : "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"}`}
                  onClick={() => {
                    setShowLibrePanel(showLibrePanel === fecha ? null : fecha);
                    setLibreForm({ equipoId: libreDeEstaFecha?.id ? String(libreDeEstaFecha.id) : "" });
                  }}
                >
                  {libreDeEstaFecha ? (
                    <>
                      {libreDeEstaFecha.image && <img src={libreDeEstaFecha.image} alt={libreDeEstaFecha.name} className="h-4 w-4 object-contain" />}
                      <span>{libreDeEstaFecha.name}</span>
                      <span className="text-blue-400/60 text-xs">libre</span>
                    </>
                  ) : (
                    <>
                      <FiUser className="w-3.5 h-3.5" /> Equipo Libre
                    </>
                  )}
                  <FiChevronDown className="w-3 h-3" />
                </button>
                <button
                  className="btn-primary px-3 py-1.5 text-sm"
                  onClick={() => handleCrearPartido(fecha)}
                >
                  + Crear Partido
                </button>
              </div>
            </div>

            {/* Panel equipo libre */}
            {showLibrePanel === fecha && (
              <div className="mx-4 mb-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3">
                <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide">Equipo Libre — Fecha {fecha} <span className="text-blue-400/60 normal-case font-normal">(se asigna a todas las categorías)</span></p>

                {/* Libre ya asignado */}
                {(() => {
                  const primeraAsignada = categorias.find(cat => libresMap[`${fecha}-${cat.id}`]);
                  if (!primeraAsignada) return null;
                  const libre = libresMap[`${fecha}-${primeraAsignada.id}`];
                  const eq = libre.equipo || equipos.find(e => e.id === (libre.equipoId || libre.equipo?.id));
                  return (
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 text-sm">
                      {eq?.image && <img src={eq.image} alt={eq.name} className="h-6 w-6 object-contain" />}
                      <span className="text-white font-medium">{eq?.name || "—"}</span>
                      <span className="text-gray-500 text-xs">libre en todas las categorías</span>
                      <button onClick={() => handleDeleteLibre(fecha)} className="ml-auto text-red-400 hover:text-red-300 flex items-center gap-1 text-xs">
                        <FiX className="w-3 h-3" /> Quitar
                      </button>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap gap-2 items-end">
                  <select
                    value={libreForm.equipoId}
                    onChange={e => setLibreForm(p => ({ ...p, equipoId: e.target.value }))}
                    className="input-modern text-sm py-1.5 min-w-[200px]"
                  >
                    <option value="">Seleccionar equipo libre</option>
                    {equipos.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  <button
                    disabled={!libreForm.equipoId || savingLibre}
                    onClick={() => handleSaveLibre(fecha)}
                    className="btn-primary px-4 py-1.5 text-sm disabled:opacity-40"
                  >
                    {savingLibre ? "Guardando..." : categorias.some(cat => libresMap[`${fecha}-${cat.id}`]) ? "Actualizar" : "Asignar"}
                  </button>
                </div>
              </div>
            )}
            {fechasAbiertas[fecha] && (
              partidosDeFecha.length > 0 ? (
                <div className="overflow-x-auto">
                  {partidosDeFecha.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table-modern w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-center">ID</th>
                            <th className="px-4 py-3 text-center">Fecha</th>
                            <th className="px-4 py-3 text-center">Categoría</th>
                            <th className="px-4 py-3 text-center">Local</th>
                            <th className="px-4 py-3 text-center">Visitante</th>
                            <th className="px-4 py-3 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partidosDeFecha.map((partido, index) => (
                            <tr
                              key={partido.id}
                              className="border-t border-gray-700/30 hover:bg-white/5 transition"
                            >
                              <td className="px-4 py-2.5 text-center text-gray-400">{partido.id}</td>
                              <td className="px-4 py-2.5 text-center">{partido.fecha}</td>
                              <td className="px-4 py-2.5 text-center text-gray-300">{partido.category?.name}</td>
                              <td className="px-4 py-2.5 text-center">{partido.equipoLocal?.name}</td>
                              <td className="px-4 py-2.5 text-center">{partido.equipoVisitante?.name}</td>
                              <td className="px-4 py-2.5 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => handleEdit(partido)}
                                    className="btn-outline px-2.5 py-1 text-xs"
                                    title="Editar"
                                  >
                                    <FaPencilAlt />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(partido.id, partido.fecha)}
                                    className="btn-danger px-2.5 py-1 text-xs"
                                    title="Eliminar"
                                  >
                                    <FaTrashAlt />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/partidos/${partido.id}`)}
                                    className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs hover:bg-blue-500/30 transition"
                                    title="Inspeccionar"
                                  >
                                    <FaEye />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm px-4 pb-4">No hay partidos para esta fecha.</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm px-4 pb-4">No hay partidos para esta fecha.</p>
              )
            )}



          </div>
        );
      })}

      {showForm && (
        <FormularioPartido
          setCreator={setShowForm}
          selectedPartido={selectedPartido} // <-- antes estaba null
          onSave={handleSave}
          initialFecha={selectedFecha}
          torneoInfo={{ id: torneo.id, name: torneo.name }}
        />

      )}
    </div>
  );
};

export default TorneoInspect;
