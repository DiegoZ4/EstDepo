import { NavLink } from "react-router-dom";
import { FiLock, FiArrowRight } from "react-icons/fi";

const PaywallOverlay = ({ title = "Contenido exclusivo PREMIUM", message }) => {
  return (
    <div className="relative animate-fade-in">
      {/* Blurred fake content behind */}
      <div className="blur-sm opacity-30 pointer-events-none select-none">
        <div className="glass-card overflow-hidden">
          <table className="table-modern w-full">
            <thead>
              <tr>
                <th className="w-10 text-center">#</th>
                <th>Club</th>
                <th className="text-center">Pts</th>
                <th className="text-center">PJ</th>
                <th className="text-center">PG</th>
                <th className="text-center">GF</th>
                <th className="text-center">GC</th>
                <th className="text-center">DIF</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="text-center">{i}</td>
                  <td><div className="h-4 w-32 bg-gray-700/50 rounded" /></td>
                  <td className="text-center"><div className="h-4 w-6 bg-gray-700/50 rounded mx-auto" /></td>
                  <td className="text-center"><div className="h-4 w-6 bg-gray-700/50 rounded mx-auto" /></td>
                  <td className="text-center"><div className="h-4 w-6 bg-gray-700/50 rounded mx-auto" /></td>
                  <td className="text-center"><div className="h-4 w-6 bg-gray-700/50 rounded mx-auto" /></td>
                  <td className="text-center"><div className="h-4 w-6 bg-gray-700/50 rounded mx-auto" /></td>
                  <td className="text-center"><div className="h-4 w-6 bg-gray-700/50 rounded mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass-card p-8 max-w-sm text-center border-[#a0f000]/20">
          <div className="inline-flex p-4 rounded-2xl bg-[#a0f000]/10 text-[#a0f000] mb-4">
            <FiLock className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {message || "Suscribite al plan PREMIUM para acceder a tablas de posiciones, goleadores y mucho más."}
          </p>
          <NavLink
            to="/suscipcion"
            className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2"
          >
            Suscribirme <FiArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default PaywallOverlay;
