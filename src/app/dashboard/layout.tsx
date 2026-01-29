"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    LayoutDashboard, Settings as SettingsIcon, Users, LogOut,
    Loader2, Server, BookOpen, GraduationCap, Receipt, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { PhoneRequirementModal } from "@/components/dashboard/phone-requirement-modal";
import { PasswordRequirementModal } from "@/components/dashboard/password-requirement-modal";

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
    has_password?: boolean;
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
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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
                document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                router.push("/login");
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            router.push("/login?error=fetch_failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    // Check if phone number is required but missing
    const showPhoneModal = !!user && !user.phone;

    if (showPhoneModal) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40">
                <PhoneRequirementModal
                    open={true}
                    onUpdate={fetchUser}
                />
                <div className="flex flex-col items-center gap-4 text-center p-8">
                    <div className="h-12 w-12 rounded-full bg-yellow-100 p-2 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                    <h2 className="text-lg font-semibold">Action Required</h2>
                    <p className="text-muted-foreground max-w-sm">
                        Please provide your phone number to continue accessing the dashboard.
                    </p>
                </div>
            </div>
        );
    }

    // 2. Password (Second Priority) - Only if phone is set
    const showPasswordModal = !!user && user.phone && user.has_password === false;

    if (showPasswordModal) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40">
                <PasswordRequirementModal
                    open={true}
                    onUpdate={fetchUser}
                />
                <div className="flex flex-col items-center gap-4 text-center p-8">
                    <div className="h-12 w-12 rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                    <h2 className="text-lg font-semibold">Security Update Required</h2>
                    <p className="text-muted-foreground max-w-sm">
                        Please set a password to secure your account.
                    </p>
                </div>
            </div>
        );
    }

    const isDeveloper = user?.role === "developer" || user?.is_superuser;

    const SidebarContent = () => (
        <>
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
                <Link href="/dashboard/courses">
                    <Button
                        variant={pathname === "/dashboard/courses" ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                    >
                        <GraduationCap className="h-4 w-4" />
                        Courses
                    </Button>
                </Link>
                <Link href="/dashboard/billing">
                    <Button
                        variant={pathname === "/dashboard/billing" ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        Billing
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
                                variant={pathname === "/dashboard/developer" || pathname.startsWith("/dashboard/developer/clients") ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                OAuth Clients
                            </Button>
                        </Link>
                        <Link href="/dashboard/developer/services">
                            <Button
                                variant={pathname.startsWith("/dashboard/developer/services") ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                            >
                                <Server className="h-4 w-4" />
                                Service Accounts
                            </Button>
                        </Link>

                        <Link href="/dashboard/developer/docs">
                            <Button
                                variant={pathname.startsWith("/dashboard/developer/docs") ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                            >
                                <BookOpen className="h-4 w-4" />
                                Documentation
                            </Button>
                        </Link>
                    </>
                )}
            </nav>
            <div className="border-t p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={() => setLogoutDialogOpen(true)}
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </Button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen w-full bg-muted/40">
            {/* Sidebar (Desktop) */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="flex h-14 items-center justify-between border-b bg-background px-6 md:hidden">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-3">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[80%] max-w-[300px] p-0 flex flex-col">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>
                        <span className="font-bold">DSAT School</span>
                    </div>
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

            <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be redirected to the login page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Log out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
