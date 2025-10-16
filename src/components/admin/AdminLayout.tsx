import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookCopy, Home, MessageSquare, Users, Shield, BellRing } from "lucide-react";
import { Header } from "../header";

export function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <NavLink to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-primary" />
            <span>Admin Panel</span>
          </NavLink>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <AdminNavLink to="/admin/dashboard">
            <Home className="h-4 w-4" />
            Dashboard
          </AdminNavLink>
          <AdminNavLink to="/admin/courses">
            <BookCopy className="h-4 w-4" />
            Cursos
          </AdminNavLink>
          <AdminNavLink to="/admin/users">
            <Users className="h-4 w-4" />
            Usuários
          </AdminNavLink>
          <AdminNavLink to="/admin/feedback">
            <MessageSquare className="h-4 w-4" />
            Feedbacks
          </AdminNavLink>
          <AdminNavLink to="/admin/send-notification">
            <BellRing className="h-4 w-4" />
            Enviar Notificação
          </AdminNavLink>
        </nav>
      </aside>
      <div className="flex flex-col sm:ml-60">
        <Header />
        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

interface AdminNavLinkProps {
  to: string;
  children: React.ReactNode;
}

function AdminNavLink({ to, children }: AdminNavLinkProps) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          isActive && "bg-muted text-primary"
        )
      }
    >
      {children}
    </NavLink>
  );
}