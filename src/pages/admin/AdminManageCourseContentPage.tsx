import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MoreHorizontal, PlusCircle } from "lucide-react";
import { Course } from "@/types/course";
import { Module } from "@/types/module";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { showError, showSuccess } from "@/utils/toast";
import { useAdminModules } from "@/hooks/use-admin-modules";
import { useAdminQuestions } from "@/hooks/use-admin-questions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

export default function AdminManageCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [currentModuleForQuestions, setCurrentModuleForQuestions] = useState<Module | null>(null);
  const queryClient = useQueryClient();

  const { data: modules, isLoading: modulesLoading, error: modulesError } = useAdminModules(courseId);
  const { data: moduleQuestions, isLoading: questionsLoading, error: questionsError, refetch: refetchQuestions } = useAdminQuestions(currentModuleForQuestions?.id);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (error) {
        showError("Falha ao carregar o curso: " + error.message);
      } else {
        setCourse(data);
      }
    };
    fetchCourse();
  }, [courseId]);

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const { error } = await supabase.from("modules").delete().eq("id", moduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Módulo deletado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["adminModules", courseId] });
      queryClient.invalidateQueries({ queryKey: ["adminQuestions"] }); // Invalidate all questions
    },
    onError: (err: any) => {
      showError(err.message);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.from("questions").delete().eq("id", questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Pergunta deletada com sucesso.");
      refetchQuestions(); // Refetch questions for the current module
    },
    onError: (err: any) => {
      showError(err.message);
    },
  });

  const handleCreateModule = () => {
    setSelectedModule(null);
    setIsModuleDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setIsModuleDialogOpen(true);
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este módulo? Isso também deletará todas as perguntas associadas.")) return;
    deleteModuleMutation.mutate(moduleId);
  };

  const handleModuleFormSuccess = () => {
    setIsModuleDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["adminModules", courseId] });
  };

  const handleManageQuestions = (module: Module) => {
    setCurrentModuleForQuestions(module);
    queryClient.invalidateQueries({ queryKey: ["adminQuestions", module.id] }); // Ensure questions are refetched for this module
  };

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar esta pergunta?")) return;
    deleteQuestionMutation.mutate(questionId);
  };

  const handleQuestionFormSuccess = () => {
    setIsQuestionDialogOpen(false);
    refetchQuestions(); // Refetch questions for the current module
  };

  if (!course) return <Skeleton className="h-96 w-full" />;
  if (modulesError) return <div className="text-destructive">Erro ao carregar módulos: {modulesError.message}</div>;
  if (questionsError) return <div className="text-destructive">Erro ao carregar perguntas: {questionsError.message}</div>;

  return (
    <>
      <div className="space-y-4">
        <Link to="/admin/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar para todos os cursos
        </Link>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gerenciar Conteúdo: {course.title}</CardTitle>
              <CardDescription>Adicione e organize os módulos do curso.</CardDescription>
            </div>
            <Button onClick={handleCreateModule}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Módulo
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Vídeo</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modulesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                    </TableRow>
                  ))
                ) : modules && modules.length > 0 ? (
                  modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.title}</TableCell>
                      <TableCell>{module.video_url ? "Sim" : "Não"}</TableCell>
                      <TableCell>{module.pdf_url ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleManageQuestions(module)}>Gerenciar Perguntas</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditModule(module)}>Editar Módulo</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteModule(module.id)} className="text-destructive" disabled={deleteModuleMutation.isPending}>Deletar Módulo</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">Nenhum módulo adicionado ainda.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {currentModuleForQuestions && (
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Perguntas do Módulo: {currentModuleForQuestions.title}</CardTitle>
                <CardDescription>Adicione e edite perguntas para o quiz deste módulo.</CardDescription>
              </div>
              <Button onClick={handleCreateQuestion}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Pergunta
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pergunta</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                      </TableRow>
                    ))
                  ) : moduleQuestions && moduleQuestions.length > 0 ? (
                    moduleQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.question_text}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditQuestion(question)}>Editar Pergunta</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteQuestion(question.id)} className="text-destructive" disabled={deleteQuestionMutation.isPending}>Deletar Pergunta</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">Nenhuma pergunta adicionada ainda para este módulo.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedModule ? "Editar Módulo" : "Criar Novo Módulo"}</DialogTitle>
          </DialogHeader>
          <ModuleForm
            module={selectedModule}
            courseId={courseId!}
            onSuccess={handleModuleFormSuccess}
            onCancel={() => setIsModuleDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedQuestion ? "Editar Pergunta" : "Criar Nova Pergunta"}</DialogTitle>
          </DialogHeader>
          {currentModuleForQuestions && (
            <QuestionForm
              question={selectedQuestion}
              moduleId={currentModuleForQuestions.id}
              onSuccess={handleQuestionFormSuccess}
              onCancel={() => setIsQuestionDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}