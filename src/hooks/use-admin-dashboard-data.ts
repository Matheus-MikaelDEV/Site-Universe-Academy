import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/contexts/AuthContext";

interface AdminStats {
  users: number;
  courses: number;
  feedbacks: number;
}

interface Feedback {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

interface MonthlySignupData {
  month: string;
  count: number;
}

interface AdminDashboardData {
  stats: AdminStats;
  recentFeedbacks: Feedback[];
  monthlySignups: MonthlySignupData[];
}

export function useAdminDashboardData() {
  return useSupabaseQuery<AdminDashboardData, Error>({
    queryKey: ["adminDashboardData"],
    queryFn: async () => {
      // Fetch user count
      const { count: userCount, error: userCountError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (userCountError) throw userCountError;

      // Fetch course count
      const { count: courseCount, error: courseCountError } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });
      if (courseCountError) throw courseCountError;

      // Fetch feedback data
      const { data: feedbackData, count: feedbackCount, error: feedbackError } = await supabase
        .from("feedbacks")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(5);
      if (feedbackError) throw feedbackError;

      // Fetch monthly signups
      const { data: signupsData, error: signupsError } = await supabase
        .rpc<MonthlySignupData[]>('get_monthly_signups');
      if (signupsError) throw signupsError;

      return {
        stats: {
          users: userCount ?? 0,
          courses: courseCount ?? 0,
          feedbacks: feedbackCount ?? 0,
        },
        recentFeedbacks: feedbackData as Feedback[] || [],
        monthlySignups: signupsData || [],
      };
    },
  });
}