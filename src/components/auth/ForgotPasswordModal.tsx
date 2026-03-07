import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
    Mail, KeyRound, Lock, Eye, EyeOff, X,
    ArrowRight, ShieldCheck, RefreshCw, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, OtpVerifyDto } from "@/api/auth";
import { AUTH_VALIDATION } from "@/config/health-constants";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
type Step = "email" | "otp" | "password" | "success";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
const OTP_SECONDS = 300; // 5 minutes

function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

/** Read a cookie value by name from document.cookie */
function getCookie(name: string): string {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : "";
}

/** Check whether an accessToken cookie exists */
function hasAccessToken(): boolean {
    return getCookie("accessToken") !== "";
}

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export const ForgotPasswordModal = ({ isOpen, onClose }: Props) => {
    const [, setLocation] = useLocation();

    // ── Shared state ──────────────────────────────────────
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── OTP step ──────────────────────────────────────────
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(OTP_SECONDS);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Password step ─────────────────────────────────────
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    /* ── Reset everything when modal closes / reopens ── */
    const resetAll = useCallback(() => {
        setStep("email");
        setEmail("");
        setOtp(["", "", "", ""]);
        setTimeLeft(OTP_SECONDS);
        setNewPassword("");
        setShowPassword(false);
        setError(null);
        setIsLoading(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (!isOpen) resetAll();
    }, [isOpen, resetAll]);

    /* ── Countdown timer (starts when entering OTP step) ── */
    useEffect(() => {
        if (step !== "otp") return;

        setTimeLeft(OTP_SECONDS);
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [step]);

    /* ── Guard: don't render if closed ── */
    if (!isOpen) return null;

    /* ─────────────────────────────────────────────────────
       Handlers
    ───────────────────────────────────────────────────── */

    // Step 0 → 1: Send OTP
    // The backend sets OtpVerifyToken as a cookie on this response.
    // axios sends it back automatically on every subsequent request via withCredentials:true.
    const handleSendOtp = async () => {
        setError(null);
        if (!AUTH_VALIDATION.EMAIL_REGEX.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setIsLoading(true);
        try {
            await authApi.getOtp(email, "ForgotPassword");
            // Cookie is now set by backend — browser will include it automatically going forward.
            setStep("otp");
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                "Failed to send OTP. Please check your email and try again.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };


    // Step 1 → 2: Verify OTP
    // OtpVerifyToken is sent automatically as a cookie (withCredentials:true).
    const handleVerifyOtp = async () => {
        setError(null);
        const otpString = otp.join("");
        if (otpString.length < 4) {
            setError("Please enter all 4 digits of your OTP.");
            return;
        }
        if (timeLeft === 0) {
            setError("Your OTP has expired. Please request a new one.");
            return;
        }
        setIsLoading(true);
        try {
            const dto: OtpVerifyDto = {
                email,
                otp: otpString,
                newPassword: "",
                // verificationToken is NOT sent in the body — the browser
                // automatically includes the OtpVerifyToken cookie in the
                // request headers via withCredentials:true.
            };
            await authApi.verifyOtp(dto, "ForgotPassword");
            setStep("password");
        } catch (err: any) {
            const serverMsg: string = err.response?.data?.message || "";
            const lowerMsg = serverMsg.toLowerCase();
            if (lowerMsg.includes("expir")) {
                setError("OTP has expired. Please go back and request a new one.");
            } else if (
                lowerMsg.includes("invalid") ||
                lowerMsg.includes("incorrect") ||
                lowerMsg.includes("wrong")
            ) {
                setError("Invalid code. Please double-check and try again.");
            } else {
                setError(serverMsg || "Verification failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2 → success: Update password
    // OtpVerifyToken is sent automatically as a cookie (withCredentials:true).
    const handleUpdatePassword = async () => {
        setError(null);
        if (newPassword.length < AUTH_VALIDATION.MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${AUTH_VALIDATION.MIN_PASSWORD_LENGTH} characters.`);
            return;
        }
        setIsLoading(true);
        try {
            const dto: OtpVerifyDto = {
                email,
                otp: otp.join(""),
                newPassword,
                // verificationToken is NOT sent in the body — the browser
                // automatically includes the OtpVerifyToken cookie in the
                // request headers via withCredentials:true.
            };
            await authApi.updatePassword(dto);
            setStep("success");
            setTimeout(() => {
                onClose();
                if (hasAccessToken()) {
                    setLocation("/dashboard");
                } else {
                    setLocation("/login");
                }
            }, 2200);
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                "Failed to update password. Please try again.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    /* ─────────────────────────────────────────────────────
       OTP input sub-component helpers
    ───────────────────────────────────────────────────── */
    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return; // digits only
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 3) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        if (!pasted) return;
        const next = ["", "", "", ""];
        pasted.split("").forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        otpRefs.current[Math.min(pasted.length, 3)]?.focus();
    };

    /* ─────────────────────────────────────────────────────
       Derived UI values
    ───────────────────────────────────────────────────── */
    const isEmailValid = AUTH_VALIDATION.EMAIL_REGEX.test(email);
    const isOtpComplete = otp.every((d) => d !== "");
    const isPasswordValid = newPassword.length >= AUTH_VALIDATION.MIN_PASSWORD_LENGTH;
    const isTimerRed = timeLeft > 0 && timeLeft <= 60;
    const isTimerExpired = timeLeft === 0;

    /* ─────────────────────────────────────────────────────
       Step metadata (for progress indicator)
    ───────────────────────────────────────────────────── */
    const steps: { key: Step; label: string }[] = [
        { key: "email", label: "Email" },
        { key: "otp", label: "Verify OTP" },
        { key: "password", label: "New Password" },
    ];
    const stepIndex = steps.findIndex((s) => s.key === step);

    /* ─────────────────────────────────────────────────────
       Render
    ───────────────────────────────────────────────────── */
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={step !== "success" ? onClose : undefined}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="glass-card border border-primary/20 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">

                    {/* Close button */}
                    {step !== "success" && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary/50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* ── Progress steps (not shown on success) ── */}
                    {step !== "success" && (
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {steps.map((s, i) => (
                                <div key={s.key} className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < stepIndex
                                                ? "bg-primary text-primary-foreground"
                                                : i === stepIndex
                                                    ? "bg-primary/20 text-primary border-2 border-primary"
                                                    : "bg-secondary text-muted-foreground"
                                                }`}
                                        >
                                            {i < stepIndex ? "✓" : i + 1}
                                        </div>
                                        <span
                                            className={`text-xs font-medium hidden sm:block ${i === stepIndex ? "text-foreground" : "text-muted-foreground"
                                                }`}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div
                                            className={`h-0.5 w-8 rounded-full transition-all duration-500 ${i < stepIndex ? "bg-primary" : "bg-secondary"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                        STEP: EMAIL
                    ═══════════════════════════════════════ */}
                    {step === "email" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Forgot Password?</h2>
                                <p className="text-muted-foreground text-sm">
                                    Enter your email and we'll send a one-time code to reset your password.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fp-email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="fp-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                        onKeyDown={(e) => e.key === "Enter" && isEmailValid && handleSendOtp()}
                                        className="pl-12 py-6 bg-secondary/50 border-primary/10 focus:border-primary/50"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                                    <span className="mt-0.5">⚠</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleSendOtp}
                                disabled={!isEmailValid || isLoading}
                                className={`w-full py-6 text-base font-semibold transition-all duration-300 ${!isEmailValid
                                    ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow"
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Sending OTP…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Send OTP
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                        STEP: OTP VERIFICATION
                    ═══════════════════════════════════════ */}
                    {step === "otp" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <KeyRound className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Enter OTP</h2>
                                <p className="text-muted-foreground text-sm">
                                    We sent a 4-digit code to{" "}
                                    <span className="text-foreground font-medium break-all">{email}</span>
                                </p>
                            </div>

                            {/* Countdown banner */}
                            <div
                                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium border transition-colors duration-500 ${isTimerExpired
                                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                                    : isTimerRed
                                        ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                                        : "bg-primary/5 border-primary/20 text-primary"
                                    }`}
                            >
                                <span>
                                    {isTimerExpired
                                        ? "OTP expired — request a new one"
                                        : "OTP expires in 5 minutes. Please update your password before time runs out."}
                                </span>
                                <span className="font-mono text-base ml-3 tabular-nums shrink-0">
                                    {isTimerExpired ? "00:00" : formatTime(timeLeft)}
                                </span>
                            </div>

                            {/* 4-digit OTP inputs */}
                            <div className="space-y-2">
                                <Label>OTP Code</Label>
                                <div className="flex gap-3 justify-center">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target.value, i)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, i)}
                                            onPaste={i === 0 ? handleOtpPaste : undefined}
                                            className="w-16 h-16 text-center text-2xl font-bold rounded-xl border-2 border-primary/20 bg-secondary/50 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 caret-primary"
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                                    <span className="mt-0.5">⚠</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleVerifyOtp}
                                disabled={!isOtpComplete || isLoading || isTimerExpired}
                                className={`w-full py-6 text-base font-semibold transition-all duration-300 ${!isOtpComplete || isTimerExpired
                                    ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow"
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Verifying…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5" />
                                        Verify OTP
                                    </span>
                                )}
                            </Button>

                            {/* Resend link */}
                            <p className="text-center text-sm text-muted-foreground">
                                Didn't receive the code?{" "}
                                <button
                                    onClick={() => {
                                        setOtp(["", "", "", ""]);
                                        setError(null);
                                        setStep("email");
                                    }}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Go back & resend
                                </button>
                            </p>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                        STEP: NEW PASSWORD
                    ═══════════════════════════════════════ */}
                    {step === "password" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Lock className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Set New Password</h2>
                                <p className="text-muted-foreground text-sm">
                                    OTP verified! Now create a strong new password for your account.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fp-new-password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="fp-new-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                                        onKeyDown={(e) => e.key === "Enter" && isPasswordValid && handleUpdatePassword()}
                                        className="pl-12 pr-12 py-6 bg-secondary/50 border-primary/10 focus:border-primary/50"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Strength hint */}
                                <div className="flex items-center gap-3 mt-2">
                                    <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${newPassword.length === 0
                                        ? "bg-secondary"
                                        : newPassword.length < 6
                                            ? "bg-destructive"
                                            : newPassword.length < 10
                                                ? "bg-orange-400"
                                                : "bg-emerald-500"
                                        }`} />
                                    <span className={`text-xs font-medium transition-colors duration-300 ${newPassword.length === 0
                                        ? "text-muted-foreground"
                                        : newPassword.length < 6
                                            ? "text-destructive"
                                            : newPassword.length < 10
                                                ? "text-orange-400"
                                                : "text-emerald-500"
                                        }`}>
                                        {newPassword.length === 0
                                            ? "Password must be 6 or more characters"
                                            : newPassword.length < 6
                                                ? `${6 - newPassword.length} more character${6 - newPassword.length !== 1 ? "s" : ""} needed`
                                                : newPassword.length < 10
                                                    ? "Good"
                                                    : "Strong ✓"}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                                    <span className="mt-0.5">⚠</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleUpdatePassword}
                                disabled={!isPasswordValid || isLoading}
                                className={`w-full py-6 text-base font-semibold transition-all duration-300 ${!isPasswordValid
                                    ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow"
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Updating…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Lock className="w-5 h-5" />
                                        Update Password
                                    </span>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                        STEP: SUCCESS
                    ═══════════════════════════════════════ */}
                    {step === "success" && (
                        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500 py-4">
                            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-in zoom-in-150 duration-500" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Password Updated!</h2>
                                <p className="text-muted-foreground text-sm">
                                    Your password has been successfully updated.
                                    <br />
                                    Redirecting you now…
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-8 h-1 rounded-full bg-primary/30 animate-pulse" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
