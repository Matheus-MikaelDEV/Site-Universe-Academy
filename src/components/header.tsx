import { Menu, BookOpen, LayoutDashboard, User as UserIcon, LogOut, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { showSuccess } from "@/utils/toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NotificationBell } from "./NotificationBell"; // Import NotificationBell

export const Header = () => {
  const { user, session, isAdmin, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("Você saiu com sucesso.");
    navigate("/");
  };

  const navLinks = [
    { href: "/cursos", label: "Cursos" },
    { href: "/sobre", label: "Sobre" },
    { href: "/idealizadores", label: "Idealizadores" },
    { href: "/feedback", label: "Feedback" },
  ];

  const getInitials = (email: string) => {
    return email?.[0]?.toUpperCase() || "U";
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              UniVerse Academy
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link to="/" className="flex items-center space-x-2 mb-6">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span className="font-bold">UniVerse Academy</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session && user ? (
              <>
                <NotificationBell /> {/* Add NotificationBell here */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || user.email} />
                        <AvatarFallback>{profile?.full_name?.[0] || getInitials(user.email!)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name || user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Painel</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/perfil")}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Meu Perfil</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/register")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Cadastre-se
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};