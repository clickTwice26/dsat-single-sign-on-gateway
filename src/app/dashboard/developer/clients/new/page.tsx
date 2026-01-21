"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Globe, Image as ImageIcon, AppWindow, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

const clientFormSchema = z.object({
    client_name: z.string().min(2, "Name must be at least 2 characters."),
    client_uri: z.string().or(z.literal("")),
    logo_uri: z.string().or(z.literal("")),
    redirect_uris: z.string().min(1, "At least one callback URL is required."),
    scope: z.string().min(1, "Scope is required"),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function NewClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            client_name: "",
            client_uri: "",
            logo_uri: "",
            redirect_uris: "",
            scope: "openid profile email",
        },
    });

    async function onSubmit(data: ClientFormValues) {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // Split redirect_uris by newline or comma and clean up
        const redirectUrisList = data.redirect_uris
            .split(/[\n,]+/)
            .map(uri => uri.trim())
            .filter(uri => uri.length > 0);

        const payload = {
            ...data,
            redirect_uris: redirectUrisList,
            client_uri: data.client_uri || undefined,
            logo_uri: data.logo_uri || undefined,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to create client");
            }

            const result = await response.json();
            toast.success("Application created successfully!");
            router.push(`/dashboard/developer/clients/${result.client_id}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create application. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <Link href="/dashboard/developer" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm mb-2 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Apps
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Register Application</h2>
                    <p className="text-muted-foreground text-lg">
                        Create a new OAuth2 application to integrate with our platform.
                    </p>
                </div>
            </div>

            <Card className="border-muted/60 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Application Details</CardTitle>
                    <CardDescription>
                        Configure the public information and callback URLs for your app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Basic Info Section */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="client_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Application Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <AppWindow className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="My Awesome App" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                This name will be displayed to users on the authorization screen.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="client_uri"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Homepage URL <span className="text-muted-foreground font-normal text-xs">(Optional)</span></FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="https://example.com" className="pl-9" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="logo_uri"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Logo URL <span className="text-muted-foreground font-normal text-xs">(Optional)</span></FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="https://example.com/logo.png" className="pl-9" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Redirect URIs Section */}
                            <FormField
                                control={form.control}
                                name="redirect_uris"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Callback URLs (Redirect URIs)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Textarea
                                                    placeholder="https://example.com/callback"
                                                    {...field}
                                                    className="pl-9 min-h-[120px] font-mono text-sm leading-relaxed"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Allowed callback URLs. Put each URL on a new line. We will only redirect users to these locations.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button variant="outline" type="button" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="min-w-[150px]">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Register Application
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
