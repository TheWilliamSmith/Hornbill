import * as React from "react";

interface InputProps {
  type: string;
  label: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ type, label }, ref) => {
  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
    </div>
  );
});

Input.displayName = "Input";

export default Input;
