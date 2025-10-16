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
import { Course } from "@/types/course";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(3, "O título é obrigatório."),
  description: z.string().optional(),
  category: z.string().optional(),
  instructor: z.string().optional(),
  image_url: z.string().url("Por favor, insira uma URL de imagem válida.").optional().or(z.literal('')),
});

interface CourseFormProps {
  course?: Course | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CourseForm({ course, onSuccess, onCancel }: CourseFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      category: course?.category || "",
      instructor: course?.instructor || "",
      image_url: course?.image_url || "",
    },
  });

  const createUpdateCourseMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (course) {
        // Update existing course
        const { error } = await supabase
          .from("courses")
          .update(values)
          .eq("id", course.id);
        if (error) throw error;
      } else {
        // Create new course
        const { error } = await supabase.from("courses").insert([values]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess(course ? "Curso atualizado com sucesso!" : "Curso criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] }); // Invalidate public courses list
      queryClient.invalidateQueries({ queryKey: ["courseCategories"] }); // Invalidate categories
      onSuccess();
    },
    onError: (err: any) => {
      showError(err.message);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => createUpdateCourseMutation.mutate(values))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Curso</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Introdução à Pedagogia" {...field} />
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
                <Textarea placeholder="Descreva o curso..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tecnologia Educacional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instructor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrutor</FormLabel>
              <FormControl>
                <Input placeholder="Nome do instrutor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem de Capa</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/imagem.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={createUpdateCourseMutation.isPending}>Cancelar</Button>
          <Button type="submit" disabled={createUpdateCourseMutation.isPending}>
            {createUpdateCourseMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}