import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface CertificateData {
  id: string;
  verification_code: string;
  file_url: string | null;
  created_at: string;
  course_enrollments: {
    courses: {
      title: string;
      instructor: string;
    };
    profiles: {
      full_name: string;
    };
  };
}

const CertificateViewerPage = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("certificates")
        .select(
          `
          id,
          verification_code,
          file_url,
          created_at,
          course_enrollments (
            courses (
              title,
              instructor
            ),
            profiles (
              full_name
            )
          )
        `
        )
        .eq("id", certificateId)
        .single();

      if (error) {
        showError("Erro ao carregar certificado: " + error.message);
        console.error("Error fetching certificate:", error);
      } else {
        setCertificate(data as CertificateData);
      }
      setLoading(false);
    };

    fetchCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Certificado Não Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              O certificado que você está procurando não existe ou você não tem permissão para visualizá-lo.
            </p>
            <Link to="/dashboard">
              <Button>Voltar para o Painel</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const courseTitle = certificate.course_enrollments?.courses?.title || "Curso Desconhecido";
  const instructorName = certificate.course_enrollments?.courses?.instructor || "Instrutor Desconhecido";
  const studentName = certificate.course_enrollments?.profiles?.full_name || "Aluno Desconhecido";
  const completionDate = format(new Date(certificate.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex-grow container py-12 flex items-center justify-center">
        <Card className="w-full max-w-3xl p-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-primary mb-4">Certificado de Conclusão</CardTitle>
            <CardDescription className="text-lg">
              Concedido a
            </CardDescription>
            <h2 className="text-3xl font-heading font-bold mt-2 mb-4">{studentName}</h2>
            <CardDescription className="text-lg">
              pela conclusão bem-sucedida do curso
            </CardDescription>
            <h3 className="text-2xl font-semibold mt-2 mb-4">{courseTitle}</h3>
            <CardDescription className="text-md">
              ministrado por {instructorName}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 mt-6">
            <p className="text-muted-foreground">
              Em reconhecimento à dedicação e ao esforço demonstrados na aquisição de novos conhecimentos e habilidades.
            </p>
            <p className="text-sm text-gray-500">
              Data de Conclusão: {completionDate}
            </p>
            <p className="text-sm text-gray-500">
              Código de Verificação: <span className="font-mono">{certificate.verification_code}</span>
            </p>
            {certificate.file_url && (
              <Button asChild className="mt-6">
                <a href={certificate.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Baixar Certificado
                </a>
              </Button>
            )}
            <div className="mt-8">
              <Link to="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Painel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CertificateViewerPage;