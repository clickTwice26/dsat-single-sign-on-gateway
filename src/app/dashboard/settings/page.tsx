"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Shield, Mail, Loader2
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

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.push("/login");
            return;
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [router]);

    if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />;
    if (!user) return null;

    return <SettingsView user={user} onUpdate={fetchUser} />;
}

function SettingsView({ user, onUpdate }: { user: UserData; onUpdate: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user.full_name || "",
        phone: user.phone || "",
        profile_image: user.profile_image || "",
    });
    const [passwordForm, setPasswordForm] = useState({
        current: "",
        next: "",
        confirm: "",
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
                const data = await response.json();
                throw new Error(data.detail || "Failed to update profile");
            }

            await onUpdate();
            return "Profile updated successfully";
        };

        toast.promise(promise, {
            loading: "Updating profile...",
            success: (data) => `${data}`,
            error: (err) => err.message || "Failed to update profile",
        });

        setIsLoading(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.next !== passwordForm.confirm) {
            toast.error("New passwords do not match");
            return;
        }

        setIsUpdatingPassword(true);

        const passwordPromise = (async () => {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: passwordForm.current || undefined,
                    new_password: passwordForm.next,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || "Failed to update password");
            }

            setPasswordForm({ current: "", next: "", confirm: "" });
            return data?.message || "Password updated successfully";
        })();

        toast.promise(passwordPromise, {
            loading: "Updating password...",
            success: (data) => `${data}`,
            error: (err) => err.message || "Failed to update password",
        });

        passwordPromise.finally(() => setIsUpdatingPassword(false));
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
                                <AvatarImage src={formData.profile_image || user.profile_image} referrerPolicy="no-referrer" />
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

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password using your current credentials.</CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordChange}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password (leave blank if none set)</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordForm.current}
                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                autoComplete="current-password"
                                placeholder="Enter current password if you have one"
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="new_password">New Password</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    value={passwordForm.next}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm New Password</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            If you signed up with Google only, set a password to enable email login.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-4">
                        <Button type="submit" disabled={isUpdatingPassword}>
                            {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
