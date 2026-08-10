import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "#frontend/stores/auth";
import { LogoutDialog } from "#frontend/components/LogoutDialog";
import { toast } from "react-hot-toast";
import { CreatePostModal } from "#frontend/components/CreatePostModal";
import {
  CircleAlert,
  Home,
  LogOut,
  Menu,
  Search,
  Settings2,
  SquarePen,
  UserRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Shared app layout: a shadcn sidebar (left, collapsible to icons) plus an
 * inset area for page content, a mobile top bar with a sidebar trigger, and
 * the mobile bottom navigation.
 *
 * Active item is derived automatically from the current route:
 *   /foryou | /latest | / → Home item active
 *   /search              → Search item active
 *   /profiles/*          → Profile item active
 */
export function NavBar({ children }: { children?: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const isHomeActive =
    location.pathname === "/" ||
    location.pathname === "/latest" ||
    location.pathname === "/foryou";
  const isSearchActive = location.pathname === "/search";
  const isProfileActive = location.pathname.startsWith("/profiles/");

  const goToProfile = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(user.username ? `/profiles/@${user.username}` : `/profiles/${user.id}`);
  };

  const handleCreateClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsCreateOpen(true);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Link to="/" aria-label="FOZ Home">
                  <img
                    src="/foz-logo.svg"
                    alt="FOZ"
                    className="size-10 md:size-11"
                  />
                  <span className="text-2xl md:text-3xl font-black tracking-tighter">FOZ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="xl" isActive={isHomeActive} tooltip="Home" className="px-4 [&>svg]:size-5">
                  <Link to="/">
                    <Home fill={isHomeActive ? "currentColor" : "none"} className={isHomeActive ? "text-primary" : undefined} />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="xl" isActive={isSearchActive} tooltip="Search" className="px-4 [&>svg]:size-5">
                  <Link to="/search">
                    <Search strokeWidth={isSearchActive ? 3 : 2} className={isSearchActive ? "text-primary" : undefined} />
                    <span>Search</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="xl" onClick={handleCreateClick} tooltip="Create" className="px-4 [&>svg]:size-5">
                  <SquarePen />
                  <span>Create</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="xl" onClick={goToProfile} isActive={isProfileActive} tooltip="Profile" className="px-4 [&>svg]:size-5">
                  <UserRound fill={isProfileActive ? "currentColor" : "none"} className={isProfileActive ? "text-primary" : undefined} />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="mb-2">
              <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip="More" className="px-4 [&>svg]:size-5">
                    <Menu strokeWidth={isMoreMenuOpen ? 3 : 2} />
                    <span>More</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-lg" side="right" align="end" sideOffset={4}>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings2 />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast("Report feature coming soon")}>
                    <CircleAlert />
                    Report a Problem
                  </DropdownMenuItem>
                  {user && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsLogoutOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut />
                        Log out
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

      </Sidebar>

      <SidebarInset>
        {/* Mobile top bar with sidebar trigger */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border bg-background px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <Link to="/" aria-label="FOZ Home" className="absolute left-1/2 -translate-x-1/2">
            <img src="/foz-logo.svg" alt="FOZ" className="h-8 w-8" />
          </Link>
        </header>

        {children}

        {/* Mobile bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-outline-variant bg-surface backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom,0px)]">
          <div className="grid grid-cols-3 h-14 w-full max-w-md mx-auto items-center justify-items-center">
            <Link
              to="/"
              className={`w-full h-full flex items-center justify-center transition-colors ${isHomeActive ? "text-primary" : "text-outline hover:text-primary"
                }`}
              aria-label="Home"
            >
              <Home fill={isHomeActive ? "currentColor" : "none"} className="w-6 h-6" />
            </Link>
            <button
              onClick={handleCreateClick}
              className="w-full h-full flex items-center justify-center text-outline hover:text-primary transition-colors"
              aria-label="Create"
            >
              <SquarePen className="w-6 h-6" />
            </button>
            <button
              onClick={goToProfile}
              className={`w-full h-full flex items-center justify-center transition-colors ${isProfileActive ? "text-primary" : "text-outline hover:text-primary"
                }`}
              aria-label="Profile"
            >
              <UserRound fill={isProfileActive ? "currentColor" : "none"} className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </SidebarInset>

      <LogoutDialog
        user={user}
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </SidebarProvider>
  );
}
