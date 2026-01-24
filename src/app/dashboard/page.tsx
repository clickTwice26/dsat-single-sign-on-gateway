"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthorizedClients from "@/components/dashboard/AuthorizedClients";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        const handleAutoRedirect = async () => {
            // Check for stored client_id and auto-redirect to OAuth flow
            const storedClientId = sessionStorage.getItem("oauth_redirect_client_id");
            if (storedClientId) {
                sessionStorage.removeItem("oauth_redirect_client_id");
                try {
                    // Fetch client details using the centralized API client
                    // Note: Auth header is automatically intercepted if token exists
                    const client = await api.get<{
                        client_id: string;
                        redirect_uris: string[];
                    }>(`/api/v1/clients/${storedClientId}`);

                    if (client && client.redirect_uris && client.redirect_uris.length > 0) {
                        const authUrl = new URL(`${window.location.origin}/authorize`);
                        authUrl.searchParams.set("client_id", client.client_id);
                        authUrl.searchParams.set("response_type", "code");
                        authUrl.searchParams.set("scope", "openid profile email");
                        authUrl.searchParams.set("redirect_uri", client.redirect_uris[0]);

                        const state = Math.random().toString(36).substring(7);
                        authUrl.searchParams.set("state", state);
                        sessionStorage.setItem("oauth_state", state);

                        window.location.href = authUrl.toString();
                    }
                } catch (error) {
                    console.error("Failed to fetch client for auto-redirect:", error);
                }
            }
        };

        if (user) {
            handleAutoRedirect();
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AuthorizedClients />
        </div>
    );
}
