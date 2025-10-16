import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { CourseForm } from "@/components/admin/CourseForm";
import { Course } from "@/types/course";
import { showError, showSuccess } from "@/utils/toast";
import { useAdminCourses } from "@/hooks/use-admin-courses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCoursesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: courses, isLoading, error } = useAdminCourses();

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Curso deletado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
    },
    onError: (err: any) => {
      showError(err.message);
    },
  });

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (courseId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este curso? Esta ação não pode ser desfeita.")) return;
    deleteCourseMutation.mutate(courseId);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
  };

  if (error) {
    return <div className="text-destructive">Erro ao carregar cursos: {error.message}</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciar Cursos</CardTitle>
            <CardDescription>Adicione, edite e remova cursos da plataforma.</CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Curso
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Instrutor</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                  </TableRow>
                ))
              ) : courses && courses.length > 0 ? (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course.id}/manage`)}>Gerenciar Conteúdo</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(course)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-destructive" disabled={deleteCourseMutation.isPending}>Deletar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center">Nenhum curso encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCourse ? "Editar Curso" : "Criar Novo Curso"}</DialogTitle>
          </DialogHeader>
          <CourseForm
            course={selectedCourse}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}