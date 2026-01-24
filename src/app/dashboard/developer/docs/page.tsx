"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Shield, Key, AlertCircle, Download } from "lucide-react";

export default function DocsPage() {
    const handleDownload = () => {
        const mdContent = `# Service Integration Guide

Complete reference for integrating your applications with DSAT Auth Server.

## Authentication

### API Keys
Authenticate your service-to-service calls using your secret API Key. All API requests must include your API Key in the \`X-API-Key\` header.

**Example Request:**
\`\`\`bash
curl -X POST https://auth.dsatschool.com/api/v1/service/users \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_SECRET_KEY" \\
  -d '{
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "password": "secure_password",
    "role": "student"
  }'
\`\`\`

### IP Whitelisting
Restrict access to specific IPv4 addresses for additional security.

## API Reference

### POST /users
Create or synchronize a user from your system.
**Payload:**
- email (string, required)
- full_name (string, required)
- phone (string, required)
- password (string, required)
- role (string, required)

**Response (201 Created):**
\`\`\`json
{
  "id": "65b1...",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "student",
  "google_id": null,
  "discord_id": null,
  "profile_image": null,
  "is_active": true,
  "is_superuser": false,
  "is_email_verified": false,
  "is_phone_verified": false,
  "last_active": null,
  "created_at": "2024-01-25T12:00:00Z"
}
\`\`\`

### GET /users/exists
Check if a user matches an email or phone number.
**Query Parameters:**
- email (string, optional)
- phone (string, optional)

**Response (200 OK):**
\`\`\`json
{
  "exists": true,
  "uuid": "65b1...",
  "email": "user@example.com",
  "full_name": "John Doe"
}
\`\`\`

### GET /users/{id}
Retrieve the complete profile information for a user.

**Response (200 OK):**
\`\`\`json
{
  "id": "65b1...",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "student",
  "google_id": "google-oauth-id",
  "discord_id": "discord-oauth-id",
  "profile_image": "https://...",
  "is_active": true,
  "is_superuser": false,
  "is_email_verified": true,
  "is_phone_verified": true,
  "last_active": "2024-01-25T12:05:00Z",
  "created_at": "2024-01-25T12:00:00Z"
}
\`\`\`

## Error Handling
- 401: Unauthorized (Invalid Key)
- 403: Forbidden (IP Not Allowed)
- 409: Conflict (Email or Phone already exists)
`;
        const blob = new Blob([mdContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "DSAT_Service_Integration_Guide.md";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Service Integration Guide</h1>
                    <p className="text-muted-foreground">
                        Complete reference for integrating your applications with DSAT Auth Server.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download .md
                </Button>
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
                                    &nbsp;&nbsp;"phone": "+1234567890",<br />
                                    &nbsp;&nbsp;"password": "secure_password",<br />
                                    &nbsp;&nbsp;"role": "student"<br />
                                    {"}"}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Response (201 Created):</p>
                                <div className="bg-muted p-2 rounded text-xs font-mono">
                                    {"{"}<br />
                                    &nbsp;&nbsp;"id": "uuid-string",<br />
                                    &nbsp;&nbsp;"email": "user@example.com",<br />
                                    &nbsp;&nbsp;"full_name": "John Doe",<br />
                                    &nbsp;&nbsp;"phone": "+1234567890",<br />
                                    &nbsp;&nbsp;"role": "student",<br />
                                    &nbsp;&nbsp;"is_active": true,<br />
                                    &nbsp;&nbsp;"is_superuser": false,<br />
                                    &nbsp;&nbsp;"is_email_verified": false,<br />
                                    &nbsp;&nbsp;"is_phone_verified": false,<br />
                                    &nbsp;&nbsp;"created_at": "timestamp"<br />
                                    {"}"}
                                </div>
                            </div>

                            <div className="space-y-2 border-b pb-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">GET</span>
                                    /users/exists
                                </h3>
                                <p className="text-sm text-muted-foreground">Check if a user is already registered. Provide at least one parameter.</p>
                                <div className="bg-muted p-2 rounded text-xs font-mono">
                                    ?email=user@example.com<br />
                                    ?phone=+1234567890
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Response (200 OK):</p>
                                <div className="bg-muted p-2 rounded text-xs font-mono">
                                    {"{"}<br />
                                    &nbsp;&nbsp;"exists": true,<br />
                                    &nbsp;&nbsp;"uuid": "user-id",<br />
                                    &nbsp;&nbsp;"email": "user@email.com",<br />
                                    &nbsp;&nbsp;"full_name": "John Doe"<br />
                                    {"}"}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">GET</span>
                                    /users/{"{id}"}
                                </h3>
                                <p className="text-sm text-muted-foreground">Retrieve the complete profile information for a user.</p>
                                <p className="text-sm text-muted-foreground mt-2">Response (200 OK):</p>
                                <div className="bg-muted p-2 rounded text-xs font-mono">
                                    {"{"}<br />
                                    &nbsp;&nbsp;"id": "user-id",<br />
                                    &nbsp;&nbsp;"email": "user@email.com",<br />
                                    &nbsp;&nbsp;"full_name": "John Doe",<br />
                                    &nbsp;&nbsp;"phone": "+1234567890",<br />
                                    &nbsp;&nbsp;"role": "student",<br />
                                    &nbsp;&nbsp;"google_id": "google-id",<br />
                                    &nbsp;&nbsp;"discord_id": "discord-id",<br />
                                    &nbsp;&nbsp;"profile_image": "url",<br />
                                    &nbsp;&nbsp;"is_active": true,<br />
                                    &nbsp;&nbsp;"is_superuser": false,<br />
                                    &nbsp;&nbsp;"is_email_verified": true,<br />
                                    &nbsp;&nbsp;"is_phone_verified": true,<br />
                                    &nbsp;&nbsp;"last_active": "timestamp",<br />
                                    &nbsp;&nbsp;"created_at": "timestamp"<br />
                                    {"}"}
                                </div>
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
