import React, { FC, ChangeEvent } from 'react';

interface DropdownProps {
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    defaultValue?: string;
    className?: string;
}

const Dropdown: FC<DropdownProps> = ({ options, onChange, defaultValue, className }) => {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value);
    };

    return (
        <select
            className={className + " rounded bg-zinc-900 text-sm p-1"}
            onChange={handleChange}
            value={defaultValue}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};
        
export default Dropdown;
