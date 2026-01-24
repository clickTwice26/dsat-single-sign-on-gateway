"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, AppWindow } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OAuth2Client {
    client_id: string;
    client_name: string;
    client_uri?: string;
    logo_uri?: string;
    redirect_uris: string[];
    description?: string;
    visible_on_dashboard?: boolean;
}

export default function AuthorizedClients() {
    const [clients, setClients] = useState<OAuth2Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/public`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setClients(data);
                } else {
                    setError("Failed to load applications");
                }
            } catch (err) {
                console.error("Failed to fetch clients:", err);
                setError("Failed to load applications");
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const handleClientClick = (client: OAuth2Client) => {
        // Construct OAuth authorization URL pointing to frontend authorize page
        const authUrl = new URL(`${window.location.origin}/authorize`);
        authUrl.searchParams.set("client_id", client.client_id);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", "openid profile email");

        // Use the first registered redirect_uri from the client
        if (!client.redirect_uris || client.redirect_uris.length === 0) {
            console.error("Client has no registered redirect URIs");
            return;
        }
        authUrl.searchParams.set("redirect_uri", client.redirect_uris[0]);

        // Generate a random state for CSRF protection
        const state = Math.random().toString(36).substring(7);
        authUrl.searchParams.set("state", state);

        // Store state in sessionStorage for verification
        sessionStorage.setItem("oauth_state", state);

        // Redirect to authorization page
        window.location.href = authUrl.toString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-destructive font-medium">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page.</p>
            </div>
        );
    }

    if (clients.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed rounded-xl border-muted-foreground/20">
                <AppWindow className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No Applications Found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                    There are no applications authorized for your account yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight">Authorized Applications</h2>
                <p className="text-muted-foreground text-sm">
                    Access your connected services with a single click
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {clients.map((client) => (
                    <button
                        key={client.client_id}
                        onClick={() => handleClientClick(client)}
                        className="group flex flex-col p-6 rounded-2xl border-2 bg-card text-left transition-all hover:border-primary hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Avatar className="h-14 w-14 border-2 border-muted shadow-sm group-hover:border-primary/20 transition-colors">
                                {client.logo_uri ? (
                                    <AvatarImage src={client.logo_uri} alt={client.client_name} />
                                ) : (
                                    <AvatarFallback className="bg-primary/5 text-primary">
                                        <AppWindow className="h-7 w-7" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                        </div>

                        <div className="space-y-2 mt-auto">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                {client.client_name}
                            </h3>
                            {client.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {client.description}
                                </p>
                            )}
                            {client.client_uri && (
                                <div className="pt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {new URL(client.client_uri).hostname}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
