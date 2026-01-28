"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, ShieldCheck, Lock } from "lucide-react";

import { PhoneInputField } from "@/components/ui/phone-input";

type Step = "email" | "reset";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [targetEmail, setTargetEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email && !phone) {
            setError("Please provide either your email address or phone number");
            return;
        }

        setLoading(true);

        try {
            const body: any = {};
            if (email) body.email = email;
            if (phone) body.phone = phone;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/password-reset/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to request password reset");
            }

            setMessage(data.message);
            setTargetEmail(data.email || "your registered email");
            setStep("reset");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/password-reset/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, new_password: newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to reset password");
            }

            setMessage("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md border-primary/10 shadow-xl">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            {step === "email" ? (
                                <Mail className="h-8 w-8" />
                            ) : (
                                <ShieldCheck className="h-8 w-8" />
                            )}
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        {step === "email" ? "Forgot Password" : "Verify OTP"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {step === "email"
                            ? "Enter your email OR phone number to identify your account."
                            : (
                                <>
                                    Enter the code sent to <span className="font-bold text-foreground">{targetEmail}</span> and your new password.
                                </>
                            )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 text-center animate-in fade-in zoom-in duration-300">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="p-3 text-sm text-green-600 bg-green-500/10 rounded-md border border-green-500/20 text-center animate-in fade-in zoom-in duration-300">
                            {message}
                        </div>
                    )}

                    {step === "email" ? (
                        <form onSubmit={handleRequestReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="h-11"
                                />
                            </div>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone number</Label>
                                <PhoneInputField
                                    value={phone}
                                    onChange={setPhone}
                                    placeholder="Enter your registered phone"
                                    disabled={loading}
                                    className="h-11"
                                />
                            </div>
                            <Button className="w-full h-11 font-bold transition-all hover:shadow-md" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Sending Code..." : "Send Reset Code"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleConfirmReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Reset Code (OTP)</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11 text-center text-lg tracking-[0.5em] font-mono"
                                    maxLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="h-11 pl-10"
                                    />
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="h-11 pl-10"
                                    />
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <Button className="w-full h-11 font-bold transition-all hover:shadow-md" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Resetting Password..." : "Reset Password"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                className="w-full text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors"
                            >
                                <ArrowLeft className="h-3 w-3" /> Back to email
                            </button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t bg-muted/20 py-4 rounded-b-lg">
                    <div className="text-center text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link
                            href="/login"
                            className="text-primary font-medium hover:underline underline-offset-4"
                        >
                            Back to Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
