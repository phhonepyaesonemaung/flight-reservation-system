import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import { API_SERVICE } from "./restApi";
import { useToken } from "@/hooks/token";

export const API_URL = process.env.API_URL;
//export const VITE_SERVER_URL = "http://localhost:4000";
const queryKey = (method, url, addition = "") => [method, url, addition];

export const useApiQuery = ({ url, enabled = true }) => {
  const { isAuthenticated: token } = useToken();
  return useQuery(
    queryKey("GET", url),
    () => API_SERVICE.get({ url, token, server: API_URL }),
    {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute in milliseconds
      enabled: enabled, // Fetch only if enabled and authenticated
    }
  );
};

interface IProps {
  url: string;
  pagination?: {
    offset?: number;
    limit: number;
  };
  params?: string;
}
// fetch infinite query for list api item
export const useInfinitApiQuery = ({
  url,
  pagination = { offset: 0, limit: 10 },
  params,
}: IProps) => {
  const { isAuthenticated: token } = useToken();
  const additionQuery = params ? `&${params}` : "";
  return useInfiniteQuery(
    queryKey("get", url, additionQuery),
    ({ pageParam = pagination.offset }) =>
      API_SERVICE.get({
        url: `${url}?offset=${+pageParam}&limit=${pagination.limit}${additionQuery}`,
        token,
        server: API_URL,
      }),

    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.data?.length < pagination.limit) {
          return undefined;
        }
        const nextPageOffset = allPages.length * pagination.limit;
        return nextPageOffset;
      },
    }
  );
};
export const useApiCreate = ({ url, action }) => {
  const { isAuthenticated: token } = useToken();
  const queryClient = useQueryClient();
  const { data, mutate, isLoading, error } = useMutation(
    (data: any) =>
      API_SERVICE.post({
        url,
        token,
        data,
        server: API_URL,
      }),
    {
      onSuccess: responseData => {
        if (action) {
          action(responseData); // Pass response data to action
        }
        queryClient.invalidateQueries(queryKey("CREATE", url));
      },
      onError: error => {
        console.log("Mutation Error:", error); // Log the error for debugging
      },
    }
  );

  return { data, mutate, loading: isLoading, error, isLoading };
};