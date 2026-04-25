import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, error, ...props }, ref) => {
    return (
      <div className="w-full group">
        <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 group-focus-within:text-black transition-colors duration-300">
          {label}
        </label>

        <div className="relative">
          <input
            {...props}
            ref={ref}
            className={`
              w-full 
              bg-transparent
              text-black text-sm
              placeholder:text-gray-300
              border-b border-black/10 
              hover:border-black/30
              focus:outline-none 
              focus:border-black
              transition-all duration-300
              appearance-none rounded-none
              p-2
              ${className}
            `}
          />

          <div className="absolute right-0 bottom-2 w-1 h-1 bg-black scale-0 group-focus-within:scale-100 transition-transform duration-500" />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
