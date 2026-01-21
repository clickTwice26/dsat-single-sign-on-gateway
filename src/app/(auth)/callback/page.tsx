"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const userId = searchParams.get("user_id");
        const returnTo = searchParams.get("return_to");

        if (token) {
            // Store token in localStorage (or cookie)
            localStorage.setItem("accessToken", token);
            document.cookie = `accessToken=${token}; path=/; max-age=2592000; SameSite=Lax`; // 30 days

            // Redirect to dashboard or return_to
            if (returnTo) {
                router.push(returnTo);
            } else {
                router.push("/dashboard");
            }
        } else {
            // Handle error
            const error = searchParams.get("error");
            const detail = searchParams.get("detail");
            router.push(`/login?error=${error || "oauth_failed"}&detail=${detail || ""}`);
        }

    }, [router, searchParams]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Authenticating...</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
