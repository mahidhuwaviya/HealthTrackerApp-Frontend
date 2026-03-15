import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Lock, Trash2, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/utils/errorHandling";

interface AccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("overview");

    // Flow States
    const [passwordStep, setPasswordStep] = useState<"req" | "otp">("req");
    const [emailStep, setEmailStep] = useState<"req" | "otp" | "new">("req");

    // Auth Input States
    const [newUsername, setNewUsername] = useState("");
    const [otpStr, setOtpStr] = useState(["", "", "", "", "", ""]);
    const [newPasswordValue, setNewPasswordValue] = useState("");
    const [newEmailValue, setNewEmailValue] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    // Focus Refs
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otpStr];
        next[index] = value;
        setOtpStr(next);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otpStr[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // --- Action Handlers: Password ---
    const handleRequestPasswordOtp = async () => {
        if (!user?.email) return;
        setAuthLoading(true);
        try {
            await authApi.getOtp(user.email, "ForgotPassword");
            toast.success("OTP sent to your email!");
            setPasswordStep("otp");
        } catch (err: any) {
            toast.error(extractErrorMessage(err));
        } finally {
            setAuthLoading(false);
        }
    };

    const handleUpdatePasswordFinal = async () => {
        if (otpStr.join("").length < 6) return toast.error("Please enter the 6-digit OTP");
        if (newPasswordValue.length < 6) return toast.error("Password must be at least 6 characters");
        setAuthLoading(true);
        try {
            await authApi.updatePassword({ email: user!.email!, otp: otpStr.join(""), newPassword: newPasswordValue });
            toast.success("Password updated successfully!");
            resetFlows();
            setActiveTab("overview");
        } catch (err: any) {
            toast.error(extractErrorMessage(err));
        } finally {
            setAuthLoading(false);
        }
    };

    // --- Action Handlers: Email ---
    const handleRequestEmailOtp = async () => {
        if (!newEmailValue) return;
        setAuthLoading(true);
        try {
            // Send OTP to NEW email (since we are verifying they own it to switch)
            // Note: Backend might expect the old email here depending on implementation, but typically OTP goes to the new target.
            // Using the new email for getOtp explicitly.
            await authApi.getOtp(newEmailValue, "UpdateEmail");
            toast.success("Verification code sent to " + newEmailValue);
            setEmailStep("otp");
        } catch (err: any) {
            toast.error(extractErrorMessage(err));
        } finally {
            setAuthLoading(false);
        }
    };

    const handleVerifyAndUpdateEmail = async () => {
        const otpString = otpStr.join("");
        if (otpString.length < 6) return;
        setAuthLoading(true);
        try {
            // The backend endpoint UpdateEmail expects OldEmail query param, and Otp Verify Dto with new email & otp.
            await authApi.updateEmail({ email: newEmailValue, otp: otpString, newPassword: "" }, user!.email!);
            toast.success("Email successfully updated!");
            queryClient.invalidateQueries({ queryKey: ["user-session"] });
            resetFlows();
            setActiveTab("overview");
        } catch (err: any) {
            toast.error(extractErrorMessage(err));
        } finally {
            setAuthLoading(false);
        }
    };

    const resetFlows = () => {
        setOtpStr(["", "", "", "", "", ""]);
        setNewPasswordValue("");
        setNewEmailValue("");
        setPasswordStep("req");
        setEmailStep("req");
    };

    // Mutations
    const updateUsernameMutation = useMutation({
        mutationFn: (name: string) => authApi.updateUsername(name),
        onSuccess: () => {
            toast.success("Username updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["user-session"] });
            setNewUsername("");
        },
        onError: (error: any) => {
            toast.error(extractErrorMessage(error));
        }
    });

    const deleteAccountMutation = useMutation({
        mutationFn: () => authApi.deleteAccount(user?.email || ""),
        onSuccess: () => {
            toast.success("Account deleted permanently. Logged out.");
            logout();
            onClose();
        },
        onError: (error: any) => {
            toast.error(extractErrorMessage(error));
        }
    });

    // Helper: generic OTP render
    const renderOtpInputs = () => (
        <div className="flex gap-3 justify-center mb-6">
            {otpStr.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-12 h-12 text-center text-xl font-bold rounded-xl border border-white/20 bg-black/30 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
            ))}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetFlows();
            onClose();
        }}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden glass-card border-white/10">
                <div className="flex flex-col sm:flex-row h-[500px]">

                    {/* Sidebar Tabs */}
                    <Tabs value={activeTab} onValueChange={(val) => {
                        resetFlows();
                        setActiveTab(val);
                    }} className="flex flex-col sm:flex-row w-full h-full" orientation="vertical">
                        <div className="w-full sm:w-[200px] border-r border-white/5 bg-black/20 p-4 shrink-0 flex flex-col gap-2">
                            <DialogHeader className="mb-4 text-left">
                                <DialogTitle className="text-xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                                    Account
                                </DialogTitle>
                            </DialogHeader>

                            <TabsList className="flex flex-col h-auto bg-transparent items-start p-0 gap-1 w-full">
                                <TabsTrigger value="overview" className="w-full justify-start gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg">
                                    <User className="w-4 h-4" /> Overview
                                </TabsTrigger>
                                <TabsTrigger value="username" className="w-full justify-start gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg">
                                    <User className="w-4 h-4" /> Username
                                </TabsTrigger>
                                <TabsTrigger value="email" className="w-full justify-start gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg">
                                    <Mail className="w-4 h-4" /> Email
                                </TabsTrigger>
                                <TabsTrigger value="password" className="w-full justify-start gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg">
                                    <Lock className="w-4 h-4" /> Password
                                </TabsTrigger>
                                <div className="h-px bg-white/10 w-full my-2" />
                                <TabsTrigger value="danger" className="w-full justify-start gap-2 data-[state=active]:bg-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" /> Danger Zone
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 overflow-y-auto">

                            <TabsContent value="overview" className="mt-0 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">My Profile</h3>
                                    <p className="text-sm text-muted-foreground mb-6">Manage your core account details and secure your data.</p>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col">
                                            <span className="text-sm text-muted-foreground font-medium mb-1">Current Username</span>
                                            <span className="text-lg font-semibold">{user?.name || "N/A"}</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col">
                                            <span className="text-sm text-muted-foreground font-medium mb-1">Primary Email</span>
                                            <span className="text-lg font-semibold">{user?.email || "N/A"}</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col">
                                            <span className="text-sm text-muted-foreground font-medium mb-1">Account Role</span>
                                            <span className="text-sm font-semibold capitalize inline-flex items-center gap-2">
                                                {user?.role?.replace("ROLE_", "") || "USER"}
                                                {user?.role === "ROLE_ADMIN" && <ShieldCheck className="w-4 h-4 text-primary" />}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="username" className="mt-0 space-y-6 animate-in fade-in-50 zoom-in-95">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Update Username</h3>
                                    <p className="text-sm text-muted-foreground mb-6">Choose a new display name. This is how others will see you.</p>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">New Username</label>
                                            <input
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                                                placeholder="e.g. FitHero99"
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
                                            onClick={() => updateUsernameMutation.mutate(newUsername)}
                                            disabled={!newUsername || newUsername === user?.name || updateUsernameMutation.isPending}
                                        >
                                            {updateUsernameMutation.isPending ? "Updating..." : "Save Username"}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="email" className="mt-0 animate-in fade-in-50">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Update Email</h3>
                                    <p className="text-sm text-muted-foreground mb-6">Transfer your account to a new email address. Requires Verification.</p>

                                    {emailStep === "req" && (
                                        <div className="space-y-4 animate-in slide-in-from-right-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">New Email Address</label>
                                                <input
                                                    type="email"
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                                                    placeholder="new@example.com"
                                                    value={newEmailValue}
                                                    onChange={(e) => setNewEmailValue(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={handleRequestEmailOtp}
                                                disabled={!newEmailValue || !newEmailValue.includes("@") || authLoading}
                                            >
                                                {authLoading ? "Sending..." : "Send Verification Code"}
                                            </Button>
                                        </div>
                                    )}

                                    {emailStep === "otp" && (
                                        <div className="space-y-4 animate-in slide-in-from-right-4 text-center">
                                            <p className="text-sm mb-4">Enter the 6-digit code sent to <br /><span className="font-semibold">{newEmailValue}</span></p>
                                            {renderOtpInputs()}
                                            <Button
                                                className="w-full"
                                                onClick={handleVerifyAndUpdateEmail}
                                                disabled={otpStr.join("").length < 4 || authLoading}
                                            >
                                                {authLoading ? "Verifying..." : "Verify & Update Email"}
                                            </Button>
                                            <button onClick={() => setEmailStep("req")} className="text-sm text-primary hover:underline mt-2">Go Back</button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="password" className="mt-0 animate-in fade-in-50">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Security</h3>
                                    <p className="text-sm text-muted-foreground mb-6">Reset your password via Email OTP securely.</p>

                                    {passwordStep === "req" && (
                                        <div className="space-y-4 animate-in slide-in-from-right-4">
                                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-center gap-2 mb-4">
                                                <Mail className="w-8 h-8 text-primary" />
                                                <p className="text-sm font-medium px-4">We will send a one-time 6-digit code to your registered email: <strong>{user?.email}</strong></p>
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={handleRequestPasswordOtp}
                                                disabled={authLoading}
                                            >
                                                {authLoading ? "Sending Code..." : "Send OTP"}
                                            </Button>
                                        </div>
                                    )}

                                    {passwordStep === "otp" && (
                                        <div className="space-y-4 animate-in slide-in-from-right-4 text-center">
                                            <p className="text-sm mb-4">Enter the 6-digit verification code</p>
                                            {renderOtpInputs()}
                                            <div className="space-y-2 text-left">
                                                <label className="text-sm font-medium">Enter New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                                                    placeholder="••••••••"
                                                    value={newPasswordValue}
                                                    onChange={(e) => setNewPasswordValue(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={handleUpdatePasswordFinal}
                                                disabled={otpStr.join("").length < 6 || newPasswordValue.length < 6 || authLoading}
                                            >
                                                {authLoading ? "Updating..." : "Update Password"}
                                            </Button>
                                            <button onClick={() => setPasswordStep("req")} className="text-sm text-primary hover:underline mt-2">Resend Code</button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="danger" className="mt-0 animate-in fade-in-50 zoom-in-95">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-destructive flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Danger Zone
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-6">Permanently remove your personal account and all associated health data.</p>

                                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-4">
                                        <p className="text-sm text-destructive font-medium">
                                            This action is absolutely irreversible. Once deleted, your meals, workouts, and track history cannot be recovered.
                                        </p>
                                        <Button
                                            variant="destructive"
                                            className="w-full font-bold shadow-lg shadow-destructive/20"
                                            onClick={() => {
                                                if (window.confirm("CRITICAL WARNING: This cannot be undone. Are you absolutely sure you want to delete your account?")) {
                                                    deleteAccountMutation.mutate();
                                                }
                                            }}
                                            disabled={deleteAccountMutation.isPending}
                                        >
                                            {deleteAccountMutation.isPending ? "Deleting..." : "Permanently Delete Account"}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
