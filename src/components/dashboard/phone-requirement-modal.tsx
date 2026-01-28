"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneInputField } from "@/components/ui/phone-input";

interface PhoneRequirementModalProps {
    open: boolean;
    onUpdate: () => void;
}

export function PhoneRequirementModal({ open, onUpdate }: PhoneRequirementModalProps) {
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone) {
            toast.error("Please enter your phone number");
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ phone }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to update phone number");
            }

            toast.success("Phone number saved successfully");
            onUpdate();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px] [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Phone Number Required</DialogTitle>
                    <DialogDescription>
                        To ensure account security and access all features, please provide your phone number.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <PhoneInputField
                            value={phone}
                            onChange={(value) => setPhone(value)}
                            placeholder="Enter phone number"
                        />
                        <p className="text-xs text-muted-foreground">
                            We'll use this for account recovery and security verification.
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading || !phone}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save & Continue
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
