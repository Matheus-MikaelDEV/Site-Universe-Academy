import React, { useEffect, useState } from "react";
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

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5); // Fetch recent notifications

    if (error) {
      showError("Erro ao carregar notificações: " + error.message);
    } else {
      setNotifications(data || []);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

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
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev].slice(0, 5));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

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
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start space-y-1"
              onSelect={() => !notification.is_read && markAsRead(notification.id)}
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
        <DropdownMenuItem className="justify-center text-primary">
          Ver todas as notificações (Em breve)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};