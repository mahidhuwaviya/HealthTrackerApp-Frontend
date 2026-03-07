import { adminApi, AdminUser } from "@/api/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ShieldAlert, RefreshCcw, Mail, Crown, User as UserIcon, Calendar, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AdminUserDetailsModal } from "./modals/AdminUserDetailsModal";

export function AdminView() {
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const queryClient = useQueryClient();

    const { data: users, isLoading, isError, refetch } = useQuery<AdminUser[], Error>({
        queryKey: ["adminUsers"],
        queryFn: () => adminApi.getAllUsers(),
        retry: false,
        refetchOnWindowFocus: false,
    });

    const deleteMutation = useMutation({
        mutationFn: (email: string) => adminApi.deleteUser(email),
        onSuccess: (data, email) => {
            toast.success("User deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
            // Close modal if the deleted user is currently open
            if (selectedUser?.email === email) {
                setSelectedUser(null);
            }
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || err.response?.data || "Failed to delete user";
            toast.error(typeof message === 'string' ? message : "Failed to delete user");
        }
    });

    const handleDelete = (e: React.MouseEvent, email: string, name: string) => {
        e.stopPropagation(); // prevent row click
        if (window.confirm(`Are you sure you want to completely delete ${name}'s account? This action cannot be undone.`)) {
            deleteMutation.mutate(email);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] animate-in fade-in duration-500">
                <RefreshCcw className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading user database...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] bg-destructive/5 rounded-2xl border border-destructive/20 animate-in zoom-in-95 duration-500">
                <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-destructive mb-2">Access Denied or Error Fetching</h3>
                <p className="text-muted-foreground mb-6">We couldn't retrieve the user list. Please ensure you have Admin privileges.</p>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-2 bg-background border border-border shadow-sm rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 font-medium"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-3xl font-bold mt-1 text-foreground">{users?.length || 0}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <UserIcon className="w-6 h-6" />
                    </div>
                </div>
                
                <div className="glass-card p-6 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                        <p className="text-3xl font-bold mt-1 text-foreground">
                            {users?.filter((u) => u.role === "ROLE_ADMIN").length || 0}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Crown className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Users Table Card */}
            <div className="glass-card border border-primary/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-primary/5 flexitems-center justify-between bg-secondary/30">
                    <div>
                        <h2 className="text-xl font-bold font-instrument">User Directory</h2>
                        <p className="text-sm text-muted-foreground">Manage and view all registered accounts in the system.</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground border-b border-primary/5">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">User Profile</th>
                                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">User ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Role</th>
                                <th scope="col" className="px-6 py-4 font-semibold hidden sm:table-cell">Joined</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {users?.map((u) => (
                                <tr 
                                    key={u.userId} 
                                    onClick={() => setSelectedUser(u)}
                                    className="hover:bg-primary/5 transition-colors duration-200 cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 border border-primary/10">
                                                <span className="font-bold text-primary text-sm">
                                                    {u.userName ? u.userName.slice(0, 2).toUpperCase() : "U"}
                                                </span>
                                            </div>
                                            <div className="flex flex-col max-w-[150px] sm:max-w-[250px]">
                                                <span className="font-semibold text-foreground truncate">{u.userName}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                                    <Mail className="w-3 h-3 shrink-0" />
                                                    {u.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="font-mono text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                            {u.userId.split("-")[0]}...
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            u.role === "ROLE_ADMIN" 
                                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                                                : "bg-primary/10 text-primary border-primary/20"
                                        }`}>
                                            {u.role === "ROLE_ADMIN" ? (
                                                <><Crown className="w-3 h-3 mr-1" /> Admin</>
                                            ) : (
                                                <><UserIcon className="w-3 h-3 mr-1" /> User</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>
                                                {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "Unknown"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => handleDelete(e, u.email, u.userName)}
                                            disabled={deleteMutation.isPending && deleteMutation.variables === u.email}
                                            className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors group-hover:opacity-100 opacity-70"
                                            title="Delete User"
                                        >
                                            {deleteMutation.isPending && deleteMutation.variables === u.email ? (
                                                <RefreshCcw className="w-4 h-4 animate-spin text-destructive" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!users || users.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminUserDetailsModal 
                user={selectedUser} 
                open={!!selectedUser} 
                onOpenChange={(open) => !open && setSelectedUser(null)} 
            />
        </div>
    );
}

