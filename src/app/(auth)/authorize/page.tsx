"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface ClientInfo {
    client_name: string;
    client_uri?: string;
    logo_uri?: string;
    scope: string;
}

function AuthorizeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // OAuth Params
    const clientId = searchParams.get("client_id");
    const redirectUri = searchParams.get("redirect_uri");
    const responseType = searchParams.get("response_type");
    const scope = searchParams.get("scope");
    const state = searchParams.get("state");
    const nonce = searchParams.get("nonce");

    const [client, setClient] = useState<ClientInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authorizing, setAuthorizing] = useState(false);

    useEffect(() => {
        const checkAuthAndFetchClient = async () => {
            // 1. Check Authentication (Check localStorage and Cookies)
            let token = localStorage.getItem("accessToken");

            if (!token) {
                const cookieValue = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('accessToken='))
                    ?.split('=')[1];
                if (cookieValue) {
                    token = cookieValue;
                    localStorage.setItem("accessToken", token);
                }
            }

            if (!token) {
                // Redirect to login with return_to
                const returnUrl = `/authorize?${searchParams.toString()}`;
                router.push(`/login?return_to=${encodeURIComponent(returnUrl)}`);
                return;
            }

            // 2. Validate Params
            if (!clientId || !redirectUri || !responseType) {
                setError("Missing required OAuth parameters.");
                setLoading(false);
                return;
            }

            // 3. Fetch Client Info
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/oauth2/clients/${clientId}`, {
                    credentials: "include"
                });
                if (!res.ok) {
                    throw new Error("Invalid Client ID");
                }
                const data = await res.json();
                setClient(data);

                // 4. Auto-approve for logged-in users (SSO behavior)
                // Automatically authorize without showing consent screen
                await autoApprove(token);
            } catch (err) {
                console.error(err);
                setError("Invalid or unknown client application.");
                setLoading(false);
            }
        };

        const autoApprove = async (token: string) => {
            try {
                // Construct params for backend
                const params = new URLSearchParams();
                if (clientId) params.append("client_id", clientId);
                if (redirectUri) params.append("redirect_uri", redirectUri);
                if (responseType) params.append("response_type", responseType);
                if (scope) params.append("scope", scope);
                if (state) params.append("state", state);
                if (nonce) params.append("nonce", nonce);
                params.append("confirm", "true");

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/oauth2/authorize?${params.toString()}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.redirect_uri) {
                        // Auto-redirect to client application
                        window.location.href = data.redirect_uri;
                    } else {
                        setError("No redirect URI returned from server.");
                        setLoading(false);
                    }
                } else {
                    const data = await res.json().catch(() => null);
                    const msg = data?.detail?.description || data?.detail?.error || data?.detail || "Authorization failed.";
                    setError(typeof msg === "string" ? msg : "Authorization failed.");
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred during authorization.");
                setLoading(false);
            }
        };

        checkAuthAndFetchClient();
    }, [router, searchParams, clientId, redirectUri, responseType, scope, state, nonce]);

    const handleAuthorize = async () => {
        setAuthorizing(true);
        const token = localStorage.getItem("accessToken");

        try {
            // Construct params for backend
            const params = new URLSearchParams();
            if (clientId) params.append("client_id", clientId);
            if (redirectUri) params.append("redirect_uri", redirectUri);
            if (responseType) params.append("response_type", responseType);
            if (scope) params.append("scope", scope);
            if (state) params.append("state", state);
            if (nonce) params.append("nonce", nonce);
            params.append("confirm", "true");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/oauth2/authorize?${params.toString()}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.redirect_uri) {
                    window.location.href = data.redirect_uri;
                } else {
                    toast.error("No redirect URI returned from server.");
                }
            } else {
                const data = await res.json().catch(() => null);
                const msg = data?.detail?.description || data?.detail?.error || data?.detail || "Authorization failed.";
                toast.error(typeof msg === "string" ? msg : "Authorization failed.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during authorization.");
        } finally {
            setAuthorizing(false);
        }
    };

    const handleCancel = () => {
        if (redirectUri) {
            window.location.href = `${redirectUri}?error=access_denied&state=${state || ""}`;
        } else {
            router.push("/dashboard");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <XCircle className="h-5 w-5" />
                            Error
                        </CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => router.push("/dashboard")}>
                            Go to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Authorize Access</CardTitle>
                    <CardDescription>
                        <span className="font-semibold text-foreground">{client?.client_name}</span> wants to access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 text-sm bg-background">
                        <p className="font-medium mb-1">Requested Permissions:</p>
                        <ul className="list-disc list-inside text-muted-foreground">
                            {scope?.split(" ").map((s) => (
                                <li key={s}>{s}</li>
                            )) || <li>Access basic profile info</li>}
                        </ul>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        You will be redirected to <span className="font-mono">{redirectUri}</span>
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" onClick={handleAuthorize} disabled={authorizing}>
                        {authorizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Allow Access
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleCancel} disabled={authorizing}>
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function AuthorizePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <AuthorizeContent />
        </Suspense>
    );
}
