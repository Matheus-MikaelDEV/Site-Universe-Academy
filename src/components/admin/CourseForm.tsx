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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (course) {
      // Update existing course
      const { error } = await supabase
        .from("courses")
        .update(values)
        .eq("id", course.id);
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Curso atualizado com sucesso!");
        onSuccess();
      }
    } else {
      // Create new course
      const { error } = await supabase.from("courses").insert([values]);
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Curso criado com sucesso!");
        onSuccess();
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}