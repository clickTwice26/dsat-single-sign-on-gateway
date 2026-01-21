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
import { Button } from "@/components/ui/button";

interface OAuth2Client {
    client_id: string;
    client_name: string;
    client_uri?: string;
    logo_uri?: string;
    redirect_uris: string[];
}

export default function AuthorizedClients() {
    const [clients, setClients] = useState<OAuth2Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/oauth2/clients`);
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
            <Card>
                <CardHeader>
                    <CardTitle>Authorized Applications</CardTitle>
                    <CardDescription>Applications you can access with SSO</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Authorized Applications</CardTitle>
                    <CardDescription>Applications you can access with SSO</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (clients.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Authorized Applications</CardTitle>
                    <CardDescription>Applications you can access with SSO</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No applications available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Authorized Applications</CardTitle>
                <CardDescription>Click on any application to login with SSO</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <button
                            key={client.client_id}
                            onClick={() => handleClientClick(client)}
                            className="group relative flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
                        >
                            <Avatar className="h-12 w-12 border">
                                {client.logo_uri ? (
                                    <AvatarImage src={client.logo_uri} alt={client.client_name} />
                                ) : (
                                    <AvatarFallback>
                                        <AppWindow className="h-6 w-6" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <h3 className="font-semibold leading-none group-hover:text-primary">
                                    {client.client_name}
                                </h3>
                                {client.client_uri && (
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <ExternalLink className="h-3 w-3" />
                                        {new URL(client.client_uri).hostname}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
