"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Shield, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import AuthorizedClients from "@/components/dashboard/AuthorizedClients";

interface UserData {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
    is_email_verified: boolean;
    google_id?: string;
    profile_image?: string;
    created_at?: string;
    phone?: string;
    role?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    router.push("/login");
                    return;
                }

                const data = await response.json();
                setUser(data);

                // Check for stored client_id and auto-redirect to OAuth flow
                const storedClientId = sessionStorage.getItem("oauth_redirect_client_id");
                if (storedClientId) {
                    // Clear the stored client_id to prevent repeated redirects
                    sessionStorage.removeItem("oauth_redirect_client_id");

                    // Fetch client details to get redirect_uri
                    try {
                        const clientResponse = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/oauth2/clients/${storedClientId}`
                        );

                        if (clientResponse.ok) {
                            const client = await clientResponse.json();

                            // Initiate OAuth flow
                            if (client.redirect_uris && client.redirect_uris.length > 0) {
                                const authUrl = new URL(`${window.location.origin}/authorize`);
                                authUrl.searchParams.set("client_id", client.client_id);
                                authUrl.searchParams.set("response_type", "code");
                                authUrl.searchParams.set("scope", "openid profile email");
                                authUrl.searchParams.set("redirect_uri", client.redirect_uris[0]);

                                // Generate state for CSRF protection
                                const state = Math.random().toString(36).substring(7);
                                authUrl.searchParams.set("state", state);
                                sessionStorage.setItem("oauth_state", state);

                                // Redirect to authorization page
                                window.location.href = authUrl.toString();
                                return;
                            }
                        }
                    } catch (error) {
                        console.error("Failed to fetch client for auto-redirect:", error);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="col-span-full md:col-span-2">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                        <AvatarImage src={user.profile_image} alt={user.full_name} referrerPolicy="no-referrer" />
                        <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl">{user.full_name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                    <div className="ml-auto">
                        {user.is_email_verified ? (
                            <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Verified
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Unverified
                            </div>
                        )}
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">User ID</p>
                        <p className="font-mono text-sm">{user.id}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="capitalize">{user.is_superuser ? "Administrator" : "User"}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Auth Provider</p>
                        <p className="text-sm">{user.google_id ? "Google" : "Email/Password"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Joined</p>
                        <p className="text-sm">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : "N/A"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Authorized Applications */}
            <AuthorizedClients />

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/dashboard/settings")}>Update Profile</Button>
                    <Button variant="outline" className="w-full justify-start">Change Password</Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">Delete Account</Button>
                </CardContent>
            </Card>
        </div>
    );
}
