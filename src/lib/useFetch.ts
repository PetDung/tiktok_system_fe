import { useMemo } from "react";
import useSWR, { mutate } from "swr";

interface UseFetchOptions<T, P = any> {
  fetcher: (param?: P) => Promise<T>;
  key: string;
  param?: P;
  enabled?: boolean;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
}

export function useFetch<T = any, P = any>({
  fetcher,
  key,
  param,
  enabled = true,
  revalidateOnFocus = true,
  revalidateOnReconnect = true,
  refreshInterval,
}: UseFetchOptions<T, P>) {
  const swrKey = useMemo(() => {
    return param ? [key, JSON.stringify(param)] : key;
  }, [key, param]);

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<T>(enabled ? swrKey : null, () => fetcher(param), {
    revalidateOnFocus,
    revalidateOnReconnect,
    refreshInterval,
  });

  return {
    data,
    error,
    isLoading,
    refresh: () => swrMutate(),
    updateCache: (newData: T) => mutate(swrKey, newData, false),
  };
}
