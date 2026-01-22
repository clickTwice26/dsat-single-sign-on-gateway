"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Capture client_id from URL and store in sessionStorage for post-login redirect
    useEffect(() => {
        const clientId = searchParams.get("client_id");
        if (clientId) {
            sessionStorage.setItem("oauth_redirect_client_id", clientId);
        }
    }, [searchParams]);

    const queryError = useMemo(() => {
        const value = searchParams.get("error");
        if (!value) return null;
        if (value === "oauth_error") return "Google Login failed. Please try again.";
        if (value === "no_user_info") return "Could not retrieve user info.";
        return "Authentication failed.";
    }, [searchParams]);

    const activeError = error || queryError;

    const handleGoogleLogin = () => {
        const returnTo = searchParams.get("return_to");
        const clientId = searchParams.get("client_id");
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login/google`);
        if (returnTo) url.searchParams.set("return_to", returnTo);
        if (clientId) url.searchParams.set("client_id", clientId);
        window.location.href = url.toString();
    };

    const setAccessTokenCookie = (token: string) => {
        const cookieParts = [
            `accessToken=${token}`,
            "path=/",
            "max-age=2592000",
            "SameSite=Lax",
        ];

        if (typeof window !== "undefined" && window.location.protocol === "https:") {
            cookieParts.push("Secure");
        }

        document.cookie = cookieParts.join("; ");
    };

    const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/login/access-token`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        username: email,
                        password,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setError(data?.detail || "Invalid email or password.");
                return;
            }

            const data = await response.json();
            if (!data?.access_token) {
                setError("Unexpected response from server.");
                return;
            }

            localStorage.setItem("accessToken", data.access_token);
            setAccessTokenCookie(data.access_token);

            const returnTo = searchParams.get("return_to");
            router.push(returnTo || "/dashboard");
        } catch (err) {
            console.error("Login failed", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-2">
                        <img
                            src="/favicon.png"
                            alt="Logo"
                            className="h-12 w-12 object-contain"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeError ? (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 text-center">
                            {activeError}
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-4">
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={handleGoogleLogin}
                        >
                            <FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />
                            Google
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handlePasswordLogin}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email or phone</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="m@example.com or +8801..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full font-bold"
                            disabled={isSubmitting || !email || !password}
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="text-center text-sm text-muted-foreground">
                        <Link
                            href="/forgot-password"
                            className="hover:text-primary underline underline-offset-4"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="hover:text-primary underline underline-offset-4"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
