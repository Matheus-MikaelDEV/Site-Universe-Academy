import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { showError, showSuccess } from "@/utils/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Profile } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
  userId: z.string().optional(),
  type: z.enum(["info", "success", "warning", "alert"]).default("info"),
});

interface NotificationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NotificationForm({ onSuccess, onCancel }: NotificationFormProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      userId: "all-users",
      type: "info",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      if (error) {
        console.error("Error fetching users for notification form:", error);
      } else {
        setUsers(data || []);
      }
    };
    fetchUsers();
  }, []);

  const sendNotificationMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (values.userId === "all-users") {
        // Fetch all user IDs to send notifications
        const { data: allUsers, error: usersError } = await supabase
          .from("profiles")
          .select("id");
        if (usersError) throw usersError;

        const notifications = allUsers.map(user => ({
          message: values.message,
          user_id: user.id,
          type: values.type,
        }));

        const { error } = await supabase.from("notifications").insert(notifications);
        if (error) throw error;
      } else {
        // Send to a single user
        const { error } = await supabase.from("notifications").insert([{
          message: values.message,
          user_id: values.userId,
          type: values.type,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Notificação enviada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      onSuccess();
    },
    onError: (err: any) => {
      showError("Erro ao enviar notificação: " + err.message);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => sendNotificationMutation.mutate(values))} className="space-y-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea placeholder="Escreva a mensagem da notificação..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enviar para</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os usuários ou um usuário específico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all-users">Todos os Usuários</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Notificação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={sendNotificationMutation.isPending}>Cancelar</Button>
          <Button type="submit" disabled={sendNotificationMutation.isPending}>
            {sendNotificationMutation.isPending ? "Enviando..." : "Enviar Notificação"}
          </Button>
        </div>
      </form>
    </Form>
  );
}