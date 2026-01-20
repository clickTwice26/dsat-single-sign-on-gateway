"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Loader2, Calendar, LayoutGrid, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OAuthClient {
    client_id: string;
    client_name: string;
    client_uri?: string;
    logo_uri?: string;
    created_at: string;
    scope: string;
}

export default function DeveloperDashboard() {
    const [clients, setClients] = useState<OAuthClient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem("accessToken");
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setClients(data);
                }
            } catch (error) {
                console.error("Failed to fetch clients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Your Applications</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage and monitor your OAuth2 applications and API keys.
                    </p>
                </div>
                <Link href="/dashboard/developer/clients/new">
                    <Button className="shadow-sm hover:shadow-md transition-shadow">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New App
                    </Button>
                </Link>
            </div>

            <Separator />

            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                    <div className="rounded-full bg-background p-4 shadow-sm mb-4">
                        <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">No applications created yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mb-8">
                        Get started by registering your first application to integrate with our platform.
                    </p>
                    <Link href="/dashboard/developer/clients/new">
                        <Button size="lg">Register Application</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {clients.map((client) => (
                        <Card key={client.client_id} className="group flex flex-col hover:shadow-lg transition-all duration-200 border-muted/60 overflow-hidden">
                            <CardHeader className="pb-3 bg-muted/10 border-b border-muted/20">
                                <div className="flex items-start justify-between">
                                    <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center border shadow-sm shrink-0 overflow-hidden">
                                        {client.logo_uri ? (
                                            <img
                                                src={client.logo_uri}
                                                alt={client.client_name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : (
                                            <span className="text-lg font-bold text-primary">
                                                {client.client_name.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                        {/* Fallback if image fails or doesn't exist (handled by logic above but keeping simple fallback logic clean is hard in pure JSX refactor) */}
                                    </div>
                                    <Badge variant="outline" className="font-mono text-[10px] opacity-70">
                                        Active
                                    </Badge>
                                </div>
                                <div className="mt-4">
                                    <CardTitle className="text-lg font-semibold line-clamp-1">{client.client_name}</CardTitle>
                                    <CardDescription className="line-clamp-1 text-xs mt-1">
                                        {client.client_uri || "No homepage"}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 pt-4 text-sm text-muted-foreground">
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">Client ID</span>
                                        <code className="bg-muted p-1 px-2 rounded text-xs font-mono block w-full truncate">
                                            {client.client_id}
                                        </code>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs pt-2">
                                        <Calendar className="h-3 w-3" />
                                        Created {new Date(client.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-4">
                                <Link href={`/dashboard/developer/clients/${client.client_id}`} className="w-full">
                                    <Button variant="outline" className="w-full group-hover:border-primary/50 group-hover:text-primary transition-colors">
                                        Manage Application
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
