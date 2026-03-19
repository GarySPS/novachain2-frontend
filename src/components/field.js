//src>components>field.js

import React from "react";
import Icon from "./icon"; // Adjust import path if necessary

export default function Field({
  className = "",
  classInput = "",
  label,
  note,
  icon,
  textarea,
  type,
  success,
  error,
  inputRef, // <-- Add this
  ...inputProps
}) {
  // Calculate dynamic classes for input/textarea
  const baseInput =
    "w-full bg-[#050505]/40 backdrop-blur-md border border-white/10 rounded-xl font-sans text-[15px] font-medium text-white placeholder:text-[#666666] transition-all duration-300 outline-none focus:bg-[#0a0a0a]/60 focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)]";
  const iconPadding = icon ? "pl-12" : "";
  const feedback =
    success
      ? "!border-green-500 !bg-theme-green-100 !text-green-600 placeholder:!text-green-600"
      : error
      ? "!border-red-500 !bg-theme-red-100 !text-theme-red placeholder:!text-theme-red"
      : "";

  return (
    <div className={className}>
      {label && <div className="mb-2 text-base-2 font-semibold">{label}</div>}
      <div className={`relative ${textarea ? "" : ""}`}>
        {icon && (
          <Icon
            className="absolute top-1/2 left-3 z-2 -translate-y-1/2 fill-theme-secondary pointer-events-none"
            name={icon}
          />
        )}
        {textarea ? (
          <textarea
            ref={inputRef} // <-- pass ref to textarea
            className={`h-[8.75rem] px-4 py-3 ${baseInput} resize-none ${classInput} ${iconPadding} ${feedback}`}
            {...inputProps}
          />
        ) : (
          <input
            ref={inputRef} // <-- pass ref to input
            className={`h-12 px-4 ${baseInput} ${classInput} ${iconPadding} ${feedback}`}
            type={type || "text"}
            {...inputProps}
          />
        )}
      </div>
      {note && (
        <div className="mt-2 text-caption-2m text-theme-tertiary">
          {note}
        </div>
      )}
    </div>
  );
}
