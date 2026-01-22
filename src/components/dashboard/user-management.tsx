"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle2, AlertCircle, Loader2, MoreVertical,
    Trash2, Edit, UserPlus, Users, ShieldAlert, Activity
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { UserData, UserStats } from "@/types";

export function UserManagementView() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // To force refresh

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    // Edit State
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Delete State
    const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("accessToken");
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Stats
                const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/stats`, { headers });
                if (statsRes.ok) setStats(await statsRes.json());

                // Fetch dynamic roles
                const rolesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/roles`, { headers });
                if (rolesRes.ok) setAvailableRoles(await rolesRes.json());

                // Build query params
                const params = new URLSearchParams();
                params.append("skip", ((page - 1) * limit).toString());
                params.append("limit", limit.toString());
                if (searchQuery) params.append("search", searchQuery);
                if (roleFilter !== "all") params.append("role", roleFilter);
                if (statusFilter !== "all") params.append("is_active", statusFilter === "active" ? "true" : "false");

                // Fetch Users with Pagination & Filters
                const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users?${params.toString()}`, { headers });

                if (usersRes.ok) {
                    const data = await usersRes.json();
                    if (data.items) {
                        console.log("Fetched users with items:", data.items);
                        setUsers(data.items);
                        setTotal(data.total);
                    } else {
                        setUsers(data);
                        setTotal(data.length);
                    }
                } else {
                    toast.error("Failed to fetch users");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error loading data");
            } finally {
                setLoading(false);
            }
        };
        // Debounce search could be added here, but for now rely on effect dependency
        const timeoutId = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(timeoutId);
    }, [page, limit, refreshTrigger, searchQuery, roleFilter, statusFilter]);

    const handleExport = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch all matching users for export (adjust limit if needed or implement backend specific export)
            // For simplicity, fetching a large limit here.

            // Build query params
            const params = new URLSearchParams();
            params.append("skip", "0");
            params.append("limit", "10000"); // Large limit for export
            if (searchQuery) params.append("search", searchQuery);
            if (roleFilter !== "all") params.append("role", roleFilter);
            if (statusFilter !== "all") params.append("is_active", statusFilter === "active" ? "true" : "false");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users?${params.toString()}`, { headers });

            if (!res.ok) throw new Error("Failed to fetch data export");

            const data = await res.json();
            const items = data.items || data;

            // Convert to CSV
            const csvRows = [];
            const headersRow = ["ID", "Full Name", "Email", "Role", "Status", "Joined At"];
            csvRows.push(headersRow.join(","));

            for (const row of items) {
                csvRows.push([
                    row.id,
                    `"${row.full_name || ''}"`, // Quote to handle commas in names
                    row.email,
                    row.role,
                    row.is_active ? "Active" : "Inactive",
                    row.created_at
                ].join(","));
            }

            const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.setAttribute("hidden", "");
            a.setAttribute("href", url);
            a.setAttribute("download", "users_export.csv");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("Export downloaded");

        } catch (error) {
            toast.error("Export failed");
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${editingUser.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    full_name: editingUser.full_name,
                    role: editingUser.role,
                    is_active: editingUser.is_active,
                    phone: editingUser.phone
                }),
            });

            if (res.ok) {
                toast.success("User updated successfully");
                setIsEditOpen(false);
                setRefreshTrigger(prev => prev + 1);
            } else {
                toast.error("Failed to update user");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;
        
        // Use _id as fallback for id
        const userId = (deletingUser as any).id || (deletingUser as any)._id;
        
        if (!userId) {
            toast.error("Invalid user ID");
            return;
        }
        
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (res.ok) {
                toast.success("User deleted successfully");
                setIsDeleteOpen(false);
                setDeletingUser(null);
                setRefreshTrigger(prev => prev + 1);
            } else {
                const error = await res.json();
                toast.error(error.detail || "Failed to delete user");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                            <p className="text-xs text-muted-foreground">All registered accounts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_users}</div>
                            <p className="text-xs text-muted-foreground">Currently active accounts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New (24h)</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.new_users_24h}</div>
                            <p className="text-xs text-muted-foreground">Joined in last 24 hours</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Admins</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.admins}</div>
                            <p className="text-xs text-muted-foreground">Superuser accounts</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Users Directory</CardTitle>
                            <CardDescription>
                                Manage system users, update roles, and view status.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Button variant="outline" size="sm" onClick={handleExport}>
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {availableRoles.map(role => (
                                    <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : users.map((u) => (
                                <TableRow key={u.id || u.email}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={u.profile_image} referrerPolicy="no-referrer" />
                                            <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{u.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{u.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={(u.role === "developer" || u.is_superuser) ? "default" : "secondary"}>
                                            {u.role || (u.is_superuser ? "admin" : "user")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {u.is_active ?
                                            <div className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle2 className="h-3 w-3" /> Active</div> :
                                            <div className="flex items-center gap-1 text-xs text-red-600 font-medium"><AlertCircle className="h-3 w-3" /> Inactive</div>
                                        }
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => {
                                                    setEditingUser(u);
                                                    setIsEditOpen(true);
                                                }}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                                                    setDeletingUser(u);
                                                    setIsDeleteOpen(true);
                                                }}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <div className="px-4 text-sm font-medium">Page {page} of {totalPages || 1}</div>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Make changes to user profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleUpdateUser} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="full_name" className="text-right">Name</Label>
                                <Input
                                    id="full_name"
                                    value={editingUser.full_name}
                                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Role</Label>
                                <Select
                                    value={editingUser.role}
                                    onValueChange={(val) => setEditingUser({ ...editingUser, role: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                <Select
                                    value={editingUser.is_active ? "active" : "inactive"}
                                    onValueChange={(val) => setEditingUser({ ...editingUser, is_active: val === "active" })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete User Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteUser}>
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
