import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/api/auth";
import { toast } from "sonner";
import { AUTH_VALIDATION, UI_STRINGS } from "@/config/health-constants";

interface LoginFormProps {
    isLogin: boolean;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    onForgotPassword?: () => void;
}

type SignupStep = "email" | "otp" | "password";

export const LoginForm = ({ isLogin, onSubmit, isLoading = false, onForgotPassword }: LoginFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // OTP signup flow state
    const [signupStep, setSignupStep] = useState<SignupStep>("email");
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // OTP Countdown Timer State
    const [timer, setTimer] = useState(0);

    // Validation
    const isEmailValid = AUTH_VALIDATION.EMAIL_REGEX.test(email);
    const isPasswordValid = password.length >= AUTH_VALIDATION.MIN_PASSWORD_LENGTH;
    const isConfirmPasswordValid = password === confirmPassword;

    // Form validity depends on whether it's login or signup
    const isFormValid = isLogin
        ? (isEmailValid && isPasswordValid)
        : (isEmailValid && isPasswordValid && isConfirmPasswordValid && signupStep === "password");

    // Handle OTP Countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        onSubmit({
            email,
            password,
        });
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onForgotPassword) {
            onForgotPassword();
        } else {
            toast.info(UI_STRINGS.AUTH.FORGOT_PASSWORD_TOAST);
        }
    };

    const handleSendOtp = async () => {
        if (!isEmailValid) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setIsVerifying(true);
        try {
            await authApi.getOtp(email, "verifyEmail");
            toast.success("Verification code sent to your email!");
            setSignupStep("otp");
            setTimer(60); // 5 minutes = 300 seconds
        } catch (error: any) {
            console.error("Failed to send OTP:", error);
            const msg: string = error.response?.data?.message || "Failed to send verification code. Please try again.";
            toast.error(msg);

            // If email already exists, take them back to step 1
            if (msg.toLowerCase().includes("exists") || msg.toLowerCase().includes("already")) {
                setSignupStep("email");
                setOtp("");
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 4) {
            toast.error("Please enter the verification code.");
            return;
        }
        setIsVerifying(true);
        try {
            // Verify OTP with empty password context
            await authApi.verifyOtp({ email, otp, newPassword: "" }, "verifyEmail");
            toast.success("Email verified successfully!");
            setSignupStep("password");
            setTimer(0); // clear timer on success
        } catch (error: any) {
            console.error("Failed to verify OTP:", error);
            const msg = error.response?.data?.message || "Invalid or expired verification code.";
            toast.error(msg);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            // Reset signup step if email changes during signup
                            if (!isLogin && signupStep !== "email") {
                                setSignupStep("email");
                                setOtp("");
                                setPassword("");
                                setConfirmPassword("");
                                setTimer(0);
                            }
                        }}
                        disabled={!isLogin && signupStep !== "email"}
                        className="pl-12 py-6 bg-secondary/50 border-primary/10 focus:border-primary/50"
                    />
                </div>
            </div>

            {/* SEND OTP BUTTON FOR SIGNUP */}
            {!isLogin && signupStep === "email" && (
                <Button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!isEmailValid || isVerifying || isLoading}
                    className="w-full py-6 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {isVerifying ? "Sending..." : "Verify Email"}
                </Button>
            )}

            {/* VERIFY OTP SECTION FOR SIGNUP */}
            {!isLogin && signupStep === "otp" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="text-center tracking-widest text-lg py-6 bg-secondary/50 border-primary/10 focus:border-primary/50"
                        />
                    </div>

                    {timer > 0 && (
                        <p className="text-xs text-center text-muted-foreground">
                            Code expires in <span className="font-medium text-primary">{formatTime(timer)}</span>
                        </p>
                    )}

                    <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otp.length < 4 || isVerifying || isLoading}
                        className="w-full py-6 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isVerifying ? "Verifying..." : "Confirm Code"}
                    </Button>
                    <div className="text-center text-sm">
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isVerifying || timer > 0}
                            className={`hover:underline ${timer > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary"}`}
                        >
                            {timer > 0 ? "Resend code in " + formatTime(timer) : "Resend code"}
                        </button>
                    </div>
                </div>
            )}

            {/* PASSWORD FIELDS (Login OR Validated Signup) */}
            {(isLogin || signupStep === "password") && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{isLogin ? "Password" : "Create Password"}</Label>
                            {isLogin && (
                                <a
                                    href="#"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-primary hover:underline transition-colors"
                                >
                                    Forgot password?
                                </a>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-12 pr-12 py-6 bg-secondary/50 border-primary/10 focus:border-primary/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-12 pr-12 py-6 bg-secondary/50 border-primary/10 focus:border-primary/50"
                                />
                            </div>
                            {!isConfirmPasswordValid && confirmPassword.length > 0 && (
                                <p className="text-xs text-destructive">Passwords do not match.</p>
                            )}
                            {!isPasswordValid && password.length > 0 && (
                                <p className="text-xs text-muted-foreground">Password must be at least {AUTH_VALIDATION.MIN_PASSWORD_LENGTH} characters.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {isLogin && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                        Remember me for 30 days
                    </Label>
                </div>
            )}

            {/* MAIN SUBMIT BUTTON */}
            {(isLogin || signupStep === "password") && (
                <Button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className={`w-full py-6 btn-glow text-lg transition-all duration-300 ${!isFormValid
                        ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                >
                    {isLoading ? (
                        "Please wait..."
                    ) : (
                        <>
                            {isLogin ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </Button>
            )}
        </form>
    );
};
