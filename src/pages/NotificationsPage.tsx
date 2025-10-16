import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailOpen, Bell, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserNotifications } from "@/hooks/use-user-notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const NotificationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useUserNotifications();

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userNotifications", user?.id] });
    },
    onError: (err: any) => {
      showError("Erro ao marcar como lida: " + err.message);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userNotifications", user?.id] });
      showSuccess("Todas as notificações foram marcadas como lidas!");
    },
    onError: (err: any) => {
      showError("Erro ao marcar todas como lidas: " + err.message);
    },
  });

  if (isLoading || authLoading) {
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

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-12">
          <div className="text-destructive">Erro ao carregar notificações: {error.message}</div>
        </main>
        <Footer />
      </div>
    );
  }

  const unreadNotificationsExist = notifications?.some(n => !n.is_read);

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
            <Button 
              onClick={() => markAllAsReadMutation.mutate()} 
              disabled={!unreadNotificationsExist || markAllAsReadMutation.isPending}
            >
              <MailOpen className="mr-2 h-4 w-4" /> {markAllAsReadMutation.isPending ? "Marcando..." : "Marcar todas como lidas"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications && notifications.length > 0 ? (
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => markAsReadMutation.mutate(notification.id)} 
                      className="flex-shrink-0"
                      disabled={markAsReadMutation.isPending}
                    >
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