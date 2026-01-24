"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Shield, Key, AlertCircle } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Service Integration Guide</h1>
                <p className="text-muted-foreground">
                    Complete reference for integrating your applications with DSAT Auth Server.
                </p>
            </div>

            <Tabs defaultValue="authentication" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="authentication">Authentication</TabsTrigger>
                    <TabsTrigger value="endpoints">API Reference</TabsTrigger>
                    <TabsTrigger value="errors">Error Handling</TabsTrigger>
                </TabsList>

                <TabsContent value="authentication" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                API Keys
                            </CardTitle>
                            <CardDescription>
                                Authenticate your service-to-service calls using your secret API Key.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                All API requests must include your API Key in the <code className="bg-muted px-1 rounded">X-API-Key</code> header.
                                You can generate and manage these keys in the <strong className="text-primary">Service Accounts</strong> section.
                            </p>

                            <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm">
                                <span className="text-slate-400"># Example Request</span><br />
                                curl -X POST https://auth.dsatschool.com/api/v1/service/users \<br />
                                &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                                &nbsp;&nbsp;-H "X-API-Key: <span className="text-green-400">YOUR_SECRET_KEY</span>" \<br />
                                &nbsp;&nbsp;-d '{"{"}"email": "user@example.com", ...{"}"}'
                            </div>

                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertTitle>Security Best Practice</AlertTitle>
                                <AlertDescription>
                                    Never expose your API Key in client-side code (browsers, mobile apps).
                                    These keys are intended for backend-to-backend communication only.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                IP Whitelisting
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                For additional security, you can restrict access to specific IPv4 addresses.
                                Any request from an unauthorized IP will be rejected immediately, even with a valid API Key.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                <li>Configure allowed IPs in the Service Settings.</li>
                                <li>Use <code className="bg-muted px-1 rounded">*</code> to allow all IPs (development only).</li>
                                <li>Updates to IP lists take effect immediately.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="endpoints" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Core Endpoints</CardTitle>
                            <CardDescription>Base URL: <code className="bg-muted px-1 rounded">/api/v1/service</code></CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2 border-b pb-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">POST</span>
                                    /users
                                </h3>
                                <p className="text-sm text-muted-foreground">Create or synchronize a user from your system.</p>
                                <div className="bg-muted p-2 rounded text-xs font-mono">
                                    {"{"}<br />
                                    &nbsp;&nbsp;"email": "user@example.com",<br />
                                    &nbsp;&nbsp;"full_name": "John Doe",<br />
                                    &nbsp;&nbsp;"role": "student" // optional<br />
                                    {"}"}
                                </div>
                            </div>

                            <div className="space-y-2 border-b pb-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">GET</span>
                                    /users/{"{email}"}/exists
                                </h3>
                                <p className="text-sm text-muted-foreground">Check if a user is already registered in the Auth Server.</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">GET</span>
                                    /users/{"{id}"}
                                </h3>
                                <p className="text-sm text-muted-foreground">Retrieve public profile details for a user.</p>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="errors" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Error Codes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-12 text-sm border-b pb-2 font-medium">
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-10">Description</div>
                                </div>
                                <div className="grid grid-cols-12 text-sm border-b py-2">
                                    <div className="col-span-2 font-mono text-red-600">401</div>
                                    <div className="col-span-10">
                                        <strong>Unauthorized</strong>. Missing or invalid <code className="text-xs bg-muted px-1">X-API-Key</code> header.
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 text-sm border-b py-2">
                                    <div className="col-span-2 font-mono text-red-600">403</div>
                                    <div className="col-span-10">
                                        <strong>Forbidden</strong>. Key is valid but IP address is not allowed.
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 text-sm py-2">
                                    <div className="col-span-2 font-mono text-amber-600">429</div>
                                    <div className="col-span-10">
                                        <strong>Too Many Requests</strong>. Rate limit exceeded (if configured).
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
