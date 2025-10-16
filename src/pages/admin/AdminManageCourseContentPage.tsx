import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MoreHorizontal, PlusCircle, BookOpenText } from "lucide-react";
import { Course } from "@/types/course";
import { Module } from "@/types/module";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { QuestionForm } from "@/components/admin/QuestionForm"; // Import QuestionForm
import { showError, showSuccess } from "@/utils/toast";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

export default function AdminManageCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [currentModuleForQuestions, setCurrentModuleForQuestions] = useState<Module | null>(null);
  const [moduleQuestions, setModuleQuestions] = useState<Question[]>([]);

  const fetchCourseAndModules = async () => {
    if (!courseId) return;
    setLoading(true);
    const { data: courseData, error: courseError } = await supabase
      .from("courses").select("*").eq("id", courseId).single();

    if (courseError) {
      showError("Falha ao carregar o curso.");
    } else {
      setCourse(courseData);
    }

    const { data: modulesData, error: modulesError } = await supabase
      .from("modules").select("*").eq("course_id", courseId).order("module_order");

    if (modulesError) {
      showError("Falha ao carregar os módulos.");
    } else {
      setModules(modulesData);
    }
    setLoading(false);
  };

  const fetchModuleQuestions = async (moduleId: string) => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("module_id", moduleId)
      .order("created_at", { ascending: true });
    
    if (error) {
      showError("Erro ao carregar perguntas do módulo: " + error.message);
      return [];
    }
    return data;
  };

  useEffect(() => {
    fetchCourseAndModules();
  }, [courseId]);

  const handleCreateModule = () => {
    setSelectedModule(null);
    setIsModuleDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setIsModuleDialogOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este módulo? Isso também deletará todas as perguntas associadas.")) return;
    const { error } = await supabase.from("modules").delete().eq("id", moduleId);
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Módulo deletado com sucesso.");
      fetchCourseAndModules();
    }
  };

  const handleModuleFormSuccess = () => {
    setIsModuleDialogOpen(false);
    fetchCourseAndModules();
  };

  const handleManageQuestions = async (module: Module) => {
    setCurrentModuleForQuestions(module);
    const questions = await fetchModuleQuestions(module.id);
    setModuleQuestions(questions);
  };

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar esta pergunta?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", questionId);
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Pergunta deletada com sucesso.");
      if (currentModuleForQuestions) {
        const questions = await fetchModuleQuestions(currentModuleForQuestions.id);
        setModuleQuestions(questions);
      }
    }
  };

  const handleQuestionFormSuccess = async () => {
    setIsQuestionDialogOpen(false);
    if (currentModuleForQuestions) {
      const questions = await fetchModuleQuestions(currentModuleForQuestions.id);
      setModuleQuestions(questions);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!course) return <div>Curso não encontrado.</div>;

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
                {modules.length > 0 ? (
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
                            <DropdownMenuItem onClick={() => handleDeleteModule(module.id)} className="text-destructive">Deletar Módulo</DropdownMenuItem>
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
                  {moduleQuestions.length > 0 ? (
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
                              <DropdownMenuItem onClick={() => handleDeleteQuestion(question.id)} className="text-destructive">Deletar Pergunta</DropdownMenuItem>
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