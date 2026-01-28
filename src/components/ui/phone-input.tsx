import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";
import PhoneInput from "react-phone-number-input/input";
import { E164Number } from "libphonenumber-js/core";

// We need to import the flag icons css if we want flags, but sticking to simple input for now as per Shadcn style
// Or we can use the 'react-phone-number-input' default export but it's harder to style.
// Let's use the 'react-phone-number-input/input' which is just the input, but we might want country select.
// For a "very professional" look requested by user, we should probably stick to a clean input that auto-formats or a full component.
// Let's use the simple input which auto-formats, as building a custom country selector is complex.
// Wait, user said "support all country's phone number".
// Let's use 'react-phone-number-input' full component but custom style it.

import "react-phone-number-input/style.css";
import BasePhoneInput from "react-phone-number-input";

interface PhoneInputProps {
    value: string;
    onChange: (value: E164Number) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const PhoneInputField = ({ value, onChange, className, placeholder, disabled }: PhoneInputProps) => {
    return (
        <div className={cn("grid gap-2", className)}>
            <BasePhoneInput
                international
                defaultCountry="BD"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    "phone-input-container" // Hook for custom CSS if needed
                )}
                style={{
                    "--PhoneInputCountryFlag-height": "20px",
                    "--PhoneInputCountryFlag-borderColor": "transparent",
                    "--PhoneInputCountrySelectArrow-color": "currentColor",
                    "--PhoneInputCountrySelectArrow-opacity": "0.5",
                } as React.CSSProperties}
                numberInputProps={{
                    className: "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0 outline-none",
                    disabled: disabled
                }}
            />
            <style jsx global>{`
        .PhoneInput {
            display: flex;
            align-items: center;
        }
        .PhoneInputInput {
            background: transparent;
            border: none;
            outline: none;
            font-size: 0.875rem;
            color: inherit;
            flex: 1;
            padding-left: 8px;
        }
        .PhoneInputCountry {
            margin-right: 8px;
        }
      `}</style>
        </div>
    );
};
