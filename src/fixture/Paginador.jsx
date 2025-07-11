export default function Paginador({
  current,
  max,
  onFirst,
  onPrev,
  onSelect,
  onNext,
  onLast
}) {
  // Genera un array [1,2,…,max]
  const fechas = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="mt-6">
      {/* Versión desktop */}
      <div className="hidden md:flex justify-center space-x-2 items-center">
        <button
          onClick={onFirst}
          disabled={current === 1}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          &laquo;
        </button>
        <button
          onClick={onPrev}
          disabled={current === 1}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          &lsaquo;
        </button>

        {fechas.map((f) => (
          <button
            key={f}
            onClick={() => onSelect(f)}
            className={`px-2 py-1 rounded ${
              f === current
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {f}
          </button>
        ))}

        <button
          onClick={onNext}
          disabled={current === max}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          &rsaquo;
        </button>
        <button
          onClick={onLast}
          disabled={current === max}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          &raquo;
        </button>
      </div>

      {/* Versión móvil con scroll horizontal */}
      <div className="md:hidden">
        <div className="flex space-x-2 mb-2 justify-center">
          <button
            onClick={onFirst}
            disabled={current === 1}
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50 text-sm"
          >
            &laquo;
          </button>
          <button
            onClick={onPrev}
            disabled={current === 1}
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50 text-sm"
          >
            &lsaquo;
          </button>
          <button
            onClick={onNext}
            disabled={current === max}
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50 text-sm"
          >
            &rsaquo;
          </button>
          <button
            onClick={onLast}
            disabled={current === max}
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50 text-sm"
          >
            &raquo;
          </button>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-2 px-4 min-w-max">
            {fechas.map((f) => (
              <button
                key={f}
                onClick={() => onSelect(f)}
                className={`px-3 py-2 rounded flex-shrink-0 ${
                  f === current
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
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
