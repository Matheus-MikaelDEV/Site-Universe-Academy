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
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

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
  const [dialogState, setDialogState] = useState({ open: false, id: '', type: '' });
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
    },
    onError: (err: any) => showError(err.message),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.from("questions").delete().eq("id", questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Pergunta deletada com sucesso.");
      refetchQuestions();
    },
    onError: (err: any) => showError(err.message),
  });

  const openConfirmationDialog = (id: string, type: 'module' | 'question') => {
    setDialogState({ open: true, id, type });
  };

  const handleConfirmDelete = () => {
    if (dialogState.type === 'module') {
      deleteModuleMutation.mutate(dialogState.id);
    } else if (dialogState.type === 'question') {
      deleteQuestionMutation.mutate(dialogState.id);
    }
    setDialogState({ open: false, id: '', type: '' });
  };

  const handleCreateModule = () => { setSelectedModule(null); setIsModuleDialogOpen(true); };
  const handleEditModule = (module: Module) => { setSelectedModule(module); setIsModuleDialogOpen(true); };
  const handleModuleFormSuccess = () => { setIsModuleDialogOpen(false); queryClient.invalidateQueries({ queryKey: ["adminModules", courseId] }); };
  const handleManageQuestions = (module: Module) => { setCurrentModuleForQuestions(module); };
  const handleCreateQuestion = () => { setSelectedQuestion(null); setIsQuestionDialogOpen(true); };
  const handleEditQuestion = (question: Question) => { setSelectedQuestion(question); setIsQuestionDialogOpen(true); };
  const handleQuestionFormSuccess = () => { setIsQuestionDialogOpen(false); refetchQuestions(); };

  if (!course) return <Skeleton className="h-96 w-full" />;
  if (modulesError) return <div className="text-destructive">Erro: {modulesError.message}</div>;
  if (questionsError) return <div className="text-destructive">Erro: {questionsError.message}</div>;

  return (
    <>
      <div className="space-y-4">
        <Link to="/admin/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gerenciar Conteúdo: {course.title}</CardTitle>
              <CardDescription>Adicione e organize os módulos do curso.</CardDescription>
            </div>
            <Button onClick={handleCreateModule}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Módulo</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Vídeo</TableHead><TableHead>PDF</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
              <TableBody>
                {modulesLoading ? Array.from({ length: 3 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-6 w-40" /></TableCell><TableCell><Skeleton className="h-6 w-12" /></TableCell><TableCell><Skeleton className="h-6 w-12" /></TableCell><TableCell><Skeleton className="h-6 w-6" /></TableCell></TableRow>))
                : modules && modules.length > 0 ? modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.title}</TableCell>
                    <TableCell>{module.video_url ? "Sim" : "Não"}</TableCell>
                    <TableCell>{module.pdf_url ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleManageQuestions(module)}>Gerenciar Perguntas</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditModule(module)}>Editar Módulo</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openConfirmationDialog(module.id, 'module')} className="text-destructive">Deletar Módulo</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={4} className="text-center h-24">Nenhum módulo adicionado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {currentModuleForQuestions && (
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Perguntas: {currentModuleForQuestions.title}</CardTitle>
                <CardDescription>Adicione e edite perguntas para o quiz.</CardDescription>
              </div>
              <Button onClick={handleCreateQuestion}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pergunta</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Pergunta</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
                <TableBody>
                  {questionsLoading ? Array.from({ length: 3 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-6 w-full" /></TableCell><TableCell><Skeleton className="h-6 w-6" /></TableCell></TableRow>))
                  : moduleQuestions && moduleQuestions.length > 0 ? moduleQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.question_text}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditQuestion(question)}>Editar Pergunta</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openConfirmationDialog(question.id, 'question')} className="text-destructive">Deletar Pergunta</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={2} className="text-center h-24">Nenhuma pergunta adicionada.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{selectedModule ? "Editar Módulo" : "Criar Módulo"}</DialogTitle></DialogHeader><ModuleForm module={selectedModule} courseId={courseId!} onSuccess={handleModuleFormSuccess} onCancel={() => setIsModuleDialogOpen(false)} /></DialogContent>
      </Dialog>

      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{selectedQuestion ? "Editar Pergunta" : "Criar Pergunta"}</DialogTitle></DialogHeader>{currentModuleForQuestions && <QuestionForm question={selectedQuestion} moduleId={currentModuleForQuestions.id} onSuccess={handleQuestionFormSuccess} onCancel={() => setIsQuestionDialogOpen(false)} />}</DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        onConfirm={handleConfirmDelete}
        title="Tem certeza?"
        description={dialogState.type === 'module' ? "Isso deletará o módulo e todas as suas perguntas. Esta ação não pode ser desfeita." : "Isso deletará a pergunta permanentemente."}
      />
    </>
  );
}