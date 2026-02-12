import {
  LayoutDashboard,
  Utensils,
  Droplets,
  Dumbbell,
  Footprints,
  HeartPulse,
  Settings,
  LogOut,
  ChevronRight,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Utensils, label: "Meals", href: "/dashboard/meals" },
  { icon: Droplets, label: "Water Intake", href: "/dashboard/water" },
  { icon: Dumbbell, label: "Workouts", href: "/dashboard/workouts" },
  { icon: Footprints, label: "Step Counter", href: "/dashboard/steps" },
  { icon: HeartPulse, label: "Health Overview", href: "/dashboard/health" },
];

import { useAuth } from "@/hooks/useAuth";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string) => location === href;

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/10">
      <SidebarHeader className="p-4 border-b border-primary/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-2xl font-bold">HealthTrack</span>
            <span className="text-base text-muted-foreground">Dashboard</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={isActive(item.href)}
                    className={`transition-all duration-200 ${isActive(item.href)
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <Link href={item.href}>
                      <item.icon className={isActive(item.href) ? "text-primary" : ""} />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      {isActive(item.href) && <ChevronRight className="ml-auto w-5 h-5 shrink-0 group-data-[collapsible=icon]:hidden" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-primary/10 space-y-4">
        {/* User Stats - Hidden in icon mode */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-base font-bold text-primary-foreground">
              {getInitials(user?.name || "User")}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-lg truncate">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate" title={user?.email}>{user?.email || "Guest"}</p>
            </div>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings className="w-5 h-5" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Log Out"
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>


        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
