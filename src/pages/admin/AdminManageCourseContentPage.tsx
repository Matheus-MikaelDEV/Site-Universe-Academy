import { useEffect, useState } from "react";
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
import { showError, showSuccess } from "@/utils/toast";

export default function AdminManageCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

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

  useEffect(() => {
    fetchCourseAndModules();
  }, [courseId]);

  const handleCreate = () => {
    setSelectedModule(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (module: Module) => {
    setSelectedModule(module);
    setIsDialogOpen(true);
  };

  const handleDelete = async (moduleId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este módulo?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", moduleId);
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Módulo deletado com sucesso.");
      fetchCourseAndModules();
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchCourseAndModules();
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
            <Button onClick={handleCreate}>
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
                            <DropdownMenuItem onClick={() => handleEdit(module)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(module.id)} className="text-destructive">Deletar</DropdownMenuItem>
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedModule ? "Editar Módulo" : "Criar Novo Módulo"}</DialogTitle>
          </DialogHeader>
          <ModuleForm
            module={selectedModule}
            courseId={courseId!}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}