import React from "react";

interface ReusableFormFieldProps {
  name: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  type?: "text" | "password" | "number" | "textarea";
  placeholder?: string;
}

export default function FormField({ name, label, value, onChange, error, type = "text", placeholder }: ReusableFormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea
          name={name}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          name={name}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          type={type}
          value={value}
          onChange={e => {
            if (type === "number") {
              onChange(Number(e.target.value));
            } else {
              onChange(e.target.value);
            }
          }}
          placeholder={placeholder}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
