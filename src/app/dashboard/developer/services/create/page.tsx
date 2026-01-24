"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertCircle, Check, Copy, Terminal,
    ArrowLeft, Shield, Server, AlignLeft,
    Globe
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { IpInput } from "@/components/ui/ip-input";

interface ServiceResponseWithKey {
    id: string;
    service_name: string;
    allowed_ips: string[];
    is_active: boolean;
    api_key: string;
}

export default function CreateServicePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<{
        service_name: string;
        description: string;
        allowed_ips: string[];
    }>({
        service_name: "",
        description: "",
        allowed_ips: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdService, setCreatedService] = useState<ServiceResponseWithKey | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Split IPs by comma or newline
            // IPs are already an array
            const ips = formData.allowed_ips;

            const result = await api.post<ServiceResponseWithKey>("/api/v1/management/services/", {
                service_name: formData.service_name,
                description: formData.description,
                allowed_ips: ips
            });

            setCreatedService(result);
        } catch (err: any) {
            setError(err.message || "Failed to create service");
        } finally {
            setLoading(false);
        }
    };

    if (createdService) {
        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Created!</h1>
                    <p className="text-muted-foreground">Your service account is ready to use.</p>
                </div>

                <Card className="border-green-200 bg-green-50/30 overflow-hidden">
                    <CardHeader className="border-b border-green-100 bg-green-50/50">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-700" />
                            <CardTitle className="text-green-800">Secret API Key</CardTitle>
                        </div>
                        <CardDescription className="text-green-700">
                            This key is only shown once. Store it securely immediately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="relative group">
                            <div className="bg-white border rounded-md p-4 font-mono text-sm break-all shadow-sm">
                                {createdService.api_key}
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2 h-8"
                                onClick={() => {
                                    navigator.clipboard.writeText(createdService.api_key);
                                    // Could add toast here
                                }}
                            >
                                <Copy className="h-4 w-4 mr-2" /> Copy
                            </Button>
                        </div>

                        <div className="mt-4 p-3 bg-white/50 rounded text-xs text-muted-foreground flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>
                                If you lose this key, you will need to rotate the credentials in the service settings, which may disrupt your integration.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center gap-4">
                    <Button variant="outline" asChild size="lg">
                        <Link href="/dashboard/developer/services">Back to List</Link>
                    </Button>
                    <Button asChild size="lg">
                        <Link href={`/dashboard/developer/services/${createdService.id}`}>Configure Service</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="-ml-2">
                    <Link href="/dashboard/developer/services">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Create Service Account</h2>
                    <p className="text-sm text-muted-foreground">Provision a new external service identity.</p>
                </div>
            </div>

            <Card className="shadow-sm">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Service Configuration</CardTitle>
                        <CardDescription>
                            Define the identity and security rules for this service.
                        </CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-6 pt-6 mb-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Creation Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="service_name" className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-muted-foreground" />
                                    Service Name
                                </Label>
                                <Input
                                    id="service_name"
                                    placeholder="e.g. billing-service-prod"
                                    required
                                    value={formData.service_name}
                                    onChange={e => setFormData({ ...formData, service_name: e.target.value })}
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    A unique identifier for your service. Used in logs and audit trails.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="flex items-center gap-2">
                                    <AlignLeft className="h-4 w-4 text-muted-foreground" />
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Briefly describe the purpose of this service..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="allowed_ips" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    Allowed IP Addresses
                                </Label>
                                <IpInput
                                    value={formData.allowed_ips}
                                    onChange={(newIps) => setFormData({ ...formData, allowed_ips: newIps })}
                                    placeholder="e.g. 192.168.1.1"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Type an IP address and press Enter or Comma. Paste lists to add multiple.
                                    Use * to allow all.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex justify-between pt-6 bg-muted/20">
                        <Button variant="ghost" asChild>
                            <Link href="/dashboard/developer/services">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={loading} className="min-w-[120px]">
                            {loading ? "Creating..." : "Create Service"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
