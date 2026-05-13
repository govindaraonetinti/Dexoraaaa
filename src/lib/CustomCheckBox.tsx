import React from "react";

interface CustomCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    id: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
    checked,
    onChange,
    disabled = false,
    id
}) => {
    return (
        <label
            htmlFor={id}
            className={`flex items-center gap-2 cursor-pointer ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="hidden"
            />

            {/* Custom checkbox box */}
            <div
                className={`w-4 h-4 flex items-center justify-center border border-white transition-colors`}
            >
                <div
                    className={`w-2.5 h-2.5 ${
                        checked ? "bg-white" : "bg-transparent"
                    }`}
                />
            </div>
        </label>
    );
};

export default CustomCheckbox;
