import {
    Plus,
    LogOut,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
    subpage: string;
    onQuickAdd: () => void;
    onUpdateProfile: () => void;
}

import { useAuth } from "@/hooks/useAuth";

export const DashboardHeader = ({
    subpage,
    onQuickAdd,
    onUpdateProfile
}: DashboardHeaderProps) => {
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";
    };

    return (
        <header className="sticky top-0 z-30 glass-card rounded-none border-x-0 border-t-0 shrink-0 bg-background/60 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-colors" />
                    <h1 className="text-xl font-bold gradient-text capitalize tracking-tight">{subpage === "overview" ? "Dashboard" : subpage}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:to-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300 rounded-full px-6" onClick={onQuickAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Quick Add
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 hover:bg-transparent rounded-full focus-visible:ring-2 focus-visible:ring-primary/50">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground cursor-pointer shadow-md hover:scale-105 transition-transform border-2 border-background">
                                    {getInitials(user?.name || "User")}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10 w-48">
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                My Account
                            </div>
                            <div className="h-px bg-white/10 my-1" />
                            <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary" onClick={onUpdateProfile}>
                                <User className="w-4 h-4" /> Update Profile
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
