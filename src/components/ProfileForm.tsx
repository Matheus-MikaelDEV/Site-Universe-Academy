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
import { supabase } from "@/lib/supabaseClient";
import { showError, showSuccess } from "@/utils/toast";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import React, { useEffect, useState } from "react";
import { Profile } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  cpf: z.string().optional().nullable(),
  avatarFile: z.instanceof(File).optional(),
});

interface ProfileFormProps {
  user: User;
  profile: Profile;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: profile.full_name || "",
      cpf: profile.cpf || "",
      avatarFile: undefined,
    },
  });

  useEffect(() => {
    form.setValue("fullName", profile.full_name || "");
    form.setValue("cpf", profile.cpf || "");
    setAvatarPreview(profile.avatar_url || null);
  }, [profile, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("avatarFile", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      let avatarUrl = profile.avatar_url;

      if (values.avatarFile) {
        const file = values.avatarFile;
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          cpf: values.cpf,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      return avatarUrl;
    },
    onSuccess: (newAvatarUrl) => {
      showSuccess("Perfil atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      // Manually update avatar in AuthContext if needed, or rely on full page reload
      // For now, a simple reload to ensure header avatar updates
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error: any) => {
      showError(error.message || "Ocorreu um erro ao atualizar o perfil.");
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateProfileMutation.mutate(values))} className="space-y-6">
        <FormField
          control={form.control}
          name="avatarFile"
          render={() => (
            <FormItem className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview || undefined} loading="lazy" />
                <AvatarFallback>{profile?.full_name?.[0] || user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel htmlFor="picture">Foto de Perfil</FormLabel>
                <FormControl>
                  <Input id="picture" type="file" accept="image/*" onChange={handleAvatarChange} />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
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
                <Input placeholder="000.000.000-00" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
}