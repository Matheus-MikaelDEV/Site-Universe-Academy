import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, Pencil, RotateCcw } from "lucide-react"; // Alterado de LockReset para RotateCcw
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showError, showSuccess } from "@/utils/toast";

const profileEditSchema = z.object({
  full_name: z.string().min(3, "Nome completo é obrigatório."),
  cpf: z.string().optional().nullable(),
  role: z.enum(["user", "admin"]),
});

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const form = useForm<z.infer<typeof profileEditSchema>>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      full_name: "",
      cpf: "",
      role: "user",
    },
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");
    
    if (error) {
      console.error("Error fetching users:", error);
      showError("Falha ao carregar usuários.");
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: Profile) => {
    setSelectedUser(user);
    form.reset({
      full_name: user.full_name || "",
      cpf: user.cpf || "",
      role: (user.role as "user" | "admin") || "user",
    });
    setIsEditDialogOpen(true);
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Tem certeza que deseja enviar um email de redefinição de senha para ${userEmail}?`)) return;

    // Supabase Admin API requires service_role key, which is not directly accessible from client-side.
    // This would typically be handled by an Edge Function or a server-side call.
    // For now, we'll simulate the client-side reset password flow.
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      showError("Erro ao enviar email de redefinição: " + error.message);
    } else {
      showSuccess(`Um email de redefinição de senha foi enviado para ${userEmail}.`);
    }
  };

  const onSubmitEdit = async (values: z.infer<typeof profileEditSchema>) => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        cpf: values.cpf,
        role: values.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedUser.id);

    if (error) {
      showError("Erro ao atualizar perfil: " + error.message);
    } else {
      showSuccess("Perfil do usuário atualizado com sucesso!");
      setIsEditDialogOpen(false);
      fetchUsers();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>Visualize e edite os perfis e permissões dos usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Role</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.cpf || 'Não informado'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
                          </DropdownMenuItem>
                          {user.email && ( // Only show if email is available for reset
                            <DropdownMenuItem onClick={() => handleResetPassword(user.id, user.email!)}>
                              <RotateCcw className="mr-2 h-4 w-4" /> Redefinir Senha {/* Alterado aqui */}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">Nenhum usuário encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil do Usuário</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função (Role)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}