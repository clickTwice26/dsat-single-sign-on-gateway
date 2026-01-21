"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard, Settings as SettingsIcon, Users, LogOut,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            // Check localStorage first
            let token = localStorage.getItem("accessToken");

            // If not in localStorage, check cookie (client-side only)
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
                router.push("/login");
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
                    credentials: "include", // Send cookie
                    headers: {
                        Authorization: `Bearer ${token}`, // Still send header for backward compatibility
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    localStorage.removeItem("accessToken");
                    router.push("/login");
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                router.push("/login?error=fetch_failed");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isDeveloper = user?.role === "developer" || user?.is_superuser;

    return (
        <div className="flex h-screen w-full bg-muted/40">
            {/* Sidebar (Desktop) */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <div className="flex h-14 items-center border-b px-6">
                    <span className="text-lg font-bold">DSAT School</span>
                </div>
                <nav className="flex-1 space-y-2 p-4">
                    <Link href="/dashboard">
                        <Button
                            variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                        <Button
                            variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                        >
                            <SettingsIcon className="h-4 w-4" />
                            Settings
                        </Button>
                    </Link>

                    {isDeveloper && (
                        <>
                            <Separator className="my-2" />
                            <Link href="/dashboard/users">
                                <Button
                                    variant={pathname === "/dashboard/users" ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2"
                                >
                                    <Users className="h-4 w-4" />
                                    User Management
                                </Button>
                            </Link>
                            <Link href="/dashboard/developer">
                                <Button
                                    variant={pathname.startsWith("/dashboard/developer") ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    OAuth Clients
                                </Button>
                            </Link>
                        </>
                    )}
                </nav>
                <div className="border-t p-4">
                    <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="flex h-14 items-center justify-between border-b bg-background px-6 md:hidden">
                    <span className="font-bold">DSAT School</span>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col gap-2">
                        {pathname === "/dashboard" && (
                            <>
                                <h1 className="text-3xl font-bold tracking-tight capitalize">Dashboard</h1>
                                <p className="text-muted-foreground">
                                    Welcome back, <span className="font-medium text-foreground">{user.full_name}</span>
                                </p>
                            </>
                        )}
                        {pathname === "/dashboard/settings" && (
                            <>
                                <h1 className="text-3xl font-bold tracking-tight capitalize">Settings</h1>
                                <p className="text-muted-foreground">
                                    Manage your account settings and preferences.
                                </p>
                            </>
                        )}
                        {pathname === "/dashboard/users" && null}
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
