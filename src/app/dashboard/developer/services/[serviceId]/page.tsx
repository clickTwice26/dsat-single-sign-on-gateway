"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, RefreshCw, Trash2, Check, Copy, Eye, RotateCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { IpInput } from "@/components/ui/ip-input";
import { toast } from "sonner";

interface ServiceClient {
    id: string;
    service_name: string;
    description?: string;
    allowed_ips: string[];
    is_active: boolean;
    created_at: string;
    last_used_at?: string;
    usage_count: number;
    owner_id?: string;
}

interface ServiceLog {
    id: string;
    service_id: string;
    method: string;
    path: string;
    response_status: number;
    duration_ms: number;
    timestamp: string;
    request_body?: any;
    request_headers?: any;
    response_body?: any;
    response_headers?: any;
    client_ip?: string;
}

interface PaginatedLogs {
    items: ServiceLog[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export default function ServiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;

    const [service, setService] = useState<ServiceClient | null>(null);
    const [loading, setLoading] = useState(true);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Logs State
    const [logs, setLogs] = useState<ServiceLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ServiceLog | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [methodFilter, setMethodFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Edit State
    const [formData, setFormData] = useState<{
        description: string;
        allowed_ips: string[];
        is_active: boolean;
    }>({
        description: "",
        allowed_ips: [],
        is_active: true
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (serviceId) {
            fetchService();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serviceId]);

    useEffect(() => {
        if (serviceId) {
            fetchLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serviceId, page]);

    const fetchService = async () => {
        try {
            const data = await api.get<ServiceClient[]>("/api/v1/management/services/");
            const found = data.find(s => s.id === serviceId);
            if (found) {
                setService(found);
                setFormData({
                    description: found.description || "",
                    allowed_ips: found.allowed_ips,
                    is_active: found.is_active
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setFormLoading(true);
        try {
            const updated = await api.put<ServiceClient>(`/api/v1/management/services/${serviceId}`, {
                description: formData.description,
                allowed_ips: formData.allowed_ips,
                is_active: formData.is_active
            });

            setService(updated);
            setHasChanges(false);
            toast.success("Configuration saved successfully");
        } catch (err) {
            toast.error("Failed to update configuration");
        } finally {
            setFormLoading(false);
        }
    };

    const handleRotateKey = async () => {
        try {
            const result = await api.post<{ api_key: string }>(`/api/v1/management/services/${serviceId}/rotate-key`, {});
            setNewKey(result.api_key);
            toast.success("API Key rotated successfully");
        } catch (err) {
            toast.error("Failed to rotate key");
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/v1/management/services/${serviceId}`);
            toast.success("Service deleted");
            router.push("/dashboard/developer/services");
        } catch (err) {
            toast.error("Failed to delete service");
        }
    };

    const fetchLogs = async (newPage?: number) => {
        setLogsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            if (methodFilter && methodFilter !== "all") params.append("method", methodFilter);
            if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

            params.append("page", (newPage || page).toString());
            params.append("limit", "20");

            const data = await api.get<PaginatedLogs | ServiceLog[]>(`/api/v1/management/services/${serviceId}/logs?${params.toString()}`);

            if (Array.isArray(data)) {
                // Fallback for non-paginated response
                setLogs(data);
                setTotalItems(data.length);
                setTotalPages(1);
            } else {
                setLogs(data.items || []);
                setTotalPages(data.pages || 1);
                setTotalItems(data.total || 0);
            }

            if (newPage) setPage(newPage);
        } catch (err) {
            console.error(err);
            setLogs([]); // Ensure logs is reset on error to avoid stale/bad state
        } finally {
            setLogsLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchLogs(1);
    };

    const handleClearLogs = async () => {
        try {
            await api.delete(`/api/v1/management/services/${serviceId}/logs`);
            fetchLogs(1);
            toast.success("Logs cleared successfully");
        } catch (err) {
            toast.error("Failed to clear logs");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!service) return <div>Service not found</div>;

    return (
        <div className="space-y-6 w-full max-w-[1800px] mx-auto p-4 md:p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/dashboard/developer/services" className="hover:text-foreground transition-colors">Services</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">{service.service_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{service.service_name}</h1>
                        <Badge variant={service.is_active ? "default" : "secondary"} className="text-sm px-2 py-0.5 rounded-full">
                            {service.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground max-w-2xl text-base">{service.description || "No description provided."}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => fetchLogs()} disabled={logsLoading}>
                        <RotateCw className={`h-4 w-4 mr-2 ${logsLoading ? "animate-spin" : ""}`} />
                        Refresh Data
                    </Button>
                </div>
            </div>

            {newKey && (
                <Alert variant="default" className="border-green-500 bg-green-50/50 text-green-900 shadow-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 font-semibold">Key Rotated Successfully</AlertTitle>
                    <AlertDescription className="mt-2">
                        <div className="flex items-center gap-2">
                            <code className="relative rounded bg-white px-3 py-2 font-mono text-sm font-medium border shadow-sm flex-1 break-all text-foreground">
                                {newKey}
                            </code>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-9 w-9 border shadow-sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(newKey);
                                }}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Stats & Logs (8 cols) */}
                <div className="xl:col-span-8 space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{service.usage_count.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">Lifetime API calls</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Last Activity</CardTitle>
                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold truncate text-sm md:text-xl">
                                    {service.last_used_at
                                        ? format(new Date(service.last_used_at), "MMM d, HH:mm")
                                        : "Never"}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {service.last_used_at ? "Latest request time" : "No requests yet"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                                <Check className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{service.is_active ? "Healthy" : "Disabled"}</div>
                                <p className="text-xs text-muted-foreground mt-1">Service is operational</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Logs Panel */}
                    <Card className="flex flex-col h-[700px] border shadow-sm">
                        <CardHeader className="border-b bg-muted/40 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Request History</CardTitle>
                                    <CardDescription>Real-time log of API interactions</CardDescription>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                            disabled={logs.length === 0}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Clear History
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Clear Request History</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to clear all logs for this service? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleClearLogs}>Clear History</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <div className="flex flex-col sm:flex-row w-full gap-2 pt-4 px-1">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search path..."
                                        className="pl-9 h-9 w-full bg-background"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    />
                                </div>
                                <Select value={methodFilter} onValueChange={(val) => { setMethodFilter(val); setPage(1); }}>
                                    <SelectTrigger className="w-[110px] h-9">
                                        <SelectValue placeholder="Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Method: All</SelectItem>
                                        <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                        <SelectItem value="PATCH">PATCH</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                                    <SelectTrigger className="w-[110px] h-9">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Status: All</SelectItem>
                                        <SelectItem value="200">200 OK</SelectItem>
                                        <SelectItem value="201">201 Created</SelectItem>
                                        <SelectItem value="204">204 No Content</SelectItem>
                                        <SelectItem value="400">400 Bad Req</SelectItem>
                                        <SelectItem value="401">401 Unauth</SelectItem>
                                        <SelectItem value="403">403 Forbidden</SelectItem>
                                        <SelectItem value="404">404 Not Found</SelectItem>
                                        <SelectItem value="500">500 Server Err</SelectItem>
                                        <SelectItem value="422">422 Validation</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button size="sm" onClick={handleSearch} disabled={logsLoading}>
                                    Search
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden relative">
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                    <div className="p-4 rounded-full bg-muted mb-4">
                                        <Eye className="h-8 w-8 opacity-50" />
                                    </div>
                                    <h3 className="font-semibold text-lg">No logs available</h3>
                                    <p className="max-w-xs mx-auto mt-2 text-sm">Make requests to the API using your Service Key to see them appear here.</p>
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium sticky top-0 backdrop-blur-sm z-10 shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3 min-w-[100px]">Status</th>
                                                <th className="px-4 py-3 min-w-[80px]">Method</th>
                                                <th className="px-4 py-3 w-full">Path</th>
                                                <th className="px-4 py-3 text-right">Duration</th>
                                                <th className="px-4 py-3 text-right min-w-[160px]">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {logs.map((log, index) => (
                                                <tr
                                                    key={log.id || `log-${index}`}
                                                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={log.response_status >= 400 ? "destructive" : "secondary"}
                                                            className={log.response_status < 400 ? "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200" : ""}
                                                        >
                                                            {log.response_status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-semibold text-xs text-muted-foreground group-hover:text-foreground">
                                                        {log.method}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-mono font-medium truncate max-w-[200px] sm:max-w-md" title={log.path}>{log.path}</span>
                                                            <span className="text-xs text-muted-foreground">{log.client_ip || "Unknown IP"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                                                        {log.duration_ms.toFixed(0)}ms
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground text-xs whitespace-nowrap">
                                                        {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                        <div className="border-t p-4 flex items-center justify-between bg-muted/10 text-xs text-muted-foreground">
                            <div>
                                Showing {logs.length > 0 ? (page - 1) * 20 + 1 : 0}-{Math.min(page * 20, totalItems)} of {totalItems} logs
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1 || logsLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="mx-2">Page {page} of {Math.max(1, totalPages)}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages || logsLoading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Configuration (4 cols) */}
                <div className="xl:col-span-4 space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Service settings and restrictions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => {
                                        setFormData({ ...formData, description: e.target.value });
                                        setHasChanges(true);
                                    }}
                                    placeholder="Describe the purpose of this service..."
                                    className="resize-none min-h-[100px]"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Allowed IPs</Label>
                                <IpInput
                                    value={formData.allowed_ips}
                                    onChange={(newIps) => {
                                        setFormData({ ...formData, allowed_ips: newIps });
                                        setHasChanges(true);
                                    }}
                                    placeholder="e.g. 203.0.113.1"
                                />
                                <p className="text-[10px] text-muted-foreground">Enter specific IP addresses or CIDR blocks to restrict access.</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Active Status</Label>
                                    <p className="text-xs text-muted-foreground">Enable or disable API access</p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => {
                                        setFormData({ ...formData, is_active: checked });
                                        setHasChanges(true);
                                    }}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-4 flex justify-end border-t">
                            <Button onClick={handleSave} disabled={!hasChanges || formLoading} className="w-full sm:w-auto">
                                {formLoading ? "Saving..." : "Save Configuration"}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-red-100 shadow-sm bg-red-50/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-red-600 font-semibold text-base flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-red-100"><Trash2 className="h-4 w-4 text-red-600" /></div>
                                Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border bg-background p-4 flex flex-col gap-3">
                                <div>
                                    <h4 className="font-medium text-sm">Rotate API Key</h4>
                                    <p className="text-xs text-muted-foreground">Invalidates the current key immediately.</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <RefreshCw className="mr-2 h-3 w-3" /> Rotate Key
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Rotate API Key</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to rotate the API key? The old key will stop working immediately and any services using it will be interrupted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleRotateKey}>Rotate Key</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 flex flex-col gap-3">
                                <div>
                                    <h4 className="font-medium text-sm text-red-900">Delete Service</h4>
                                    <p className="text-xs text-red-700/80">Permanently remove this service account.</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="w-full bg-red-600 hover:bg-red-700">
                                            Delete Service
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the service
                                                <strong> {service.service_name}</strong> and immediately revoke access.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                                Delete Service
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Log Details Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="flex items-center gap-3">
                            {selectedLog && (
                                <>
                                    <Badge
                                        variant={selectedLog.response_status >= 400 ? "destructive" : "secondary"}
                                        className={`text-base px-3 py-1 ${selectedLog.response_status < 400 ? "bg-green-100 text-green-700" : ""}`}
                                    >
                                        {selectedLog.response_status}
                                    </Badge>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-bold tracking-tight">{selectedLog.method} {selectedLog.path}</span>
                                        <span className="text-xs text-muted-foreground font-sans font-normal">
                                            {format(new Date(selectedLog.timestamp), "PPP pp")}
                                        </span>
                                    </div>
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/10">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-background shadow-sm">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Duration</h4>
                                    <p className="font-mono text-sm">{selectedLog.duration_ms.toFixed(2)}ms</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Client IP</h4>
                                    <p className="font-mono text-sm">{selectedLog.client_ip || "N/A"}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Service</h4>
                                    <p className="font-mono text-sm truncate" title={service.service_name}>{service.service_name}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Log ID</h4>
                                    <p className="font-mono text-xs truncate text-muted-foreground" title={selectedLog.id}>{selectedLog.id}</p>
                                </div>
                            </div>

                            {/* Request Section */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Request
                                </h4>
                                <div className="grid gap-4">
                                    {selectedLog.request_headers && Object.keys(selectedLog.request_headers).length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Headers</Label>
                                            <div className="bg-muted p-3 rounded-md border min-h-[60px] max-h-[200px] overflow-auto">
                                                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                                                    {JSON.stringify(selectedLog.request_headers, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Body</Label>
                                        <div className="bg-muted p-3 rounded-md border text-foreground">
                                            <pre className="text-xs font-mono overflow-auto max-h-[300px] whitespace-pre-wrap">
                                                {selectedLog.request_body
                                                    ? (typeof selectedLog.request_body === 'string' ? selectedLog.request_body : JSON.stringify(selectedLog.request_body, null, 2))
                                                    : <span className="text-muted-foreground italic">No content</span>}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Response Section */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2">
                                    <span className={`w-2 h-2 rounded-full ${selectedLog.response_status < 400 ? "bg-green-500" : "bg-red-500"}`}></span>
                                    Response
                                </h4>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Body</Label>
                                        <div className="bg-muted p-3 rounded-md border text-foreground">
                                            <pre className="text-xs font-mono overflow-auto max-h-[300px] whitespace-pre-wrap">
                                                {selectedLog.response_body
                                                    ? (typeof selectedLog.response_body === 'string' ? selectedLog.response_body : JSON.stringify(selectedLog.response_body, null, 2))
                                                    : <span className="text-muted-foreground italic">No content</span>}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
