"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Server, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface ServiceClient {
    id: string;
    service_name: string;
    description?: string;
    allowed_ips: string[];
    is_active: boolean;
    created_at: string;
    usage_count: number;
}

export default function ServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState<ServiceClient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await api.get<ServiceClient[]>("/api/v1/management/services/");
            setServices(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Service Accounts</h2>
                    <p className="text-muted-foreground">Manage API keys and access controls for your backend services.</p>
                </div>
                <Button onClick={() => router.push("/dashboard/developer/services/create")}>
                    <Plus className="mr-2 h-4 w-4" /> Create Service
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Registered Services</CardTitle>
                    <CardDescription>
                        List of external applications authorized to access user data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p>Loading services...</p>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                <Server className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="font-semibold text-lg">No services configured</h3>
                                <p className="text-muted-foreground text-sm">
                                    You haven't created any service accounts yet. Create one to issue API keys for your applications.
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => router.push("/dashboard/developer/services/create")}>
                                <Plus className="mr-2 h-4 w-4" /> Create your first service
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[200px]">Service Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Allowed IPs</TableHead>
                                    <TableHead>Requests</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Manage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map((service) => (
                                    <TableRow key={service.id} className="hover:bg-muted/5">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{service.service_name}</span>
                                                {service.description && (
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {service.description}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={service.is_active ? "default" : "secondary"} className="rounded-full px-2 py-0.5 text-xs font-normal">
                                                {service.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap items-center">
                                                {service.allowed_ips.length > 0 ? (
                                                    <>
                                                        {service.allowed_ips.slice(0, 2).map((ip) => (
                                                            <code key={ip} className="bg-muted px-1.5 py-0.5 rounded textxs font-mono text-xs">
                                                                {ip}
                                                            </code>
                                                        ))}
                                                        {service.allowed_ips.length > 2 && (
                                                            <span className="text-xs text-muted-foreground">+{service.allowed_ips.length - 2}</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">Any IP</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-sm">{service.usage_count}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(service.created_at), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/developer/services/${service.id}`}>
                                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
