export default function Paginador({
  current,
  max,
  onFirst,
  onPrev,
  onSelect,
  onNext,
  onLast
}) {
  const fechas = Array.from({ length: max }, (_, i) => i + 1);

  const navBtnClass = "px-3 py-1.5 rounded-lg glass-card-sm !rounded-lg text-gray-400 hover:text-[#a0f000] hover:border-[#a0f000]/30 disabled:opacity-30 disabled:hover:text-gray-400 transition text-sm";

  return (
    <div className="mt-6 space-y-3">
      {/* Versión desktop */}
      <div className="hidden md:flex justify-center items-center gap-1.5">
        <button onClick={onFirst} disabled={current === 1} className={navBtnClass}>
          &laquo;
        </button>
        <button onClick={onPrev} disabled={current === 1} className={navBtnClass}>
          &lsaquo;
        </button>

        {fechas.map((f) => (
          <button
            key={f}
            onClick={() => onSelect(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              f === current
                ? "bg-[#a0f000] text-black shadow-lg shadow-[#a0f000]/20"
                : "glass-card-sm !rounded-lg text-gray-400 hover:text-white hover:border-[#a0f000]/30"
            }`}
          >
            {f}
          </button>
        ))}

        <button onClick={onNext} disabled={current === max} className={navBtnClass}>
          &rsaquo;
        </button>
        <button onClick={onLast} disabled={current === max} className={navBtnClass}>
          &raquo;
        </button>
      </div>

      {/* Versión móvil */}
      <div className="md:hidden">
        <div className="flex gap-2 mb-2 justify-center">
          <button onClick={onFirst} disabled={current === 1} className={navBtnClass}>
            &laquo;
          </button>
          <button onClick={onPrev} disabled={current === 1} className={navBtnClass}>
            &lsaquo;
          </button>
          <span className="px-3 py-1.5 text-sm text-[#a0f000] font-bold">{current}/{max}</span>
          <button onClick={onNext} disabled={current === max} className={navBtnClass}>
            &rsaquo;
          </button>
          <button onClick={onLast} disabled={current === max} className={navBtnClass}>
            &raquo;
          </button>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 px-4 min-w-max">
            {fechas.map((f) => (
              <button
                key={f}
                onClick={() => onSelect(f)}
                className={`px-3 py-1.5 rounded-lg flex-shrink-0 text-sm transition-all ${
                  f === current
                    ? "bg-[#a0f000] text-black font-bold"
                    : "glass-card-sm !rounded-lg text-gray-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
