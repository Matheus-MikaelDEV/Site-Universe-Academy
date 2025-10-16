import { useForm, useFieldArray } from "react-hook-form";
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
import { PlusCircle, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  question_text: z.string().min(5, "A pergunta é obrigatória e deve ter pelo menos 5 caracteres."),
  options: z.array(z.string().min(1, "A opção não pode ser vazia.")).min(2, "Pelo menos duas opções são necessárias."),
  correct_option_index: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "Selecione a opção correta.",
  }).transform(val => parseInt(val)),
});

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

interface QuestionFormProps {
  question?: Question | null;
  moduleId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function QuestionForm({ question, moduleId, onSuccess, onCancel }: QuestionFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question_text: question?.question_text || "",
      options: question?.options || ["", ""],
      correct_option_index: question?.correct_option_index.toString() || "0",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const createUpdateQuestionMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const questionData = {
        ...values,
        module_id: moduleId,
        correct_option_index: values.correct_option_index,
      };

      if (question) {
        // Update existing question
        const { error } = await supabase
          .from("questions")
          .update(questionData)
          .eq("id", question.id);
        if (error) throw error;
      } else {
        // Create new question
        const { error } = await supabase.from("questions").insert([questionData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess(question ? "Pergunta atualizada com sucesso!" : "Pergunta criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["adminQuestions", moduleId] });
      onSuccess();
    },
    onError: (err: any) => {
      showError("Erro ao salvar pergunta: " + err.message);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => createUpdateQuestionMutation.mutate(values))} className="space-y-4">
        <FormField
          control={form.control}
          name="question_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto da Pergunta</FormLabel>
              <FormControl>
                <Textarea placeholder="Qual é a capital do Brasil?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Opções de Resposta</FormLabel>
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`options.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder={`Opção ${index + 1}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length <= 2 || createUpdateQuestionMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append("")}
            className="w-full"
            disabled={createUpdateQuestionMutation.isPending}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Opção
          </Button>
        </div>

        <FormField
          control={form.control}
          name="correct_option_index"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opção Correta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={createUpdateQuestionMutation.isPending}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a opção correta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fields.map((_, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Opção {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={createUpdateQuestionMutation.isPending}>Cancelar</Button>
          <Button type="submit" disabled={createUpdateQuestionMutation.isPending}>
            {createUpdateQuestionMutation.isPending ? "Salvando Pergunta..." : "Salvar Pergunta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}