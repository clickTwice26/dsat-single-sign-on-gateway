"use client";

import * as React from "react";
import { X, Plus, AlertCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Use standardized Input
import { cn } from "@/lib/utils";

interface IpInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/;
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3,3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3,3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9]))(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;
const WILDCARD = "*";

export function IpInput({ value = [], onChange, placeholder, className }: IpInputProps) {
    const [inputValue, setInputValue] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);

    const validateIp = (ip: string) => {
        if (ip === WILDCARD) return true;
        return IP_REGEX.test(ip) || IPV6_REGEX.test(ip);
    };

    const handleAdd = () => {
        addIp(inputValue);
    };

    const addIp = (input: string) => {
        const trimmed = input.trim();
        if (!trimmed) return;

        // Split by comma/space/newline handling
        const potentials = trimmed.split(/[\s,]+/);

        const newIps: string[] = [];
        let invalidFound = false;

        for (const p of potentials) {
            if (!p) continue;
            if (validateIp(p)) {
                if (!value.includes(p) && !newIps.includes(p)) {
                    newIps.push(p);
                }
            } else {
                invalidFound = true;
            }
        }

        if (newIps.length > 0) {
            onChange([...value, ...newIps]);
            setInputValue("");
            setError(null);
        }

        if (invalidFound) {
            setError("Invalid IP address(es) ignored.");
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addIp(inputValue);
        }
    };

    const removeIp = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className={cn("w-full space-y-3", className)}>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "e.g. 192.168.1.1"}
                    className={cn(error ? "border-destructive focus-visible:ring-destructive" : "")}
                />
                <Button
                    type="button"
                    onClick={handleAdd}
                    variant="secondary"
                    disabled={!inputValue.trim()}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </div>

            {error && (
                <p className="text-xs text-destructive flex items-center animate-in slide-in-from-top-1 px-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {error}
                </p>
            )}

            <div className="min-h-[20px]">
                {value.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-1 italic">
                        No IP addresses added yet.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {value.map((ip, index) => (
                            <Badge key={`${ip}-${index}`} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1 text-sm font-mono bg-background">
                                <Shield className="h-3 w-3 text-muted-foreground opacity-50" />
                                {ip}
                                <button
                                    type="button"
                                    className="ml-1 hover:bg-destructive/10 rounded-full p-0.5 text-muted-foreground hover:text-destructive transition-colors outline-none focus:ring-2 focus:ring-ring"
                                    onClick={() => removeIp(index)}
                                >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove {ip}</span>
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
