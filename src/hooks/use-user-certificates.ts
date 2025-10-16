import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface Certificate {
  id: string;
  created_at: string;
  course_enrollments: {
    courses: {
      title: string;
    };
  };
}

export function useUserCertificates() {
  const { user } = useAuth();

  return useSupabaseQuery<Certificate[], Error>({
    queryKey: ["userCertificates", user?.id],
    queryFn: async () => {
      if (!user) return [];
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
        .eq("course_enrollments.user_id", user.id);
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user,
  });
}