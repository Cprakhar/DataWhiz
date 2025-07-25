
import React from "react";


type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  className?: string;
  suffix?: React.ReactNode;
};

export default function Input({ icon, className = "", suffix, ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={`border rounded px-3 py-2 w-full pl-10 ${suffix ? 'pr-10' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 flex items-center">
          {suffix}
        </span>
      )}
    </div>
  );
}