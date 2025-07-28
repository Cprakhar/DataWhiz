import React from "react";

interface Option {
  value: string;
  label: string;
}

interface ReusableSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export default function Select({ label, value, options, onChange, error, placeholder }: ReusableSelectProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select
        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
