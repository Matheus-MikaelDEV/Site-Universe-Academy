import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabaseClient";
import { showError, showSuccess } from "@/utils/toast";
import { useAuth } from "@/contexts/Auth/AuthContext"; // Corrected import path
import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

const feedbackSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("Por favor, insira um email válido."),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
});

const FeedbackPage = () => {
  const { user, profile } = useAuth();
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("email", user.email || "");
      if (profile?.full_name) {
        form.setValue("name", profile.full_name);
      }
    }
  }, [user, profile, form]);

  const submitFeedbackMutation = useMutation({
    mutationFn: async (values: z.infer<typeof feedbackSchema>) => {
      const { error } = await supabase.from("feedbacks").insert([
        {
          name: values.name,
          email: values.email,
          message: values.message,
          user_id: user?.id,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Feedback enviado com sucesso! Obrigado.");
      form.reset();
    },
    onError: (error: any) => {
      showError("Ocorreu um erro ao enviar o feedback: " + error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof feedbackSchema>) => {
    submitFeedbackMutation.mutate(values);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Envie seu Feedback</CardTitle>
            <CardDescription>
              Sua opinião é muito importante para nós. Ajude-nos a melhorar!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Seu nome" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" {...form.register("email")} />
                  {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea id="message" placeholder="Escreva sua mensagem aqui..." {...form.register("message")} />
                {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitFeedbackMutation.isPending}>
                {submitFeedbackMutation.isPending ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default FeedbackPage;