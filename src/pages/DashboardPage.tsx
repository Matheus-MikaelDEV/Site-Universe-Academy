import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserBadges } from "@/components/UserBadges";
import { Award, FileText, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { showError } from "@/utils/toast";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button"; // Importação adicionada

interface Certificate {
  id: string;
  created_at: string;
  course_enrollments: {
    courses: {
      title: string;
    };
  };
}

interface EnrolledCourse {
  id: string;
  start_date: string;
  completion_date: string | null;
  status: string;
  courses: {
    id: string;
    title: string;
    image_url: string | null;
    instructor: string | null;
    category: string | null;
  };
}

const DashboardPage = () => {
  const { user, profile, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [enrolledCoursesLoading, setEnrolledCoursesLoading] = useState(true);

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) {
        setCertificatesLoading(false);
        return;
      }
      setCertificatesLoading(true);
      const { data, error } = await supabase
        .from("certificates")
        .select(
          `
          id,
          created_at,
          course_enrollments (
            courses (
              title
            )
          )
        `
        )
        .eq("course_enrollments.user_id", user.id); // Filter by user_id in enrollment

      if (error) {
        showError("Erro ao carregar certificados: " + error.message);
        console.error("Error fetching certificates:", error);
      } else {
        setCertificates(data || []);
      }
      setCertificatesLoading(false);
    };

    const fetchEnrolledCourses = async () => {
      if (!user) {
        setEnrolledCoursesLoading(false);
        return;
      }
      setEnrolledCoursesLoading(true);
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(
          `
          id,
          start_date,
          completion_date,
          status,
          courses (
            id,
            title,
            image_url,
            instructor,
            category
          )
        `
        )
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) {
        showError("Erro ao carregar cursos inscritos: " + error.message);
        console.error("Error fetching enrolled courses:", error);
      } else {
        setEnrolledCourses(data || []);
      }
      setEnrolledCoursesLoading(false);
    };

    if (!loading && user) {
      fetchCertificates();
      fetchEnrolledCourses();
    }
  }, [user, loading]);

  if (loading || isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-12 space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-2/4" />
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Painel do Aluno</h1>
          <p className="text-lg text-muted-foreground">
            Bem-vindo de volta, {profile?.full_name || user?.email}!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Minha Pontuação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{profile?.points || 0} pontos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Continue aprendendo para ganhar mais pontos e subir no{" "}
              <Link to="/leaderboard" className="text-primary hover:underline">
                Leaderboard
              </Link>
              !
            </p>
          </CardContent>
        </Card>

        <UserBadges />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Meus Cursos
            </CardTitle>
            <CardDescription>
              Continue de onde parou ou explore novos cursos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledCoursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((enrollment) => (
                  <CourseCard
                    key={enrollment.id}
                    id={enrollment.courses.id}
                    title={enrollment.courses.title}
                    category={enrollment.courses.category || "Geral"}
                    instructor={enrollment.courses.instructor || "N/A"}
                    imageUrl={enrollment.courses.image_url || "/placeholder.svg"}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Você ainda não se inscreveu em nenhum curso.</p>
                <Link to="/cursos">
                  <Button variant="outline" className="mt-4">Explorar Cursos</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus Certificados</CardTitle>
            <CardDescription>
              Aqui você pode ver e baixar os certificados dos cursos que concluiu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certificatesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : certificates.length > 0 ? (
              <div className="space-y-2">
                {certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">{cert.course_enrollments?.courses?.title || "Curso Desconhecido"}</p>
                    </div>
                    <Link to={`/certificado/${cert.id}`}>
                      <Button variant="outline" size="sm">Ver Certificado</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Você ainda não possui nenhum certificado.</p>
                <Badge variant="outline" className="mt-2">Conclua um curso para ganhar!</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;