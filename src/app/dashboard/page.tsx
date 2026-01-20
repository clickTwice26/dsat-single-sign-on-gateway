"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    User, Mail, Shield, CheckCircle2, AlertCircle, LogOut,
    LayoutDashboard, Settings as SettingsIcon, Loader2, Users
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserManagementView } from "@/components/dashboard/user-management";

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
    const [currentView, setCurrentView] = useState<"dashboard" | "settings" | "users">("dashboard");

    const fetchUser = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
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

    useEffect(() => {
        fetchUser();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/login");
    };

    const isDeveloper = user?.role === "developer" || user?.is_superuser;

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

    return (
        <div className="flex h-screen w-full bg-muted/40">
            {/* Sidebar (Desktop) */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <div className="flex h-14 items-center border-b px-6">
                    <span className="text-lg font-bold">DSAT School</span>
                </div>
                <nav className="flex-1 space-y-2 p-4">
                    <Button
                        variant={currentView === "dashboard" ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                        onClick={() => setCurrentView("dashboard")}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Button>
                    <Button
                        variant={currentView === "settings" ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                        onClick={() => setCurrentView("settings")}
                    >
                        <SettingsIcon className="h-4 w-4" />
                        Settings
                    </Button>

                    {isDeveloper && (
                        <>
                            <Separator className="my-2" />
                            <Button
                                variant={currentView === "users" ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                                onClick={() => setCurrentView("users")}
                            >
                                <Users className="h-4 w-4" />
                                User Management
                            </Button>
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

                <div className="container mx-auto max-w-6xl p-6 space-y-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight capitalize">
                            {currentView === "users" ? "User Management" : currentView}
                        </h1>
                        {currentView === "dashboard" && (
                            <p className="text-muted-foreground">
                                Welcome back, <span className="font-medium text-foreground">{user.full_name}</span>
                            </p>
                        )}
                        {currentView === "settings" && (
                            <p className="text-muted-foreground">
                                Manage your account settings and preferences.
                            </p>
                        )}
                        {currentView === "users" && (
                            <p className="text-muted-foreground">
                                Manage system users and view their details.
                            </p>
                        )}
                    </div>

                    {currentView === "dashboard" && (
                        <DashboardView user={user} setCurrentView={setCurrentView} />
                    )}
                    {currentView === "settings" && (
                        <SettingsView user={user} onUpdate={fetchUser} />
                    )}
                    {currentView === "users" && isDeveloper && (
                        <UserManagementView />
                    )}
                </div>
            </main>
        </div>
    );
}

function DashboardView({ user, setCurrentView }: { user: UserData; setCurrentView: (view: "dashboard" | "settings") => void }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="col-span-full md:col-span-2">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                        <AvatarImage src={user.profile_image} alt={user.full_name} />
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

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setCurrentView("settings")}>Update Profile</Button>
                    <Button variant="outline" className="w-full justify-start">Change Password</Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">Delete Account</Button>
                </CardContent>
            </Card>
        </div>
    );
}

function SettingsView({ user, onUpdate }: { user: UserData; onUpdate: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user.full_name || "",
        phone: user.phone || "",
        profile_image: user.profile_image || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const promise = async () => {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            await onUpdate();
            return "Profile updated successfully";
        };

        toast.promise(promise, {
            loading: "Updating profile...",
            success: (data) => `${data}`,
            error: "Failed to update profile",
        });

        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your account's profile information and email address.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            <Avatar className="h-24 w-24 border-4 border-muted">
                                <AvatarImage src={formData.profile_image || user.profile_image} />
                                <AvatarFallback className="text-xl">{user.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2 w-full">
                                <Label htmlFor="profile_image">Profile Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="profile_image"
                                        value={formData.profile_image}
                                        onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                                        placeholder="https://example.com/me.jpg"
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Link to a publicly accessible image (e.g., from Gravatar or Google).
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+880..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="pl-9 bg-muted/50"
                                />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Email addresses cannot be changed once registered.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Role & Permissions</CardTitle>
                    <CardDescription>
                        Your current role and system access levels.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                            <Label className="text-base">Current Role</Label>
                            <p className="text-sm text-muted-foreground">
                                {user.is_superuser
                                    ? "You have full administrative access to the system."
                                    : "You have standard access to student features."}
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${user.is_superuser
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}>
                            <Shield className="h-4 w-4" />
                            {user.is_superuser ? "Administrator" : "Student"}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
