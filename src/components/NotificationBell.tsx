import React, { useEffect } from "react";
import { Bell, MailOpen, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { showError } from "@/utils/toast";
import { useUserNotifications } from "@/hooks/use-user-notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const NotificationBell = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useUserNotifications(5); // Fetch recent 5 notifications

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  useEffect(() => {
    if (!user) return;

    // Realtime subscription for new notifications
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          // Invalidate query to refetch latest notifications
          queryClient.invalidateQueries({ queryKey: ["userNotifications", user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

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

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  if (error) {
    console.error("Error fetching notifications for bell:", error);
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 text-destructive" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start space-y-1"
              onSelect={() => !notification.is_read && markAsReadMutation.mutate(notification.id)}
              disabled={markAsReadMutation.isPending}
            >
              <div className="flex justify-between w-full">
                <p className="text-sm font-medium">{notification.message}</p>
                {!notification.is_read && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="text-muted-foreground">
            Nenhuma notificação.
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-primary" onClick={() => window.location.href = "/notificacoes"}>
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};