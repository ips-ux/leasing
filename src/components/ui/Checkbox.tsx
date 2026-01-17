interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const Checkbox = ({ label, name, checked, onChange, disabled = false }: CheckboxProps) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group overflow-hidden">
      <div className="relative flex-shrink-0 w-6 h-6">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-6 h-6 border-[3px] border-black backdrop-blur-sm transition-all flex items-center justify-center overflow-hidden ${
            checked ? 'bg-lavender' : 'bg-white/10'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:shadow-[2px_2px_0px_rgba(0,0,0,0.3)]'
          }`}
        >
          {checked && (
            <svg
              className="w-4 h-4 text-black flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>
      </div>
      <span className={`font-sans font-medium select-none ${disabled ? 'opacity-50' : 'group-hover:text-black/80'}`}>
        {label}
      </span>
    </label>
  );
};
