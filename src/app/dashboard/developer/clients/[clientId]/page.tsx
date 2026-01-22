"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Copy, Trash, RefreshCw, ArrowLeft, Key, ShieldAlert, Globe, Link as LinkIcon, AlertTriangle, UserCheck, Edit2, Plus, Save, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OAuthClient {
    client_id: string;
    client_name: string;
    client_uri?: string;
    logo_uri?: string;
    description?: string;
    created_at: string;
    scope: string;
    redirect_uris: string[];
    client_secret?: string;
    visible_on_dashboard: boolean;
}

export default function ClientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.clientId as string;

    const [client, setClient] = useState<OAuthClient | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [newSecret, setNewSecret] = useState<string | null>(null);
    const [showSecret, setShowSecret] = useState(false);

    // Callback URL editing state
    const [isEditingCallbacks, setIsEditingCallbacks] = useState(false);
    const [editedRedirectUris, setEditedRedirectUris] = useState<string[]>([]);
    const [isSavingCallbacks, setIsSavingCallbacks] = useState(false);
    
    // Basic info editing state
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
    const [editedClientName, setEditedClientName] = useState("");
    const [editedDescription, setEditedDescription] = useState("");
    const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false);

    useEffect(() => {
        const fetchClient = async () => {
            const token = localStorage.getItem("accessToken");
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${clientId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setClient(data);
                    setEditedRedirectUris(data.redirect_uris || []);
                    setEditedClientName(data.client_name);
                    setEditedDescription(data.description || "");
                } else {
                    toast.error("Failed to load application details.");
                    router.push("/dashboard/developer");
                }
            } catch (error) {
                console.error("Failed to fetch client:", error);
            } finally {
                setLoading(false);
            }
        };

        if (clientId) {
            fetchClient();
        }
    }, [clientId, router]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handleRegenerateSecret = async () => {
        setRegenerating(true);
        const token = localStorage.getItem("accessToken");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${clientId}/regenerate-secret`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setNewSecret(data.client_secret);
                toast.success("Client secret regenerated successfully. Copy it now!");
            } else {
                toast.error("Failed to regenerate secret.");
            }
        } catch (error) {
            console.error("Failed to regenerate secret:", error);
            toast.error("An error occurred.");
        } finally {
            setRegenerating(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        const token = localStorage.getItem("accessToken");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${clientId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                toast.success("Application deleted successfully.");
                router.push("/dashboard/developer");
            } else {
                toast.error("Failed to delete application.");
            }
        } catch (error) {
            console.error("Failed to delete client:", error);
            toast.error("An error occurred.");
        } finally {
            setDeleting(false);
        }
    };

    const handleSaveCallbacks = async () => {
        setIsSavingCallbacks(true);
        const token = localStorage.getItem("accessToken");
        try {
            // Filter out empty strings
            const urisToSave = editedRedirectUris.filter(uri => uri.trim() !== "");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${clientId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...client,
                    redirect_uris: urisToSave,
                }),
            });

            if (response.ok) {
                const updatedClient = await response.json();
                setClient(updatedClient);
                setIsEditingCallbacks(false);
                toast.success("Callback URLs updated successfully.");
            } else {
                toast.error("Failed to update callback URLs.");
            }
        } catch (error) {
            console.error("Failed to save callbacks:", error);
            toast.error("An error occurred.");
        } finally {
            setIsSavingCallbacks(false);
        }
    };

    const handleSaveBasicInfo = async () => {
        setIsSavingBasicInfo(true);
        const token = localStorage.getItem("accessToken");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${clientId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...client,
                    client_name: editedClientName,
                    description: editedDescription,
                }),
            });

            if (response.ok) {
                const updatedClient = await response.json();
                setClient(updatedClient);
                setIsEditingBasicInfo(false);
                toast.success("Application details updated successfully.");
            } else {
                toast.error("Failed to update application details.");
            }
        } catch (error) {
            console.error("Failed to save basic info:", error);
            toast.error("An error occurred.");
        } finally {
            setIsSavingBasicInfo(false);
        }
    };

    const addCallbackUrl = () => {
        setEditedRedirectUris([...editedRedirectUris, ""]);
    };

    const removeCallbackUrl = (index: number) => {
        const newUris = [...editedRedirectUris];
        newUris.splice(index, 1);
        setEditedRedirectUris(newUris);
    };

    const updateCallbackUrl = (index: number, value: string) => {
        const newUris = [...editedRedirectUris];
        newUris[index] = value;
        setEditedRedirectUris(newUris);
    };

    const handleToggleVisibility = async (checked: boolean) => {
        const token = localStorage.getItem("accessToken");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${clientId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...client,
                    visible_on_dashboard: checked,
                }),
            });

            if (response.ok) {
                const updatedClient = await response.json();
                setClient(updatedClient);
                toast.success(checked ? "Application is now visible on user dashboard" : "Application hidden from user dashboard");
            } else {
                toast.error("Failed to update visibility setting");
            }
        } catch (error) {
            console.error("Failed to toggle visibility:", error);
            toast.error("An error occurred");
        }
    };


    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-6">
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/developer" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors w-fit">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Apps
                </Link>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-background flex items-center justify-center border shadow-sm shrink-0 overflow-hidden">
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
                                <span className="text-2xl font-bold text-primary">
                                    {client.client_name.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{client.client_name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="font-mono text-xs">{client.client_id}</Badge>
                                {client.client_uri && (
                                    <a href={client.client_uri} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        {new URL(client.client_uri).hostname}
                                    </a>
                                )}
                            </div>
                            {client.description && (
                                <p className="text-sm text-muted-foreground mt-2">{client.description}</p>
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsEditingBasicInfo(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit Details
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Credentials Card */}
                    <Card className="border-muted/60 shadow-sm">
                        <CardHeader className="bg-muted/10 pb-4 border-b">
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                <CardTitle>Client Credentials</CardTitle>
                            </div>
                            <CardDescription>
                                Secure credentials for application authentication. Treat these as sensitive secrets.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="client-id" className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">Client ID</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input id="client-id" value={client.client_id} readOnly className="font-mono bg-muted/40 pr-10" />
                                    </div>
                                    <Button variant="outline" size="icon" onClick={() => handleCopy(client.client_id, "Client ID")} className="shrink-0">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Unique identifier for your application.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="client-secret" className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">Client Secret</Label>
                                <div className="flex flex-col gap-2">
                                    {newSecret ? (
                                        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/40 p-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-semibold">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    New Secret Generated
                                                </div>
                                                <Badge variant="outline" className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 bg-yellow-500/10">Copy Immediately</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newSecret}
                                                    readOnly
                                                    className="font-mono bg-background border-yellow-500/40"
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => handleCopy(newSecret, "Client Secret")}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-3">
                                                Make sure to copy your new secret now. You won't be able to see it again!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                value={showSecret && client.client_secret ? client.client_secret : "••••••••••••••••••••••••••••••••••••••••••••••••"}
                                                readOnly
                                                className="font-mono bg-muted/40 flex-1 text-muted-foreground tracking-widest"
                                                type="text"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowSecret(!showSecret)}
                                                className="shrink-0"
                                            >
                                                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" className="text-primary hover:text-primary hover:bg-primary/10">
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Regenerate Secret
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Regenerate Client Secret?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will <strong>invalidate the current secret immediately.</strong> Any running applications using the old secret will fail to authenticate until updated with the new secret.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleRegenerateSecret}>Yes, Regenerate</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* URLs Card */}
                    <Card className="border-muted/60 shadow-sm">
                        <CardHeader className="bg-muted/10 pb-4 border-b">
                            <div className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-primary" />
                                <CardTitle>Callback URLs</CardTitle>
                            </div>
                            <CardDescription>
                                The whitelist of URLs that users can be redirected to after logging in.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">

                            {!isEditingCallbacks ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        {client.redirect_uris && client.redirect_uris.length > 0 ? (
                                            client.redirect_uris.map((uri, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-muted/40 border border-muted/60 text-sm font-mono break-all group">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                                    <span className="flex-1">{uri}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No callback URLs defined.</p>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditingCallbacks(true)}>
                                        <Edit2 className="mr-2 h-3 w-3" />
                                        Edit URLs
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {editedRedirectUris.map((uri, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={uri}
                                                    onChange={(e) => updateCallbackUrl(i, e.target.value)}
                                                    placeholder="https://example.com/callback"
                                                    className="font-mono text-sm"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeCallbackUrl(i)}
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addCallbackUrl} className="w-full border-dashed">
                                        <Plus className="mr-2 h-3 w-3" />
                                        Add URL
                                    </Button>

                                    <div className="flex gap-2 pt-2">
                                        <Button onClick={handleSaveCallbacks} disabled={isSavingCallbacks}>
                                            {isSavingCallbacks && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </Button>
                                        <Button variant="ghost" onClick={() => {
                                            setIsEditingCallbacks(false);
                                            setEditedRedirectUris(client.redirect_uris || []);
                                        }} disabled={isSavingCallbacks}>
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Config / Danger Zone */}
                <div className="md:col-span-1 space-y-6">
                    {/* Visibility Settings */}
                    <Card className="border-muted/60 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-primary" />
                                <CardTitle>Dashboard Visibility</CardTitle>
                            </div>
                            <CardDescription>
                                Control whether this application appears on users' dashboards
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="visibility-toggle" className="text-sm font-medium">
                                        Show on Dashboard
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {client.visible_on_dashboard 
                                            ? "Users can see and access this app" 
                                            : "Hidden from users' dashboard"}
                                    </p>
                                </div>
                                <Switch
                                    id="visibility-toggle"
                                    checked={client.visible_on_dashboard}
                                    onCheckedChange={handleToggleVisibility}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/30 shadow-sm bg-destructive/5">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-destructive">
                                <ShieldAlert className="h-5 w-5" />
                                <CardTitle>Danger Zone</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Only delete this application if you are absolutely sure. This action cannot be reversed.
                            </p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete Application
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the application <strong>{client.client_name}</strong> and all associated data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete Application
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Basic Info Dialog */}
            {isEditingBasicInfo && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Edit Application Details</CardTitle>
                            <CardDescription>Update your application name and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Application Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editedClientName}
                                    onChange={(e) => setEditedClientName(e.target.value)}
                                    placeholder="My Application"
                                    disabled={isSavingBasicInfo}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    placeholder="What does your application do?"
                                    rows={4}
                                    disabled={isSavingBasicInfo}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground">{editedDescription.length}/500</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => {
                                        setIsEditingBasicInfo(false);
                                        setEditedClientName(client?.client_name || "");
                                        setEditedDescription(client?.description || "");
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isSavingBasicInfo}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveBasicInfo}
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    disabled={isSavingBasicInfo || !editedClientName.trim()}
                                >
                                    {isSavingBasicInfo ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
