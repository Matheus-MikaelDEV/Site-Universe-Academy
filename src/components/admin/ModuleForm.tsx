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
import { Module } from "@/types/module";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(3, "O título é obrigatório."),
  description: z.string().optional(),
  video_url: z.string().url("URL inválida.").optional().or(z.literal('')),
  pdf_url: z.string().url("URL inválida.").optional().or(z.literal('')),
});

interface ModuleFormProps {
  module?: Module | null;
  courseId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ModuleForm({ module, courseId, onSuccess, onCancel }: ModuleFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: module?.title || "",
      description: module?.description || "",
      video_url: module?.video_url || "",
      pdf_url: module?.pdf_url || "",
    },
  });

  const createUpdateModuleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const moduleData = { ...values, course_id: courseId };

      if (module) {
        // Update existing module
        const { error } = await supabase
          .from("modules")
          .update(moduleData)
          .eq("id", module.id);
        if (error) throw error;
      } else {
        // Create new module
        const { error } = await supabase.from("modules").insert([moduleData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess(module ? "Módulo atualizado com sucesso!" : "Módulo criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["adminModules", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courseDetails", courseId] }); // Invalidate course details to update module list
      onSuccess();
    },
    onError: (err: any) => {
      showError("Erro ao salvar módulo: " + err.message);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => createUpdateModuleMutation.mutate(values))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Módulo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Introdução ao Módulo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o conteúdo do módulo..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Vídeo</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com/watch?v=..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do PDF</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/material.pdf" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={createUpdateModuleMutation.isPending}>Cancelar</Button>
          <Button type="submit" disabled={createUpdateModuleMutation.isPending}>
            {createUpdateModuleMutation.isPending ? "Salvando Módulo..." : "Salvar Módulo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}