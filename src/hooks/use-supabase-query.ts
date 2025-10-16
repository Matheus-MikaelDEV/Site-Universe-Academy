import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

type SupabaseQueryKey = [string, ...any[]];

interface SupabaseQueryOptions<TData, TError> extends UseQueryOptions<TData, TError> {
  queryKey: SupabaseQueryKey;
  queryFn: () => Promise<TData>;
}

export function useSupabaseQuery<TData = unknown, TError = Error>(
  options: SupabaseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    queryFn: options.queryFn,
    queryKey: options.queryKey,
    ...options,
  });
}