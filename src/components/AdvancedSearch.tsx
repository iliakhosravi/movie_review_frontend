import { useEffect, useState } from "react";

export type AdvancedFilters = {
  title?: string;
  director?: string;
  genre?: string;
  ratingMin?: string;
  ratingMax?: string;
  yearMin?: string;
  yearMax?: string;
};

interface Props {
  value: AdvancedFilters;
  onChange: (next: AdvancedFilters) => void;
  className?: string;
}

const AdvancedSearch = ({ value, onChange, className = "" }: Props) => {
  const [local, setLocal] = useState<AdvancedFilters>(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const setField = (key: keyof AdvancedFilters, v: string) => {
    const next = { ...local, [key]: v };
    setLocal(next);
    onChange(next);
  };

  const clearAll = () => {
    const cleared: AdvancedFilters = {
      title: "",
      director: "",
      genre: "",
      ratingMin: "",
      ratingMax: "",
      yearMin: "",
      yearMax: "",
    };
    setLocal(cleared);
    onChange(cleared);
  };

  return (
    <div
      className={`w-full bg-white/90 backdrop-blur-xl border border-yellow-200 rounded-2xl p-4 shadow ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Title"
          value={local.title ?? ""}
          onChange={(e) => setField("title", e.target.value)}
          className="w-full border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          placeholder="Director"
          value={local.director ?? ""}
          onChange={(e) => setField("director", e.target.value)}
          className="w-full border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          placeholder="Genre"
          value={local.genre ?? ""}
          onChange={(e) => setField("genre", e.target.value)}
          className="w-full border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={10}
            step="0.1"
            placeholder="Rating min"
            value={local.ratingMin ?? ""}
            onChange={(e) => setField("ratingMin", e.target.value)}
            className="w-1/2 border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="number"
            min={0}
            max={10}
            step="0.1"
            placeholder="Rating max"
            value={local.ratingMax ?? ""}
            onChange={(e) => setField("ratingMax", e.target.value)}
            className="w-1/2 border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Year min"
            value={local.yearMin ?? ""}
            onChange={(e) => setField("yearMin", e.target.value)}
            className="w-1/2 border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="number"
            placeholder="Year max"
            value={local.yearMax ?? ""}
            onChange={(e) => setField("yearMax", e.target.value)}
            className="w-1/2 border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="flex items-stretch md:items-center justify-end">
          <button
            type="button"
            onClick={clearAll}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:bg-yellow-50 font-semibold"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
