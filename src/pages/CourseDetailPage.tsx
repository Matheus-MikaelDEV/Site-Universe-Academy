import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookCheck, CheckCircle, FileText, Youtube, CheckSquare, Square } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { showError, showSuccess } from "@/utils/toast";
import { ModuleQuiz } from "@/components/ModuleQuiz";
import { useCourseDetails } from "@/hooks/use-course-details";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CourseDetailPage = () => {
  const { id: courseId } = useParams();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useCourseDetails(courseId);

  const course = data?.course;
  const modules = data?.modules || [];
  const isEnrolled = data?.isEnrolled || false;
  const courseCompletionPercentage = data?.courseCompletionPercentage || 0;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!session) {
        navigate("/login");
        throw new Error("Usuário não autenticado.");
      }
      const { error } = await supabase
        .from("course_enrollments")
        .insert({ user_id: user!.id, course_id: courseId! });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Inscrição realizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["courseDetails", courseId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["enrolledCourses", user?.id] });
    },
    onError: (err: any) => {
      showError("Erro ao se inscrever no curso: " + err.message);
    },
  });

  const markModuleCompleteMutation = useMutation({
    mutationFn: async ({ moduleId, isCompleted }: { moduleId: string; isCompleted: boolean }) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from("course_progress")
        .upsert(
          {
            user_id: user.id,
            module_id: moduleId,
            is_completed: !isCompleted,
            completed_at: !isCompleted ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,module_id" }
        );
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      showSuccess(variables.isCompleted ? "Módulo marcado como não concluído." : "Módulo marcado como concluído!");
      queryClient.invalidateQueries({ queryKey: ["courseDetails", courseId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["userBadges", user?.id] }); // Invalidate badges as well
      queryClient.invalidateQueries({ queryKey: ["userCertificates", user?.id] }); // Invalidate certificates
    },
    onError: (err: any) => {
      showError("Erro ao atualizar progresso: " + err.message);
    },
  });

  const handleMarkModuleComplete = (moduleId: string, isCompleted: boolean) => {
    markModuleCompleteMutation.mutate({ moduleId, isCompleted });
  };

  const handleQuizComplete = (score: number, total: number) => {
    showSuccess(`Quiz concluído! Você acertou ${score} de ${total} perguntas.`);
    // Optionally, mark module as complete if quiz passed
    // This logic can be added here or in a Supabase trigger
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-12">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-12">
          <div className="text-destructive">Erro ao carregar detalhes do curso: {error.message}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-12">
          <p>Curso não encontrado.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">por {course.instructor}</p>
              <div className="prose dark:prose-invert max-w-none">
                <p>{course.description || "Nenhuma descrição disponível."}</p>
              </div>
            </div>
            <div>
              <img 
                src={course.image_url || '/placeholder.svg'} 
                alt={course.title} 
                className="rounded-lg shadow-lg mb-4 w-full object-cover" 
                loading="lazy"
              />
              {isEnrolled ? (
                <>
                  <Button size="lg" className="w-full mb-2" disabled>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Você está inscrito
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    Progresso do Curso: {courseCompletionPercentage}%
                  </div>
                </>
              ) : (
                <Button size="lg" className="w-full" onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? "Inscrevendo..." : (
                    <>
                      <BookCheck className="mr-2 h-5 w-5" />
                      Inscrever-se no Curso
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          {isEnrolled && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Conteúdo do Curso</h2>
              {modules.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {modules.map(module => (
                    <AccordionItem value={module.id} key={module.id}>
                      <AccordionTrigger className="text-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {module.is_completed ? (
                            <CheckSquare className="h-5 w-5 text-green-500" />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground" />
                          )}
                          {module.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4">
                        <p className="text-muted-foreground">{module.description}</p>
                        <div className="flex flex-wrap gap-4">
                          {module.video_url && (
                            <a href={module.video_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline"><Youtube className="mr-2 h-4 w-4" /> Assistir Vídeo</Button>
                            </a>
                          )}
                          {module.pdf_url && (
                            <a href={module.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Baixar PDF</Button>
                            </a>
                          )}
                          <Button
                            variant={module.is_completed ? "secondary" : "outline"}
                            onClick={() => handleMarkModuleComplete(module.id, module.is_completed)}
                            disabled={markModuleCompleteMutation.isPending}
                          >
                            {markModuleCompleteMutation.isPending ? "Atualizando..." : (
                              module.is_completed ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" /> Concluído
                                </>
                              ) : (
                                <>
                                  <Square className="mr-2 h-4 w-4" /> Marcar como Concluído
                                </>
                              )
                            )}
                          </Button>
                        </div>
                        {/* Quiz Section */}
                        <div className="mt-6">
                          <ModuleQuiz moduleId={module.id} onQuizComplete={handleQuizComplete} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-center py-8">O conteúdo deste curso será adicionado em breve.</p>
              )}
            </div>
          )}
        </>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetailPage;