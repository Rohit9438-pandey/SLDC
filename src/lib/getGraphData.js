import { useState, useEffect } from "react";

function useFetchGraphData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async (signal) => {
      setLoading(true);
      try {
        const response = await fetch(`https://delhisldc.org/app-api/${endpoint}`, { signal });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result); // Adjust according to the API response structure
        setError(null); // Clear error on successful fetch
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    const controller = new AbortController();
    fetchData(controller.signal);

    // Cleanup abort controller on unmount
    return () => {
      controller.abort();
    };
  }, [endpoint]);

  return { data, loading, error };
}

export default useFetchGraphData;
