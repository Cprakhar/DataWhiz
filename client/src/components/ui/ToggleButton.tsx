
import React from "react";

interface ToggleButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const ToggleButton =({ checked, onChange, label, disabled = false, className = "" }: ToggleButtonProps) => {
  return (
    <label className={`flex items-center cursor-pointer select-none ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`block w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-green-400" : "bg-gray-300"} ${disabled ? "opacity-50" : ""}`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${checked ? "translate-x-4" : ""}`}
        ></div>
      </div>
      {label && <span className="ml-3 text-sm text-slate-700">{label}</span>}
    </label>
  );
};

export default ToggleButton;
