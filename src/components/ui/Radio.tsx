import type { ChangeEvent } from 'react';

interface RadioProps {
    label: string;
    name: string;
    value: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export const Radio = ({ label, name, value, checked, onChange, disabled = false }: RadioProps) => {
    const id = `radio-${name}-${value}-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`neuro-input-wrapper ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
                id={id}
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="neuro-input-state"
            />
            <label htmlFor={id} className="neuro-input-label">
                <div className="neuro-input-indicator"></div>
                <span className="neuro-input-text text-neuro-primary">{label}</span>
            </label>
        </div>
    );
};
