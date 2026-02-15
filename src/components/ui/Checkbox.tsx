import styles from './Checkbox.module.css';

interface CheckboxProps {
  label?: string; // Made label optional to support standalone checkboxes if needed
  name?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const Checkbox = ({ label, name, checked, onChange, disabled = false, className = '' }: CheckboxProps & { className?: string }) => {
  // Generate a unique ID for the label association
  // Use name if available, otherwise random
  const id = `checkbox-${name || Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.checkboxWrapper} ${className}`}>
      <input
        id={id}
        type="checkbox"
        className={styles.check}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor={id} className={styles.label}>
        <svg width="45" height="45" viewBox="0 0 95 95">
          <rect x="30" y="20" width="50" height="50" stroke="black" fill="none"></rect>
          <g transform="translate(0,-952.36222)">
            <path d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4" stroke="black" strokeWidth="3" fill="none" className={styles.path1}></path>
          </g>
        </svg>
        {label && <span className="text-neuro-primary">{label}</span>}
      </label>
    </div>
  );
};
