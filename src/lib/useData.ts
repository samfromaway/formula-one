import { useState, useEffect } from 'react';

type Fetch<T> = () => Promise<{ data: T | null; errors: string | null }>;

export default function useData<T>(
  fetch: Fetch<T>,
  dependencies: string[] | []
) {
  const [data, setData] = useState<T | []>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const getData = async () => {
      const data = await fetch();

      if (data.errors) {
        setErrors(data.errors);
      } else {
        setData(data.data || []);
      }
    };
    setIsLoading(false);

    getData();

    // dependencies are passed as second argument
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, errors, isLoading };
}
