
import { Injectable } from "react";
import React, { useState, useEffect } from "react";



const Tablas = ( {torneoId, categoriaId}) => {
  
  const apiUrl = import.meta.env.VITE_API_URL
  const [Items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/torneo/${torneoId}/tabla/${categoriaId}`)
        console.log(response)
        const data = await response.json()
        setItems(data)
      } catch (error) {
        console.error(`Oh no, ocurrió un error: ${error}`);
      }
    }
    fetchData()
  }, [])

  console.log(Items)

  return (
    <div className="max-w-6xl mx-auto p-4">
    <h1 className="text-2xl font-bold text-center mb-4">Tabla de Posiciones | Torneo de Reserva 2024</h1>
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm text-left text-white">
        <thead className="bg-purple-700 text-xs uppercase text-gray-100">
          <tr>
            <th scope="col" className="px-4 py-2">#</th>
            <th scope="col" className="px-4 py-2">Club</th>
            <th scope="col" className="px-4 py-2">Pts</th>
            <th scope="col" className="px-4 py-2">PJ</th>
            <th scope="col" className="px-4 py-2">PG</th>
            <th scope="col" className="px-4 py-2">PE</th>
            <th scope="col" className="px-4 py-2">PP</th>
            <th scope="col" className="px-4 py-2">GF</th>
            <th scope="col" className="px-4 py-2">GC</th>
            <th scope="col" className="px-4 py-2">DIF</th>
          </tr>
        </thead>
        <tbody>
          {Items.map((equipo, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-purple-900' : 'bg-purple-800'}>
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{equipo.equipo.name}</td>
              <td className="px-4 py-2">{equipo.Pts}</td>
              <td className="px-4 py-2">{equipo.PJ}</td>
              <td className="px-4 py-2">{equipo.PG}</td>
              <td className="px-4 py-2">{equipo.PE}</td>
              <td className="px-4 py-2">{equipo.PP}</td>
              <td className="px-4 py-2">{equipo.GF}</td>
              <td className="px-4 py-2">{equipo.GC}</td>
              <td className="px-4 py-2">{equipo.DIF}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  )
}

export default Tablas