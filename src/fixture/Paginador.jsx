import React from "react";

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
    <div className="flex justify-center mt-6 space-x-2 items-center">
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
  );
}
