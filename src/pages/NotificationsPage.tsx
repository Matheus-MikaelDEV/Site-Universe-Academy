import React, { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailOpen, Bell, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
}

const NotificationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      showError("Erro ao carregar notificações: " + error.message);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [user, authLoading]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      showError("Erro ao marcar como lida: " + error.message);
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      showError("Erro ao marcar todas como lidas: " + error.message);
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-12 space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Minhas Notificações</CardTitle>
              <CardDescription>Todas as suas atualizações e alertas importantes.</CardDescription>
            </div>
            <Button onClick={markAllAsRead} disabled={notifications.every(n => n.is_read) || notifications.length === 0}>
              <MailOpen className="mr-2 h-4 w-4" /> Marcar todas como lidas
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    notification.is_read ? "bg-muted/20" : "bg-background shadow-sm"
                  } transition-colors duration-200`}
                >
                  <Bell className={`h-5 w-5 ${notification.is_read ? "text-muted-foreground" : "text-primary"}`} />
                  <div className="flex-1">
                    <p className={`text-base ${notification.is_read ? "text-muted-foreground" : "font-medium"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)} className="flex-shrink-0">
                      <XCircle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      <span className="sr-only">Marcar como lida</span>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Você não tem nenhuma notificação.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;