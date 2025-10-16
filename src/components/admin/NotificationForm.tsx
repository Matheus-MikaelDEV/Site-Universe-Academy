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

const formSchema = z.object({
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
  userId: z.string().optional(), // Optional, if sending to all users
  type: z.enum(["info", "success", "warning", "alert"]).default("info"),
});

interface NotificationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NotificationForm({ onSuccess, onCancel }: NotificationFormProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      userId: "",
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const notificationData = {
      message: values.message,
      user_id: values.userId || null, // If userId is empty, it's a general notification (though RLS might restrict this)
      type: values.type,
    };

    const { error } = await supabase.from("notifications").insert([notificationData]);

    if (error) {
      showError("Erro ao enviar notificação: " + error.message);
    } else {
      showSuccess("Notificação enviada com sucesso!");
      onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormLabel>Enviar para (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os usuários ou um usuário específico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Todos os Usuários</SelectItem>
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
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Enviar Notificação</Button>
        </div>
      </form>
    </Form>
  );
}