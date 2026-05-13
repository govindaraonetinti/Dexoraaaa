import { useSearchParams } from "react-router-dom";

export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = (
    newParams: Record<string, string | number | undefined>,
    options: { replace?: boolean } = { replace: true }
  ) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) {
        params.delete(key); // IMPORTANT: removes old token
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params, options);
  };

  return { updateParams };
}
