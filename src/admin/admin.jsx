
import { useState, useEffect } from "react";


const admin = () => {



  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-gradient-accent uppercase">Panel de Administración</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-sm text-center"><h2 className="text-lg font-semibold">Tablas</h2></div>
        <div className="glass-card-sm text-center"><h2 className="text-lg font-semibold">Fixture</h2></div>
        <div className="glass-card-sm text-center"><h2 className="text-lg font-semibold">Equipos</h2></div>
      </div>
    </div>
  );
}

export default admin