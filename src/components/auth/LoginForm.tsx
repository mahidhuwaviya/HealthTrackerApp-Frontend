import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginRequest } from "@/api/auth";

interface LoginFormProps {
    isLogin: boolean;
    onSubmit: (data: LoginRequest) => void;
    isLoading?: boolean;
}

export const LoginForm = ({ isLogin, onSubmit, isLoading = false }: LoginFormProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            email,
            password,
            ...(!isLogin && { name })
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-4 py-6 bg-secondary/50 border-primary/10 focus:border-primary/50"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 py-6 bg-secondary/50 border-primary/10 focus:border-primary/50"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                        <a href="#" className="text-sm text-primary hover:underline">
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

            {isLogin && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                        Remember me for 30 days
                    </Label>
                </div>
            )}

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 btn-glow bg-primary text-primary-foreground hover:bg-primary/90 text-lg"
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
        </form>
    );
};
