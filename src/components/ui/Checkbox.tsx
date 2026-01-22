interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const Checkbox = ({ label, name, checked, onChange, disabled = false, className = '' }: CheckboxProps & { className?: string }) => {
  // Generate a unique ID for the label association
  const id = `checkbox-${name}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`neuro-input-wrapper ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="neuro-input-state"
      />
      <label htmlFor={id} className="neuro-input-label">
        <div className="neuro-input-indicator checkbox"></div>
        <span className="neuro-input-text text-neuro-primary">{label}</span>
      </label>
    </div>
  );
};
